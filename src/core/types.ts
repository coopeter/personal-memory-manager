/**
 * Personal Memory Manager - Core Types
 */

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Folder {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  description: string; // Used for AI auto-classification
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Document {
  id: string;
  projectId: string;
  folderId: string;
  title: string;
  content: string;
  contentType: 'inspiration' | 'discussion' | 'result';
  tags: string[];
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  vectorEmbedding?: number[];
}

export interface DailyProgress {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface TreeFolder extends Folder {
  children: TreeFolder[];
  documents: Document[];
}

export interface ProjectTree extends Project {
  folders: TreeFolder[];
}

// Content classification result
export interface ClassificationResult {
  projectId: string;
  folderId: string;
  confidence: number;
  reason: string;
}

// Search options
export interface SearchOptions {
  query?: string;
  projectId?: string;
  folderId?: string;
  tags?: string[];
  startDate?: number;
  endDate?: number;
  includeDeleted?: boolean;
  limit?: number;
}

// Storage configuration
export interface StorageConfig {
  basePath: string;
  useLanceDB: boolean;
  provider: 'local' | 'feishu';
  feishuFolderToken?: string;
}
