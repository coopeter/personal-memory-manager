// 存储层抽象 - 定义存储接口

import type { Project, Document, Folder, User, SearchResult, ProgressEntry, WorkspaceFileCachedDescription } from './types';

export interface StorageProvider {
  // 项目操作
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // 文件夹操作
  listFolders(projectId: string): Promise<Folder[]>;
  getFolder(id: string): Promise<Folder | null>;
  createFolder(folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Folder>;
  updateFolder(id: string, folder: Partial<Folder>): Promise<Folder>;
  deleteFolder(id: string): Promise<void>;

  // 文档操作
  listDocuments(projectId: string, folderId?: string, includeDeleted?: boolean): Promise<Document[]>;
  getDocument(id: string): Promise<Document | null>;
  createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'deletedAt'>): Promise<Document>;
  updateDocument(id: string, document: Partial<Document>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  restoreDocument(id: string): Promise<void>;
  permanentlyDeleteDocument(id: string): Promise<void>;
  listDeletedDocuments(): Promise<Document[]>;
  emptyTrash(): Promise<void>;

  // 用户操作
  getUserByUsername(username: string): Promise<User | null>;
  getUser(id: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  updateUserPassword(id: string, newPasswordHash: string): Promise<User>;

  // 搜索
  searchFullText(query: string, filters?: SearchFilter): Promise<SearchResult[]>;
  searchSemantic(embedding: number[], filters?: SearchFilter): Promise<SearchResult[]>;
  indexDocument(document: Document): Promise<void>;
  deleteDocumentIndex(id: string): Promise<void>;

  // 进度记录
  getProgress(date: string): Promise<ProgressEntry | null>;
  listProgress(startDate: string, endDate: string): Promise<ProgressEntry[]>;
  saveProgress(entry: Omit<ProgressEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProgressEntry>;
  updateProgress(id: string, entry: Partial<ProgressEntry>): Promise<ProgressEntry>;

  // 工作区 AI 描述缓存
  getWorkspaceCachedDescription(path: string): Promise<WorkspaceFileCachedDescription | null>;
  saveWorkspaceCachedDescription(path: string, description: string, tags: string[]): Promise<WorkspaceFileCachedDescription>;

  // 初始化
  initialize(): Promise<void>;
  close(): Promise<void>;
}

export interface SearchFilter {
  projectId?: string;
  folderId?: string;
  tags?: string[];
  startDate?: number;
  endDate?: number;
  includeDeleted?: boolean;
}
