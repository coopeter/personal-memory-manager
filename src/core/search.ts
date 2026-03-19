// 搜索服务 - 全文搜索 + 语义搜索

import type { Document, SearchResult, SearchFilter } from './types';
import type { StorageProvider } from './storage';
import type { Connection, Table } from '@lancedb/lancedb';
import { OpenAIEmbeddingFunction } from '@lancedb/lancedb/embedding/openai';

export class SearchService {
  private embeddingFunction: OpenAIEmbeddingFunction | null = null;

  constructor(
    private storage: StorageProvider,
    private openaiApiKey?: string
  ) {
    if (openaiApiKey) {
      this.embeddingFunction = new OpenAIEmbeddingFunction({
        apiKey: openaiApiKey,
        model: 'text-embedding-3-small',
      });
    }
  }

  /**
   * 混合搜索：同时进行全文搜索和语义搜索
   */
  async mixedSearch(
    query: string,
    filters?: SearchFilter
  ): Promise<SearchResult[]> {
    const fullTextResults = await this.storage.searchFullText(query, filters);
    
    if (this.embeddingFunction && this.supportsSemanticSearch()) {
      // 生成查询嵌入
      const embedding = await this.embeddingFunction.embedText(query);
      const semanticResults = await this.storage.searchSemantic(embedding, filters);
      
      // 合并结果，去重，按分数排序
      const combined = new Map<string, SearchResult>();
      
      for (const result of fullTextResults.concat(semanticResults)) {
        const existing = combined.get(result.documentId);
        if (!existing || result.score > existing.score) {
          combined.set(result.documentId, result);
        }
      }
      
      return Array.from(combined.values()).sort((a, b) => b.score - a.score);
    }
    
    return fullTextResults;
  }

  /**
   * 检查是否支持语义搜索
   */
  supportsSemanticSearch(): boolean {
    return this.embeddingFunction !== null;
  }

  /**
   * 按标签筛选
   */
  async filterByTags(
    tags: string[],
    filters?: SearchFilter
  ): Promise<Document[]> {
    // 实际筛选由存储层实现
    // 这里可以添加额外的标签处理逻辑
    const results = await this.storage.searchFullText('', {
      ...filters,
      tags,
    });
    
    // 需要转换回文档，这里简化处理
    // 实际应该让存储层返回文档列表
    const documents: Document[] = [];
    for (const result of results) {
      const doc = await this.storage.getDocument(result.documentId);
      if (doc) documents.push(doc);
    }
    
    return documents;
  }
}
