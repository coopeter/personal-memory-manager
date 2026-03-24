// 核心类型定义

export interface Project {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

export interface Document {
  id: string;
  projectId: string;
  folderId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
  deletedAt: number | null;
}

export interface Folder {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: number;
}

export interface SearchResult {
  documentId: string;
  title: string;
  snippet: string;
  score: number;
  projectId: string;
  folderId: string;
  updatedAt: number;
}

export interface ProgressEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  summary: string;
  documentIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ClassifyResult {
  folderId: string;
  confidence: number;
  reason: string;
}

// 存储配置
export interface StorageConfig {
  basePath: string;
  useLanceDB: boolean;
  embeddingModel?: string;
}

// 认证payload
export interface JWTPayload {
  userId: string;
  username: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

// 搜索过滤
export interface SearchFilter {
  projectId?: string;
  folderId?: string;
  tags?: string[];
  startDate?: number;
  endDate?: number;
  includeDeleted?: boolean;
}

// 工作区文件信息
export interface WorkspaceFileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: number;
  aiDescription?: string;
  aiTags?: string[];
}

// 工作区文件 AI 描述缓存
export interface WorkspaceFileCachedDescription {
  path: string;
  description: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
