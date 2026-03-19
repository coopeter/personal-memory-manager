// 文档路由 - CRUD操作

import express from 'express';
import { authenticateToken } from './auth';
import { services } from './index';

export const documentRouter = express.Router();

// 获取单个文档
documentRouter.get('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await services.storage.getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ document });
  } catch (err) {
    console.error('Get document error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建文档
documentRouter.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, folderId, title, content, tags } = req.body;
    
    // 自动提取标签如果没提供
    let finalTags = tags || [];
    if (finalTags.length === 0) {
      finalTags = services.aiClassifier.extractTags(`${title} ${content}`);
    }

    const document = await services.storage.createDocument({
      projectId,
      folderId,
      title,
      content,
      tags: finalTags,
    });
    res.json({ document });
  } catch (err) {
    console.error('Create document error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新文档
documentRouter.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    // 如果更新了内容但没提供标签，重新提取
    if (updates.content && !updates.tags) {
      const existing = await services.storage.getDocument(req.params.id);
      if (existing) {
        const newTitle = updates.title || existing.title;
        const newContent = updates.content || existing.content;
        updates.tags = services.aiClassifier.extractTags(`${newTitle} ${newContent}`);
      }
    }
    const document = await services.storage.updateDocument(req.params.id, updates);
    res.json({ document });
  } catch (err) {
    console.error('Update document error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 软删除文档（移到回收站）
documentRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await services.storage.deleteDocument(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete document error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 恢复文档
documentRouter.post('/:id/restore', authenticateToken, async (req, res) => {
  try {
    await services.storage.restoreDocument(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Restore document error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 永久删除文档
documentRouter.delete('/:id/permanent', authenticateToken, async (req, res) => {
  try {
    await services.storage.permanentlyDeleteDocument(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Permanent delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 列出回收站文档
documentRouter.get('/trash/list', authenticateToken, async (req, res) => {
  try {
    const documents = await services.storage.listDeletedDocuments();
    res.json({ documents });
  } catch (err) {
    console.error('List trash error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 清空回收站
documentRouter.delete('/trash/empty', authenticateToken, async (req, res) => {
  try {
    await services.storage.emptyTrash();
    res.json({ success: true });
  } catch (err) {
    console.error('Empty trash error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI自动分类
documentRouter.post('/classify', authenticateToken, async (req, res) => {
  try {
    const { document, projectId } = req.body;
    const folders = await services.storage.listFolders(projectId);
    const results = await services.aiClassifier.classifyDocument(document, folders);
    res.json({ results });
  } catch (err) {
    console.error('Classify error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 移动文档到另一个文件夹
documentRouter.post('/:id/move', authenticateToken, async (req, res) => {
  try {
    const { folderId } = req.body;
    const document = await services.projectManager.moveDocument(req.params.id, folderId);
    res.json({ document });
  } catch (err) {
    console.error('Move document error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
