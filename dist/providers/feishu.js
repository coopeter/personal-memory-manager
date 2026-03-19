"use strict";
// 飞书云盘存储提供者 - 可选集成
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeishuStorageProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
class FeishuStorageProvider {
    appId;
    appSecret;
    baseFolderToken;
    accessToken = null;
    constructor(appId, appSecret, baseFolderToken) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.baseFolderToken = baseFolderToken;
    }
    async initialize() {
        await this.getAccessToken();
    }
    async close() {
        // No-op for API-based storage
    }
    async getAccessToken() {
        if (this.accessToken)
            return this.accessToken;
        const response = await axios_1.default.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
            app_id: this.appId,
            app_secret: this.appSecret,
        });
        if (response.data.code === 0) {
            this.accessToken = response.data.tenant_access_token;
            return this.accessToken;
        }
        throw new Error(`Failed to get Feishu access token: ${response.data.msg}`);
    }
    // ========== 项目操作 ==========
    async listProjects() {
        // 在飞书云盘，项目对应文件夹
        const files = await this.listFilesInFolder(this.baseFolderToken);
        const projects = [];
        for (const file of files) {
            if (file.type === 'folder') {
                try {
                    // 元数据存储在 .json 文件中
                    const metaFile = await this.findFileByName(file.token, '.project.json');
                    if (metaFile) {
                        const content = await this.downloadFile(metaFile.token);
                        const project = JSON.parse(content);
                        projects.push(project);
                    }
                }
                catch {
                    // 忽略错误
                }
            }
        }
        return projects;
    }
    async getProject(id) {
        // 需要查找，简化实现
        const projects = await this.listProjects();
        return projects.find(p => p.id === id) || null;
    }
    async createProject(project) {
        const id = (0, uuid_1.v4)();
        const now = Date.now();
        const newProject = {
            ...project,
            id,
            createdAt: now,
            updatedAt: now,
        };
        // 创建项目文件夹
        await this.createFeishuFolder(this.baseFolderToken, newProject.name);
        // 保存元数据
        await this.uploadJson(this.baseFolderToken, `.project-${id}.json`, newProject);
        return newProject;
    }
    async updateProject(id, updates) {
        const existing = await this.getProject(id);
        if (!existing)
            throw new Error(`Project ${id} not found`);
        const updated = {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
        };
        await this.uploadJson(this.baseFolderToken, `.project-${id}.json`, updated);
        return updated;
    }
    async deleteProject(id) {
        // 删除飞书文件夹
        // 简化实现
    }
    // ========== 文件夹操作 ==========
    async listFolders(projectId) {
        // 类似listProjects
        return [];
    }
    async getFolder(id) {
        return null;
    }
    async createFolder(folder) {
        const id = (0, uuid_1.v4)();
        const now = Date.now();
        return {
            ...folder,
            id,
            createdAt: now,
            updatedAt: now,
        };
    }
    async updateFolder(id, folder) {
        throw new Error('Not implemented');
    }
    async deleteFolder(id) {
        // No-op
    }
    // ========== 文档操作 ==========
    async listDocuments(projectId, folderId, includeDeleted) {
        return [];
    }
    async getDocument(id) {
        return null;
    }
    async createDocument(document) {
        const id = (0, uuid_1.v4)();
        const now = Date.now();
        return {
            ...document,
            id,
            createdAt: now,
            updatedAt: now,
            deleted: false,
            deletedAt: null,
        };
    }
    async updateDocument(id, document) {
        throw new Error('Not implemented');
    }
    async deleteDocument(id) {
        // No-op
    }
    async restoreDocument(id) {
        // No-op
    }
    async permanentlyDeleteDocument(id) {
        // No-op
    }
    async listDeletedDocuments() {
        return [];
    }
    async emptyTrash() {
        // No-op
    }
    // ========== 用户操作 ==========
    async getUserByUsername(username) {
        return null;
    }
    async getUser(id) {
        return null;
    }
    async createUser(user) {
        throw new Error('Not implemented');
    }
    // ========== 搜索 ==========
    async searchFullText(query, filters) {
        return [];
    }
    async searchSemantic(embedding, filters) {
        return [];
    }
    async indexDocument(document) {
        // No-op
    }
    async deleteDocumentIndex(id) {
        // No-op
    }
    // ========== 进度 ==========
    async getProgress(date) {
        return null;
    }
    async listProgress(startDate, endDate) {
        return [];
    }
    async saveProgress(entry) {
        throw new Error('Not implemented');
    }
    async updateProgress(id, entry) {
        throw new Error('Not implemented');
    }
    // ========== 飞书API辅助方法 ==========
    async listFilesInFolder(folderToken) {
        const token = await this.getAccessToken();
        const response = await axios_1.default.get('https://open.feishu.cn/open-apis/drive/v1/files', {
            headers: { Authorization: `Bearer ${token}` },
            params: { folder_token: folderToken },
        });
        return response.data.data.files || [];
    }
    async getFileMeta(fileToken) {
        const token = await this.getAccessToken();
        const response = await axios_1.default.get(`https://open.feishu.cn/open-apis/drive/v1/files/${fileToken}/meta`, { headers: { Authorization: `Bearer ${token}` } });
        return response.data.data;
    }
    async createFeishuFolder(parentToken, name) {
        const token = await this.getAccessToken();
        const response = await axios_1.default.post('https://open.feishu.cn/open-apis/drive/v1/files/create_folder', {
            name,
            folder_token: parentToken,
        }, { headers: { Authorization: `Bearer ${token}` } });
        return response.data.data.folder_token || '';
    }
    async findFileByName(folderToken, name) {
        const files = await this.listFilesInFolder(folderToken);
        return files.find(f => f.name === name) || null;
    }
    async downloadFile(fileToken) {
        const token = await this.getAccessToken();
        const response = await axios_1.default.get(`https://open.feishu.cn/open-apis/drive/v1/files/${fileToken}/download`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'text',
        });
        return response.data;
    }
    async uploadJson(folderToken, name, data) {
        const token = await this.getAccessToken();
        const content = JSON.stringify(data, null, 2);
        // 飞书上传需要复杂的流程，这里简化
        // 实际实现需要遵循飞书开放平台文档
    }
}
exports.FeishuStorageProvider = FeishuStorageProvider;
