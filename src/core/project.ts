// 项目管理器 - 高级项目和文件夹操作

import type { Project, Folder, Document } from './types';
import type { StorageProvider } from './storage';

export class ProjectManager {
  constructor(private storage: StorageProvider) {}

  async initialize(): Promise<void> {
    await this.storage.initialize();
  }

  // 获取整个项目树结构
  async getProjectTree(): Promise<{ projects: Project[]; folders: Map<string, Folder[]> }> {
    const projects = await this.storage.listProjects();
    const folderMap = new Map<string, Folder[]>();
    
    for (const project of projects) {
      const folders = await this.storage.listFolders(project.id);
      folderMap.set(project.id, folders);
    }
    
    return { projects, folders: folderMap };
  }

  // 获取文件夹路径（从根到当前）
  async getFolderPath(folderId: string): Promise<Folder[]> {
    const path: Folder[] = [];
    let current = await this.storage.getFolder(folderId);
    
    while (current) {
      path.unshift(current);
      if (current.parentId) {
        current = await this.storage.getFolder(current.parentId);
      } else {
        break;
      }
    }
    
    return path;
  }

  // 获取文件夹下所有文档
  async getFolderDocuments(folderId: string, includeDeleted = false): Promise<Document[]> {
    const folder = await this.storage.getFolder(folderId);
    if (!folder) return [];
    return this.storage.listDocuments(folder.projectId, folderId, includeDeleted);
  }

  // 创建子文件夹
  async createSubfolder(
    projectId: string,
    parentId: string | null,
    name: string,
    description: string
  ): Promise<Folder> {
    return this.storage.createFolder({
      projectId,
      parentId,
      name,
      description,
    });
  }

  // 移动文档到另一个文件夹
  async moveDocument(documentId: string, targetFolderId: string): Promise<Document> {
    return this.storage.updateDocument(documentId, { folderId: targetFolderId });
  }

  // 移动文件夹（修改父文件夹）
  async moveFolder(folderId: string, targetParentId: string | null): Promise<Folder> {
    return this.storage.updateFolder(folderId, { parentId: targetParentId });
  }

  // 删除项目（级联删除所有文件夹和文档）
  async deleteProject(projectId: string): Promise<void> {
    const folders = await this.storage.listFolders(projectId);
    const documents = await this.storage.listDocuments(projectId);
    
    for (const doc of documents) {
      await this.storage.deleteDocument(doc.id);
    }
    for (const folder of folders) {
      await this.storage.deleteFolder(folder.id);
    }
    
    await this.storage.deleteProject(projectId);
  }
}
