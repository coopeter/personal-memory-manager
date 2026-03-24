"use strict";
// 工作区浏览器 API - 只读浏览 OpenClaw 工作区文件
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceRouter = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("./auth");
const index_1 = require("./index");
exports.workspaceRouter = express_1.default.Router();
const WORKSPACE_ROOT = process.env.WORKSPACE_PATH || '/root/.openclaw/workspace';
const ENABLED = process.env.ENABLE_WORKSPACE_BROWSER !== 'false';
/**
 * 安全校验：确保请求的路径在 WORKSPACE_ROOT 范围内，防止目录遍历攻击
 */
function sanitizePath(requestedPath) {
    const normalized = path_1.default.normalize(requestedPath);
    // 防止 ../ 遍历
    if (normalized.includes('..')) {
        return null;
    }
    const fullPath = path_1.default.join(WORKSPACE_ROOT, normalized);
    // 确保最终路径仍在 WORKSPACE_ROOT 下
    if (!fullPath.startsWith(WORKSPACE_ROOT)) {
        return null;
    }
    return fullPath;
}
/**
 * 列出指定路径下的文件和文件夹
 * GET /api/workspace/browse?path=/
 */
exports.workspaceRouter.get('/browse', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    if (!ENABLED) {
        return res.status(501).json({ error: 'Workspace browser is disabled' });
    }
    const requestedPath = req.query.path || '';
    const fullPath = sanitizePath(requestedPath);
    if (fullPath === null) {
        return res.status(400).json({ error: 'Invalid path' });
    }
    try {
        if (!fs_1.default.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Path not found' });
        }
        const stat = fs_1.default.statSync(fullPath);
        if (!stat.isDirectory()) {
            return res.status(400).json({ error: 'Not a directory' });
        }
        const entries = fs_1.default.readdirSync(fullPath);
        const files = entries.map(name => {
            const entryPath = path_1.default.join(fullPath, name);
            const entryStat = fs_1.default.statSync(entryPath);
            const relativePath = path_1.default.relative(WORKSPACE_ROOT, entryPath);
            return {
                name,
                path: relativePath,
                isDirectory: entryStat.isDirectory(),
                size: entryStat.size,
                modifiedTime: entryStat.mtimeMs,
            };
        });
        // Sort: directories first, then files alphabetically
        files.sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) {
                return a.isDirectory ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
        res.json({
            path: requestedPath || '/',
            files,
        });
    }
    catch (err) {
        console.error('Browse error:', err);
        res.status(500).json({ error: 'Failed to browse directory' });
    }
});
/**
 * 获取文本文件内容
 * GET /api/workspace/file?path=/path/to/file
 */
exports.workspaceRouter.get('/file', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    if (!ENABLED) {
        return res.status(501).json({ error: 'Workspace browser is disabled' });
    }
    const requestedPath = req.query.path;
    if (!requestedPath) {
        return res.status(400).json({ error: 'Path is required' });
    }
    const fullPath = sanitizePath(requestedPath);
    if (fullPath === null) {
        return res.status(400).json({ error: 'Invalid path' });
    }
    try {
        if (!fs_1.default.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        const stat = fs_1.default.statSync(fullPath);
        if (stat.isDirectory()) {
            return res.status(400).json({ error: 'Cannot read directory as file' });
        }
        // Check file size - don't read very large files
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB max
        if (stat.size > MAX_SIZE) {
            return res.status(413).json({ error: 'File too large to display' });
        }
        const content = fs_1.default.readFileSync(fullPath, 'utf-8');
        const extension = path_1.default.extname(fullPath).toLowerCase();
        res.json({
            path: requestedPath,
            content,
            extension,
            size: stat.size,
            modifiedTime: stat.mtimeMs,
        });
    }
    catch (err) {
        console.error('Read file error:', err);
        res.status(500).json({ error: 'Failed to read file' });
    }
});
/**
 * 获取文件/目录统计信息
 * GET /api/workspace/stats?path=/path
 */
exports.workspaceRouter.get('/stats', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    if (!ENABLED) {
        return res.status(501).json({ error: 'Workspace browser is disabled' });
    }
    const requestedPath = req.query.path;
    if (!requestedPath) {
        return res.status(400).json({ error: 'Path is required' });
    }
    const fullPath = sanitizePath(requestedPath);
    if (fullPath === null) {
        return res.status(400).json({ error: 'Invalid path' });
    }
    try {
        if (!fs_1.default.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Path not found' });
        }
        const stat = fs_1.default.statSync(fullPath);
        res.json({
            path: requestedPath,
            isDirectory: stat.isDirectory(),
            size: stat.size,
            modifiedTime: stat.mtimeMs,
            createdTime: stat.birthtimeMs,
        });
    }
    catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});
/**
 * 为文件生成 AI 描述和标签
 * POST /api/workspace/describe
 * { path: string }
 */
exports.workspaceRouter.post('/describe', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    if (!ENABLED) {
        return res.status(501).json({ error: 'Workspace browser is disabled' });
    }
    const { path: requestedPath } = req.body;
    if (!requestedPath) {
        return res.status(400).json({ error: 'Path is required' });
    }
    const fullPath = sanitizePath(requestedPath);
    if (fullPath === null) {
        return res.status(400).json({ error: 'Invalid path' });
    }
    try {
        if (!fs_1.default.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        const stat = fs_1.default.statSync(fullPath);
        if (stat.isDirectory()) {
            return res.status(400).json({ error: 'Can only describe files, not directories' });
        }
        // Check file size
        const MAX_SIZE = 500 * 1024; // 500KB max for AI analysis
        if (stat.size > MAX_SIZE) {
            return res.status(413).json({ error: 'File too large for AI analysis' });
        }
        // Check if OpenAI is configured
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            return res.status(501).json({ error: 'AI description requires OPENAI_API_KEY configuration' });
        }
        // Read file content (truncate if too long)
        let content = fs_1.default.readFileSync(fullPath, 'utf-8');
        const MAX_CONTENT = 10000; // ~10k tokens max
        if (content.length > MAX_CONTENT) {
            content = content.slice(0, MAX_CONTENT) + '\n... (truncated)';
        }
        const fileName = path_1.default.basename(fullPath);
        const prompt = `
Please analyze this file from an OpenClaw workspace and provide:
1. A concise 1-2 sentence description of what this file is for and what it contains
2. 3-8 relevant tags as keywords

File: ${fileName}
Content:
${content}

Respond in JSON format only:
{
  "description": "your description here",
  "tags": ["tag1", "tag2", "tag3"]
}
`;
        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
            }),
        });
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        const data = await response.json();
        const aiResponse = data.choices[0].message.content.trim();
        // Parse JSON response
        let result;
        try {
            result = JSON.parse(aiResponse);
        }
        catch (e) {
            // If JSON parsing fails, try to extract from markdown code block
            const jsonMatch = aiResponse.match(/```json\n([\s\S]*)\n```/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[1]);
            }
            else {
                throw new Error('Failed to parse AI response as JSON');
            }
        }
        // Save to cache
        await index_1.services.storage.saveWorkspaceCachedDescription(requestedPath, result.description, result.tags);
        res.json({
            path: requestedPath,
            description: result.description,
            tags: result.tags,
        });
    }
    catch (err) {
        console.error('AI describe error:', err);
        res.status(500).json({ error: `Failed to generate description: ${err.message}` });
    }
});
/**
 * 获取缓存的 AI 描述
 * GET /api/workspace/describe/cached?path=/path/to/file
 */
exports.workspaceRouter.get('/describe/cached', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    if (!ENABLED) {
        return res.status(501).json({ error: 'Workspace browser is disabled' });
    }
    const requestedPath = req.query.path;
    if (!requestedPath) {
        return res.status(400).json({ error: 'Path is required' });
    }
    // We don't need full path sanitization here since we're just reading cache
    // But still validate it doesn't contain ..
    if (requestedPath.includes('..')) {
        return res.status(400).json({ error: 'Invalid path' });
    }
    try {
        const cached = await index_1.services.storage.getWorkspaceCachedDescription(requestedPath);
        if (!cached) {
            return res.status(404).json({ error: 'No cached description found' });
        }
        res.json(cached);
    }
    catch (err) {
        console.error('Get cached description error:', err);
        res.status(500).json({ error: 'Failed to get cached description' });
    }
});
