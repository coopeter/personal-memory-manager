// Express API 主入口

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { authRouter } from './auth';
import { projectRouter } from './project';
import { documentRouter } from './document';
import { searchRouter } from './search';
import { LocalStorageProvider } from '../providers/local';
import { ProjectManager } from '../core/project';
import { SearchService } from '../core/search';
import { ProgressTracker } from '../core/progress';
import { AIClassifier } from '../core/classifier';

export const app = express();
const port = process.env.PORT || 8080;
const dataPath = process.env.DATA_PATH || './data';
const openaiApiKey = process.env.OPENAI_API_KEY;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('frontend/dist'));

// 初始化存储和服务
const storage = new LocalStorageProvider({
  basePath: dataPath,
  useLanceDB: !!openaiApiKey,
});

export const services = {
  storage,
  projectManager: new ProjectManager(storage),
  searchService: new SearchService(storage, openaiApiKey),
  progressTracker: new ProgressTracker(storage),
  aiClassifier: new AIClassifier(),
};

// 路由注册
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/documents', documentRouter);
app.use('/api/search', searchRouter);

// 启动服务
export async function start() {
  await storage.initialize();
  await services.projectManager.initialize();
  
  app.listen(port, () => {
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
