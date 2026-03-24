// Personal Memory Manager - Main Entry
// 通用记忆和文档管理 Skill for OpenClaw

export * from './api/index';

import { start } from './api/index';

// 如果直接运行则启动服务
if (require.main === module) {
  start().catch(err => {
    console.error('Failed to start Personal Memory Manager:', err);
    process.exit(1);
  });
}
