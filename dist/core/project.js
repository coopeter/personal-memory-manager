"use strict";
// 项目管理器 - 高级项目和文件夹操作
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectManager = void 0;
class ProjectManager {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    async initialize() {
        await this.storage.initialize();
    }
    // 获取整个项目树结构
    async getProjectTree() {
        const projects = await this.storage.listProjects();
        const folderMap = new Map();
        for (const project of projects) {
            const folders = await this.storage.listFolders(project.id);
            folderMap.set(project.id, folders);
        }
        return { projects, folders: folderMap };
    }
    // 获取文件夹路径（从根到当前）
    async getFolderPath(folderId) {
        const path = [];
        let current = await this.storage.getFolder(folderId);
        while (current) {
            path.unshift(current);
            if (current.parentId) {
                current = await this.storage.getFolder(current.parentId);
            }
            else {
                break;
            }
        }
        return path;
    }
    // 获取文件夹下所有文档
    async getFolderDocuments(folderId, includeDeleted = false) {
        const folder = await this.storage.getFolder(folderId);
        if (!folder)
            return [];
        return this.storage.listDocuments(folder.projectId, folderId, includeDeleted);
    }
    // 创建子文件夹
    async createSubfolder(projectId, parentId, name, description) {
        return this.storage.createFolder({
            projectId,
            parentId,
            name,
            description,
        });
    }
    // 移动文档到另一个文件夹
    async moveDocument(documentId, targetFolderId) {
        return this.storage.updateDocument(documentId, { folderId: targetFolderId });
    }
    // 移动文件夹（修改父文件夹）
    async moveFolder(folderId, targetParentId) {
        return this.storage.updateFolder(folderId, { parentId: targetParentId });
    }
    // 删除项目（级联删除所有文件夹和文档）
    async deleteProject(projectId) {
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
exports.ProjectManager = ProjectManager;
