"use strict";
// 项目和文件夹路由
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
const index_1 = require("./index");
exports.projectRouter = express_1.default.Router();
// 获取所有项目树
exports.projectRouter.get('/tree', auth_1.authenticateToken, async (req, res) => {
    try {
        const tree = await index_1.services.projectManager.getProjectTree();
        res.json(tree);
    }
    catch (err) {
        console.error('Get tree error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 列出所有项目
exports.projectRouter.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const projects = await index_1.services.storage.listProjects();
        res.json({ projects });
    }
    catch (err) {
        console.error('List projects error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 获取单个项目
exports.projectRouter.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const project = await index_1.services.storage.getProject(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ project });
    }
    catch (err) {
        console.error('Get project error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 创建项目
exports.projectRouter.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name, description, parentId, tags } = req.body;
        const project = await index_1.services.storage.createProject({
            name,
            description,
            parentId: parentId || null,
            tags: tags || [],
        });
        res.json({ project });
    }
    catch (err) {
        console.error('Create project error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 更新项目
exports.projectRouter.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        const project = await index_1.services.storage.updateProject(req.params.id, updates);
        res.json({ project });
    }
    catch (err) {
        console.error('Update project error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 删除项目
exports.projectRouter.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        await index_1.services.projectManager.deleteProject(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete project error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ========== 文件夹操作 ==========
// 列出文件夹下所有文件夹
exports.projectRouter.get('/:projectId/folders', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const folders = await index_1.services.storage.listFolders(projectId);
        res.json({ folders });
    }
    catch (err) {
        console.error('List folders error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 获取文件夹路径
exports.projectRouter.get('/folders/:id/path', auth_1.authenticateToken, async (req, res) => {
    try {
        const path = await index_1.services.projectManager.getFolderPath(req.params.id);
        res.json({ path });
    }
    catch (err) {
        console.error('Get folder path error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 创建文件夹
exports.projectRouter.post('/:projectId/folders', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description, parentId } = req.body;
        const folder = await index_1.services.projectManager.createSubfolder(projectId, parentId || null, name, description);
        res.json({ folder });
    }
    catch (err) {
        console.error('Create folder error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 更新文件夹
exports.projectRouter.put('/folders/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        const folder = await index_1.services.storage.updateFolder(req.params.id, updates);
        res.json({ folder });
    }
    catch (err) {
        console.error('Update folder error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 删除文件夹
exports.projectRouter.delete('/folders/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        await index_1.services.storage.deleteFolder(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete folder error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 获取文件夹下所有文档
exports.projectRouter.get('/folders/:id/documents', auth_1.authenticateToken, async (req, res) => {
    try {
        const includeDeleted = req.query.includeDeleted === 'true';
        const documents = await index_1.services.projectManager.getFolderDocuments(req.params.id, includeDeleted);
        res.json({ documents });
    }
    catch (err) {
        console.error('List folder documents error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
