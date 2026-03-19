// 项目和文件夹路由

import express from 'express';
import { authenticateToken } from './auth';
import { services } from './index';

export const projectRouter = express.Router();

// 获取所有项目树
projectRouter.get('/tree', authenticateToken, async (req, res) => {
  try {
    const tree = await services.projectManager.getProjectTree();
    res.json(tree);
  } catch (err) {
    console.error('Get tree error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 列出所有项目
projectRouter.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await services.storage.listProjects();
    res.json({ projects });
  } catch (err) {
    console.error('List projects error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取单个项目
projectRouter.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await services.storage.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ project });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建项目
projectRouter.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, parentId, tags } = req.body;
    const project = await services.storage.createProject({
      name,
      description,
      parentId: parentId || null,
      tags: tags || [],
    });
    res.json({ project });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新项目
projectRouter.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const project = await services.storage.updateProject(req.params.id, updates);
    res.json({ project });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除项目
projectRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await services.projectManager.deleteProject(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== 文件夹操作 ==========

// 列出文件夹下所有文件夹
projectRouter.get('/:projectId/folders', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const folders = await services.storage.listFolders(projectId);
    res.json({ folders });
  } catch (err) {
    console.error('List folders error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取文件夹路径
projectRouter.get('/folders/:id/path', authenticateToken, async (req, res) => {
  try {
    const path = await services.projectManager.getFolderPath(req.params.id);
    res.json({ path });
  } catch (err) {
    console.error('Get folder path error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建文件夹
projectRouter.post('/:projectId/folders', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, parentId } = req.body;
    const folder = await services.projectManager.createSubfolder(
      projectId,
      parentId || null,
      name,
      description
    );
    res.json({ folder });
  } catch (err) {
    console.error('Create folder error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新文件夹
projectRouter.put('/folders/:id', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const folder = await services.storage.updateFolder(req.params.id, updates);
    res.json({ folder });
  } catch (err) {
    console.error('Update folder error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除文件夹
projectRouter.delete('/folders/:id', authenticateToken, async (req, res) => {
  try {
    await services.storage.deleteFolder(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete folder error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取文件夹下所有文档
projectRouter.get('/folders/:id/documents', authenticateToken, async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const documents = await services.projectManager.getFolderDocuments(
      req.params.id,
      includeDeleted
    );
    res.json({ documents });
  } catch (err) {
    console.error('List folder documents error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
