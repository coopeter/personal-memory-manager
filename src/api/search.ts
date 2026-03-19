// 搜索路由 - 全文搜索 + 语义搜索

import express from 'express';
import { authenticateToken } from './auth';
import { services } from './index';

export const searchRouter = express.Router();

/**
 * 混合搜索
 * GET /api/search?q=xxx
 * 或者 POST body { query: string, filters: {...} }
 */
searchRouter.get('/', authenticateToken, async (req, res) => {
  try {
    const query = req.query.q as string || '';
    const projectId = req.query.projectId as string || undefined;
    const folderId = req.query.folderId as string || undefined;
    
    const results = await services.searchService.mixedSearch(query, {
      projectId,
      folderId,
    });
    
    // 获取完整文档信息
    const detailedResults = await Promise.all(
      results.map(async result => {
        const doc = await services.storage.getDocument(result.documentId);
        return {
          ...result,
          document: doc,
        };
      })
    );
    
    res.json({ results: detailedResults });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

searchRouter.post('/', authenticateToken, async (req, res) => {
  try {
    const { query, filters } = req.body;
    const results = await services.searchService.mixedSearch(query, filters);
    
    const detailedResults = await Promise.all(
      results.map(async result => {
        const doc = await services.storage.getDocument(result.documentId);
        return {
          ...result,
          document: doc,
        };
      })
    );
    
    res.json({ results: detailedResults });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 按标签筛选
 * GET /api/search/tags?tags=a,b,c
 */
searchRouter.get('/tags', authenticateToken, async (req, res) => {
  try {
    const tagsStr = req.query.tags as string || '';
    const tags = tagsStr.split(',').filter(t => t.length > 0);
    const projectId = req.query.projectId as string || undefined;
    
    const documents = await services.searchService.filterByTags(tags, {
      projectId,
    });
    
    res.json({ documents });
  } catch (err) {
    console.error('Tag search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 检查是否支持语义搜索
 */
searchRouter.get('/supports-semantic', authenticateToken, (req, res) => {
  res.json({
    supportsSemantic: services.searchService.supportsSemanticSearch(),
  });
});
