// 本地文件系统存储提供者

import * as fs from 'fs';
import * as path from 'path';
import { connect, type Connection, Table } from '@lancedb/lancedb';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import type { 
  Project, Document, Folder, User, SearchResult, ProgressEntry, StorageConfig, SearchFilter,
  WorkspaceFileCachedDescription
} from '../core/types';
import type { StorageProvider } from '../core/storage';

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;
  private db: Connection | null = null;
  private table: Table | null = null;
  private useLanceDB: boolean;

  constructor(config: StorageConfig) {
    this.basePath = config.basePath;
    this.useLanceDB = config.useLanceDB;
  }

  async initialize(): Promise<void> {
    // 创建基础目录结构
    await this.ensureDir(this.basePath);
    await this.ensureDir(path.join(this.basePath, 'projects'));
    await this.ensureDir(path.join(this.basePath, 'documents'));
    await this.ensureDir(path.join(this.basePath, 'folders'));
    await this.ensureDir(path.join(this.basePath, 'users'));
    await this.ensureDir(path.join(this.basePath, 'progress'));
    await this.ensureDir(path.join(this.basePath, 'lancedb'));
    await this.ensureDir(path.join(this.basePath, 'workspace-cache'));

    // 初始化LanceDB
    if (this.useLanceDB) {
      this.db = await connect(path.join(this.basePath, 'lancedb'));
      // 创建表 schema
      const schema = [
        { name: 'id', type: 'string' },
        { name: 'documentId', type: 'string' },
        { name: 'projectId', type: 'string' },
        { name: 'folderId', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'vector', type: 'fixed_size_list<1536:f>' },
      ];
      // 这里简化处理
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
    }
  }

  // ========== 项目操作 ==========
  async listProjects(): Promise<Project[]> {
    return this.listJsonFiles<Project>(path.join(this.basePath, 'projects'));
  }

  async getProject(id: string): Promise<Project | null> {
    return this.readJson<Project>(path.join(this.basePath, 'projects', `${id}.json`));
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const id = uuidv4();
    const now = Date.now();
    const newProject: Project = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await this.writeJson(path.join(this.basePath, 'projects', `${id}.json`), newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const existing = await this.getProject(id);
    if (!existing) throw new Error(`Project ${id} not found`);
    const updated: Project = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    await this.writeJson(path.join(this.basePath, 'projects', `${id}.json`), updated);
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await this.deleteIfExists(path.join(this.basePath, 'projects', `${id}.json`));
  }

  // ========== 文件夹操作 ==========
  async listFolders(projectId: string): Promise<Folder[]> {
    const allFolders = await this.listJsonFiles<Folder>(path.join(this.basePath, 'folders'));
    return allFolders.filter(f => f.projectId === projectId);
  }

  async getFolder(id: string): Promise<Folder | null> {
    return this.readJson<Folder>(path.join(this.basePath, 'folders', `${id}.json`));
  }

  async createFolder(folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Folder> {
    const id = uuidv4();
    const now = Date.now();
    const newFolder: Folder = {
      ...folder,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await this.writeJson(path.join(this.basePath, 'folders', `${id}.json`), newFolder);
    return newFolder;
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    const existing = await this.getFolder(id);
    if (!existing) throw new Error(`Folder ${id} not found`);
    const updated: Folder = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    await this.writeJson(path.join(this.basePath, 'folders', `${id}.json`), updated);
    return updated;
  }

  async deleteFolder(id: string): Promise<void> {
    await this.deleteIfExists(path.join(this.basePath, 'folders', `${id}.json`));
  }

  // ========== 文档操作 ==========
  async listDocuments(projectId: string, folderId?: string, includeDeleted = false): Promise<Document[]> {
    const allDocs = await this.listJsonFiles<Document>(path.join(this.basePath, 'documents'));
    return allDocs.filter(d => {
      if (d.projectId !== projectId) return false;
      if (folderId && d.folderId !== folderId) return false;
      if (!includeDeleted && d.deleted) return false;
      return true;
    });
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.readJson<Document>(path.join(this.basePath, 'documents', `${id}.json`));
  }

  async createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'deletedAt'>): Promise<Document> {
    const id = uuidv4();
    const now = Date.now();
    const newDocument: Document = {
      ...document,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      deletedAt: null,
    };
    await this.writeJson(path.join(this.basePath, 'documents', `${id}.json`), newDocument);
    await this.indexDocument(newDocument);
    return newDocument;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const existing = await this.getDocument(id);
    if (!existing) throw new Error(`Document ${id} not found`);
    const updated: Document = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    // 如果是软删除
    if (updates.deleted && !existing.deleted) {
      updated.deletedAt = Date.now();
    }
    await this.writeJson(path.join(this.basePath, 'documents', `${id}.json`), updated);
    if (updated.deleted) {
      await this.deleteDocumentIndex(id);
    } else {
      await this.indexDocument(updated);
    }
    return updated;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.updateDocument(id, { deleted: true });
  }

  async restoreDocument(id: string): Promise<void> {
    await this.updateDocument(id, { deleted: false, deletedAt: null });
  }

  async permanentlyDeleteDocument(id: string): Promise<void> {
    await this.deleteDocumentIndex(id);
    await this.deleteIfExists(path.join(this.basePath, 'documents', `${id}.json`));
  }

  async listDeletedDocuments(): Promise<Document[]> {
    const allDocs = await this.listJsonFiles<Document>(path.join(this.basePath, 'documents'));
    return allDocs.filter(d => d.deleted);
  }

  async emptyTrash(): Promise<void> {
    const deleted = await this.listDeletedDocuments();
    for (const doc of deleted) {
      await this.permanentlyDeleteDocument(doc.id);
    }
  }

  // ========== 用户操作 ==========
  async getUserByUsername(username: string): Promise<User | null> {
    const allUsers = await this.listJsonFiles<User>(path.join(this.basePath, 'users'));
    return allUsers.find(u => u.username === username) || null;
  }

  async getUser(id: string): Promise<User | null> {
    return this.readJson<User>(path.join(this.basePath, 'users', `${id}.json`));
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = uuidv4();
    const now = Date.now();
    const passwordHash = await bcrypt.hash(user.passwordHash, 10);
    const newUser: User = {
      ...user,
      id,
      passwordHash,
      createdAt: now,
    };
    await this.writeJson(path.join(this.basePath, 'users', `${id}.json`), newUser);
    return newUser;
  }

  // ========== 搜索 ==========
  async searchFullText(query: string, filters?: SearchFilter): Promise<SearchResult[]> {
    const allDocs = await this.listJsonFiles<Document>(path.join(this.basePath, 'documents'));
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const doc of allDocs) {
      // 应用筛选
      if (!this.applyFilter(doc, filters)) continue;
      if (doc.deleted && (!filters?.includeDeleted)) continue;

      // 简单全文搜索匹配
      let score = 0;
      if (doc.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      if (doc.content.toLowerCase().includes(queryLower)) {
        const matches = doc.content.toLowerCase().match(new RegExp(queryLower, 'g'));
        score += matches ? matches.length : 1;
      }

      if (score > 0 || query === '') {
        // 生成摘要
        const snippet = this.generateSnippet(doc.content, queryLower);
        results.push({
          documentId: doc.id,
          title: doc.title,
          snippet,
          score,
          projectId: doc.projectId,
          folderId: doc.folderId,
          updatedAt: doc.updatedAt,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  async searchSemantic(embedding: number[], filters?: SearchFilter): Promise<SearchResult[]> {
    // 这里需要LanceDB支持，简化实现
    // 实际会用LanceDB的向量搜索
    return [];
  }

  async indexDocument(document: Document): Promise<void> {
    // 嵌入并存储到LanceDB
    // 简化实现
  }

  async deleteDocumentIndex(id: string): Promise<void> {
    // 从LanceDB删除
    // 简化实现
  }

  // ========== 进度记录 ==========
  async getProgress(date: string): Promise<ProgressEntry | null> {
    return this.readJson<ProgressEntry>(path.join(this.basePath, 'progress', `${date}.json`));
  }

  async listProgress(startDate: string, endDate: string): Promise<ProgressEntry[]> {
    const all = await this.listJsonFiles<ProgressEntry>(path.join(this.basePath, 'progress'));
    return all.filter((p: ProgressEntry) => p.date >= startDate && p.date <= endDate);
  }

  async saveProgress(entry: Omit<ProgressEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProgressEntry> {
    const id = uuidv4();
    const now = Date.now();
    const newEntry: ProgressEntry = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await this.writeJson(path.join(this.basePath, 'progress', `${entry.date}.json`), newEntry);
    return newEntry;
  }

  async updateProgress(id: string, updates: Partial<ProgressEntry>): Promise<ProgressEntry> {
    // 需要获取date，这里简化：读取所有找到第一个匹配的id
    const all = await this.listJsonFiles<ProgressEntry>(path.join(this.basePath, 'progress'));
    const existing = all.find(p => p.id === id);
    if (!existing) throw new Error(`Progress ${id} not found`);
    const updated: ProgressEntry = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    await this.writeJson(path.join(this.basePath, 'progress', `${updated.date}.json`), updated);
    return updated;
  }

  // ========== 辅助方法 ==========
  private applyFilter(doc: Document, filters?: SearchFilter): boolean {
    if (!filters) return true;
    if (filters.projectId && doc.projectId !== filters.projectId) return false;
    if (filters.folderId && doc.folderId !== filters.folderId) return false;
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.every(t => doc.tags.includes(t))) return false;
    }
    if (filters.startDate && doc.createdAt < filters.startDate) return false;
    if (filters.endDate && doc.createdAt > filters.endDate) return false;
    return true;
  }

  private generateSnippet(content: string, query: string): string {
    if (!query) return content.slice(0, 200) + (content.length > 200 ? '...' : '');
    
    const index = content.toLowerCase().indexOf(query);
    if (index === -1) return content.slice(0, 200) + (content.length > 200 ? '...' : '');
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    let snippet = content.slice(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    return snippet;
  }

  private async ensureDir(dir: string): Promise<void> {
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }

  private async readJson<T>(filePath: string): Promise<T | null> {
    if (!fs.existsSync(filePath)) return null;
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  private async writeJson(filePath: string, data: any): Promise<void> {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  private async listJsonFiles<T>(dir: string): Promise<T[]> {
    if (!fs.existsSync(dir)) return [];
    const files = await fs.promises.readdir(dir);
    const results: T[] = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await this.readJson<T>(path.join(dir, file));
        if (data) results.push(data);
      }
    }
    return results;
  }

  private async deleteIfExists(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  // ========== 用户更新密码 ==========
  async updateUserPassword(id: string, newPasswordHash: string): Promise<User> {
    const existing = await this.getUser(id);
    if (!existing) throw new Error(`User ${id} not found`);
    const updated: User = {
      ...existing,
      passwordHash: await bcrypt.hash(newPasswordHash, 10),
    };
    await this.writeJson(path.join(this.basePath, 'users', `${id}.json`), updated);
    return updated;
  }

  // ========== 工作区 AI 描述缓存 ==========
  private getCacheFilePath(filePath: string): string {
    // 路径中替换 / 为 _ 作为文件名
    const safeName = filePath.replace(/\//g, '_').replace(/\\/g, '_').replace(/:/g, '_');
    return path.join(this.basePath, 'workspace-cache', `${safeName}.json`);
  }

  async getWorkspaceCachedDescription(filePath: string): Promise<WorkspaceFileCachedDescription | null> {
    return this.readJson<WorkspaceFileCachedDescription>(this.getCacheFilePath(filePath));
  }

  async saveWorkspaceCachedDescription(filePath: string, description: string, tags: string[]): Promise<WorkspaceFileCachedDescription> {
    const existing = await this.getWorkspaceCachedDescription(filePath);
    const now = Date.now();
    const entry: WorkspaceFileCachedDescription = {
      path: filePath,
      description,
      tags,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    await this.writeJson(this.getCacheFilePath(filePath), entry);
    return entry;
  }
}
