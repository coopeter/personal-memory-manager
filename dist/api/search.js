"use strict";
// 搜索路由 - 全文搜索 + 语义搜索
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
const index_1 = require("./index");
exports.searchRouter = express_1.default.Router();
/**
 * 混合搜索
 * GET /api/search?q=xxx
 * 或者 POST body { query: string, filters: {...} }
 */
exports.searchRouter.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const query = req.query.q || '';
        const projectId = req.query.projectId || undefined;
        const folderId = req.query.folderId || undefined;
        const results = await index_1.services.searchService.mixedSearch(query, {
            projectId,
            folderId,
        });
        // 获取完整文档信息
        const detailedResults = await Promise.all(results.map(async (result) => {
            const doc = await index_1.services.storage.getDocument(result.documentId);
            return {
                ...result,
                document: doc,
            };
        }));
        res.json({ results: detailedResults });
    }
    catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.searchRouter.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { query, filters } = req.body;
        const results = await index_1.services.searchService.mixedSearch(query, filters);
        const detailedResults = await Promise.all(results.map(async (result) => {
            const doc = await index_1.services.storage.getDocument(result.documentId);
            return {
                ...result,
                document: doc,
            };
        }));
        res.json({ results: detailedResults });
    }
    catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * 按标签筛选
 * GET /api/search/tags?tags=a,b,c
 */
exports.searchRouter.get('/tags', auth_1.authenticateToken, async (req, res) => {
    try {
        const tagsStr = req.query.tags || '';
        const tags = tagsStr.split(',').filter(t => t.length > 0);
        const projectId = req.query.projectId || undefined;
        const documents = await index_1.services.searchService.filterByTags(tags, {
            projectId,
        });
        res.json({ documents });
    }
    catch (err) {
        console.error('Tag search error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * 检查是否支持语义搜索
 */
exports.searchRouter.get('/supports-semantic', auth_1.authenticateToken, (req, res) => {
    res.json({
        supportsSemantic: index_1.services.searchService.supportsSemanticSearch(),
    });
});
