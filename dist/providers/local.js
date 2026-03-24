"use strict";
// 本地文件系统存储提供者
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageProvider = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const lancedb_1 = require("@lancedb/lancedb");
const uuid_1 = require("uuid");
const bcrypt = __importStar(require("bcrypt"));
class LocalStorageProvider {
    basePath;
    db = null;
    table = null;
    useLanceDB;
    constructor(config) {
        this.basePath = config.basePath;
        this.useLanceDB = config.useLanceDB;
    }
    async initialize() {
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
            this.db = await (0, lancedb_1.connect)(path.join(this.basePath, 'lancedb'));
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
    async close() {
        if (this.db) {
            await this.db.close();
        }
    }
    // ========== 项目操作 ==========
    async listProjects() {
        return this.listJsonFiles(path.join(this.basePath, 'projects'));
    }
    async getProject(id) {
        return this.readJson(path.join(this.basePath, 'projects', `${id}.json`));
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
        await this.writeJson(path.join(this.basePath, 'projects', `${id}.json`), newProject);
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
        await this.writeJson(path.join(this.basePath, 'projects', `${id}.json`), updated);
        return updated;
    }
    async deleteProject(id) {
        await this.deleteIfExists(path.join(this.basePath, 'projects', `${id}.json`));
    }
    // ========== 文件夹操作 ==========
    async listFolders(projectId) {
        const allFolders = await this.listJsonFiles(path.join(this.basePath, 'folders'));
        return allFolders.filter(f => f.projectId === projectId);
    }
    async getFolder(id) {
        return this.readJson(path.join(this.basePath, 'folders', `${id}.json`));
    }
    async createFolder(folder) {
        const id = (0, uuid_1.v4)();
        const now = Date.now();
        const newFolder = {
            ...folder,
            id,
            createdAt: now,
            updatedAt: now,
        };
        await this.writeJson(path.join(this.basePath, 'folders', `${id}.json`), newFolder);
        return newFolder;
    }
    async updateFolder(id, updates) {
        const existing = await this.getFolder(id);
        if (!existing)
            throw new Error(`Folder ${id} not found`);
        const updated = {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
        };
        await this.writeJson(path.join(this.basePath, 'folders', `${id}.json`), updated);
        return updated;
    }
    async deleteFolder(id) {
        await this.deleteIfExists(path.join(this.basePath, 'folders', `${id}.json`));
    }
    // ========== 文档操作 ==========
    async listDocuments(projectId, folderId, includeDeleted = false) {
        const allDocs = await this.listJsonFiles(path.join(this.basePath, 'documents'));
        return allDocs.filter(d => {
            if (d.projectId !== projectId)
                return false;
            if (folderId && d.folderId !== folderId)
                return false;
            if (!includeDeleted && d.deleted)
                return false;
            return true;
        });
    }
    async getDocument(id) {
        return this.readJson(path.join(this.basePath, 'documents', `${id}.json`));
    }
    async createDocument(document) {
        const id = (0, uuid_1.v4)();
        const now = Date.now();
        const newDocument = {
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
    async updateDocument(id, updates) {
        const existing = await this.getDocument(id);
        if (!existing)
            throw new Error(`Document ${id} not found`);
        const updated = {
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
        }
        else {
            await this.indexDocument(updated);
        }
        return updated;
    }
    async deleteDocument(id) {
        await this.updateDocument(id, { deleted: true });
    }
    async restoreDocument(id) {
        await this.updateDocument(id, { deleted: false, deletedAt: null });
    }
    async permanentlyDeleteDocument(id) {
        await this.deleteDocumentIndex(id);
        await this.deleteIfExists(path.join(this.basePath, 'documents', `${id}.json`));
    }
    async listDeletedDocuments() {
        const allDocs = await this.listJsonFiles(path.join(this.basePath, 'documents'));
        return allDocs.filter(d => d.deleted);
    }
    async emptyTrash() {
        const deleted = await this.listDeletedDocuments();
        for (const doc of deleted) {
            await this.permanentlyDeleteDocument(doc.id);
        }
    }
    // ========== 用户操作 ==========
    async getUserByUsername(username) {
        const allUsers = await this.listJsonFiles(path.join(this.basePath, 'users'));
        return allUsers.find(u => u.username === username) || null;
    }
    async getUser(id) {
        return this.readJson(path.join(this.basePath, 'users', `${id}.json`));
    }
    async createUser(user) {
        const id = (0, uuid_1.v4)();
        const now = Date.now();
        const passwordHash = await bcrypt.hash(user.passwordHash, 10);
        const newUser = {
            ...user,
            id,
            passwordHash,
            createdAt: now,
        };
        await this.writeJson(path.join(this.basePath, 'users', `${id}.json`), newUser);
        return newUser;
    }
    // ========== 搜索 ==========
    async searchFullText(query, filters) {
        const allDocs = await this.listJsonFiles(path.join(this.basePath, 'documents'));
        const results = [];
        const queryLower = query.toLowerCase();
        for (const doc of allDocs) {
            // 应用筛选
            if (!this.applyFilter(doc, filters))
                continue;
            if (doc.deleted && (!filters?.includeDeleted))
                continue;
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
    async searchSemantic(embedding, filters) {
        // 这里需要LanceDB支持，简化实现
        // 实际会用LanceDB的向量搜索
        return [];
    }
    async indexDocument(document) {
        // 嵌入并存储到LanceDB
        // 简化实现
    }
    async deleteDocumentIndex(id) {
        // 从LanceDB删除
        // 简化实现
    }
    // ========== 进度记录 ==========
    async getProgress(date) {
        return this.readJson(path.join(this.basePath, 'progress', `${date}.json`));
    }
    async listProgress(startDate, endDate) {
        const all = await this.listJsonFiles(path.join(this.basePath, 'progress'));
        return all.filter((p) => p.date >= startDate && p.date <= endDate);
    }
    async saveProgress(entry) {
        const id = (0, uuid_1.v4)();
        const now = Date.now();
        const newEntry = {
            ...entry,
            id,
            createdAt: now,
            updatedAt: now,
        };
        await this.writeJson(path.join(this.basePath, 'progress', `${entry.date}.json`), newEntry);
        return newEntry;
    }
    async updateProgress(id, updates) {
        // 需要获取date，这里简化：读取所有找到第一个匹配的id
        const all = await this.listJsonFiles(path.join(this.basePath, 'progress'));
        const existing = all.find(p => p.id === id);
        if (!existing)
            throw new Error(`Progress ${id} not found`);
        const updated = {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
        };
        await this.writeJson(path.join(this.basePath, 'progress', `${updated.date}.json`), updated);
        return updated;
    }
    // ========== 辅助方法 ==========
    applyFilter(doc, filters) {
        if (!filters)
            return true;
        if (filters.projectId && doc.projectId !== filters.projectId)
            return false;
        if (filters.folderId && doc.folderId !== filters.folderId)
            return false;
        if (filters.tags && filters.tags.length > 0) {
            if (!filters.tags.every(t => doc.tags.includes(t)))
                return false;
        }
        if (filters.startDate && doc.createdAt < filters.startDate)
            return false;
        if (filters.endDate && doc.createdAt > filters.endDate)
            return false;
        return true;
    }
    generateSnippet(content, query) {
        if (!query)
            return content.slice(0, 200) + (content.length > 200 ? '...' : '');
        const index = content.toLowerCase().indexOf(query);
        if (index === -1)
            return content.slice(0, 200) + (content.length > 200 ? '...' : '');
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + query.length + 50);
        let snippet = content.slice(start, end);
        if (start > 0)
            snippet = '...' + snippet;
        if (end < content.length)
            snippet = snippet + '...';
        return snippet;
    }
    async ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
        }
    }
    async readJson(filePath) {
        if (!fs.existsSync(filePath))
            return null;
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            return JSON.parse(content);
        }
        catch {
            return null;
        }
    }
    async writeJson(filePath, data) {
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
    async listJsonFiles(dir) {
        if (!fs.existsSync(dir))
            return [];
        const files = await fs.promises.readdir(dir);
        const results = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const data = await this.readJson(path.join(dir, file));
                if (data)
                    results.push(data);
            }
        }
        return results;
    }
    async deleteIfExists(filePath) {
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    }
    // ========== 用户更新密码 ==========
    async updateUserPassword(id, newPasswordHash) {
        const existing = await this.getUser(id);
        if (!existing)
            throw new Error(`User ${id} not found`);
        const updated = {
            ...existing,
            passwordHash: await bcrypt.hash(newPasswordHash, 10),
        };
        await this.writeJson(path.join(this.basePath, 'users', `${id}.json`), updated);
        return updated;
    }
    // ========== 工作区 AI 描述缓存 ==========
    getCacheFilePath(filePath) {
        // 路径中替换 / 为 _ 作为文件名
        const safeName = filePath.replace(/\//g, '_').replace(/\\/g, '_').replace(/:/g, '_');
        return path.join(this.basePath, 'workspace-cache', `${safeName}.json`);
    }
    async getWorkspaceCachedDescription(filePath) {
        return this.readJson(this.getCacheFilePath(filePath));
    }
    async saveWorkspaceCachedDescription(filePath, description, tags) {
        const existing = await this.getWorkspaceCachedDescription(filePath);
        const now = Date.now();
        const entry = {
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
exports.LocalStorageProvider = LocalStorageProvider;
