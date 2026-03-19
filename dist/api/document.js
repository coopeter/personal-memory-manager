"use strict";
// 文档路由 - CRUD操作
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
const index_1 = require("./index");
exports.documentRouter = express_1.default.Router();
// 获取单个文档
exports.documentRouter.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const document = await index_1.services.storage.getDocument(req.params.id);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json({ document });
    }
    catch (err) {
        console.error('Get document error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 创建文档
exports.documentRouter.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId, folderId, title, content, tags } = req.body;
        // 自动提取标签如果没提供
        let finalTags = tags || [];
        if (finalTags.length === 0) {
            finalTags = index_1.services.aiClassifier.extractTags(`${title} ${content}`);
        }
        const document = await index_1.services.storage.createDocument({
            projectId,
            folderId,
            title,
            content,
            tags: finalTags,
        });
        res.json({ document });
    }
    catch (err) {
        console.error('Create document error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 更新文档
exports.documentRouter.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        // 如果更新了内容但没提供标签，重新提取
        if (updates.content && !updates.tags) {
            const existing = await index_1.services.storage.getDocument(req.params.id);
            if (existing) {
                const newTitle = updates.title || existing.title;
                const newContent = updates.content || existing.content;
                updates.tags = index_1.services.aiClassifier.extractTags(`${newTitle} ${newContent}`);
            }
        }
        const document = await index_1.services.storage.updateDocument(req.params.id, updates);
        res.json({ document });
    }
    catch (err) {
        console.error('Update document error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 软删除文档（移到回收站）
exports.documentRouter.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        await index_1.services.storage.deleteDocument(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete document error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 恢复文档
exports.documentRouter.post('/:id/restore', auth_1.authenticateToken, async (req, res) => {
    try {
        await index_1.services.storage.restoreDocument(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Restore document error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 永久删除文档
exports.documentRouter.delete('/:id/permanent', auth_1.authenticateToken, async (req, res) => {
    try {
        await index_1.services.storage.permanentlyDeleteDocument(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Permanent delete error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 列出回收站文档
exports.documentRouter.get('/trash/list', auth_1.authenticateToken, async (req, res) => {
    try {
        const documents = await index_1.services.storage.listDeletedDocuments();
        res.json({ documents });
    }
    catch (err) {
        console.error('List trash error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 清空回收站
exports.documentRouter.delete('/trash/empty', auth_1.authenticateToken, async (req, res) => {
    try {
        await index_1.services.storage.emptyTrash();
        res.json({ success: true });
    }
    catch (err) {
        console.error('Empty trash error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// AI自动分类
exports.documentRouter.post('/classify', auth_1.authenticateToken, async (req, res) => {
    try {
        const { document, projectId } = req.body;
        const folders = await index_1.services.storage.listFolders(projectId);
        const results = await index_1.services.aiClassifier.classifyDocument(document, folders);
        res.json({ results });
    }
    catch (err) {
        console.error('Classify error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 移动文档到另一个文件夹
exports.documentRouter.post('/:id/move', auth_1.authenticateToken, async (req, res) => {
    try {
        const { folderId } = req.body;
        const document = await index_1.services.projectManager.moveDocument(req.params.id, folderId);
        res.json({ document });
    }
    catch (err) {
        console.error('Move document error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
