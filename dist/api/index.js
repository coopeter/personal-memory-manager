"use strict";
// Express API 主入口
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.services = exports.app = void 0;
exports.start = start;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./auth");
const project_1 = require("./project");
const document_1 = require("./document");
const search_1 = require("./search");
const local_1 = require("../providers/local");
const project_2 = require("../core/project");
const search_2 = require("../core/search");
const progress_1 = require("../core/progress");
const classifier_1 = require("../core/classifier");
exports.app = (0, express_1.default)();
const port = process.env.PORT || 8080;
const dataPath = process.env.DATA_PATH || './data';
const openaiApiKey = process.env.OPENAI_API_KEY;
// 中间件
exports.app.use((0, cors_1.default)());
exports.app.use(body_parser_1.default.json());
exports.app.use(express_1.default.static('frontend/dist'));
// 初始化存储和服务
const storage = new local_1.LocalStorageProvider({
    basePath: dataPath,
    useLanceDB: !!openaiApiKey,
});
exports.services = {
    storage,
    projectManager: new project_2.ProjectManager(storage),
    searchService: new search_2.SearchService(storage, openaiApiKey),
    progressTracker: new progress_1.ProgressTracker(storage),
    aiClassifier: new classifier_1.AIClassifier(),
};
// 路由注册
exports.app.use('/api/auth', auth_1.authRouter);
exports.app.use('/api/projects', project_1.projectRouter);
exports.app.use('/api/documents', document_1.documentRouter);
exports.app.use('/api/search', search_1.searchRouter);
// 启动服务
async function start() {
    await storage.initialize();
    await exports.services.projectManager.initialize();
    exports.app.listen(port, () => {
        console.log(`Personal Memory Manager running on http://localhost:${port}`);
        console.log(`Data directory: ${dataPath}`);
        console.log(`Semantic search: ${openaiApiKey ? 'enabled' : 'disabled (need OPENAI_API_KEY)'}`);
    });
}
// 如果直接运行则启动
if (require.main === module) {
    start().catch(err => {
        console.error('Failed to start:', err);
        process.exit(1);
    });
}
