// 初始化数据脚本 - 创建默认管理员账号和第一个项目

import dotenv from 'dotenv';
dotenv.config();

import { LocalStorageProvider } from '../src/providers/local';
import { ProjectManager } from '../src/core/project';

// 配置
const dataPath = process.env.DATA_PATH || './data';
const defaultUsername = process.env.DEFAULT_USERNAME || 'admin';
const defaultPassword = process.env.DEFAULT_PASSWORD || 'password';

async function main() {
  console.log('Initializing Personal Memory Manager...');

  // 初始化存储
  const storage = new LocalStorageProvider({
    basePath: dataPath,
    useLanceDB: false,
  });
  await storage.initialize();

  // 创建默认管理员
  const existingAdmin = await storage.getUserByUsername(defaultUsername);
  if (existingAdmin) {
    console.log(`Admin user "${defaultUsername}" already exists, skipping...`);
  } else {
    await storage.createUser({
      username: defaultUsername,
      passwordHash: defaultPassword, // plaintext here will be hashed by bcrypt in createUser
      isAdmin: true,
    });
    console.log(`Created default admin user: ${defaultUsername} / ${defaultPassword}`);
  }

  // 创建第一个项目 - 开发讨论记录
  const existingProjects = await storage.listProjects();
  if (existingProjects.length > 0) {
    console.log('Projects already exist, skipping first project creation...');
  } else {
    const projectManager = new ProjectManager(storage);
    await projectManager.initialize();

    const project = await storage.createProject({
      name: 'Personal Memory Manager Development',
      description: 'Development discussion and requirements for the Personal Memory Manager OpenClaw Skill',
      parentId: null,
      tags: ['development', 'openclaw', 'skill'],
    });

    console.log(`Created first project: ${project.name} (${project.id})`);

    // 创建根文件夹
    const rootFolder = await storage.createFolder({
      projectId: project.id,
      parentId: null,
      name: 'Discussion',
      description: 'Development requirements and discussion',
    });

    console.log(`Created root folder: ${rootFolder.name} (${rootFolder.id})`);

    // 创建第一个文档 - 当前讨论
    const content = `# Personal Memory Manager Development Discussion

This document contains the complete development discussion for the Personal Memory Manager OpenClaw Skill.

## Requirements

1. ✅ Automatically record all conversations, categorized by projects and user-defined folders
2. ✅ Provides semantic/full-text search, progress tracking
3. ✅ Responsive web management interface
4. ✅ Distributable as reusable OpenClaw Skill, no mandatory Feishu dependency
5. ✅ Optional Feishu integration
6. ✅ Standalone version with account/password login
7. ✅ Feishu version can reuse Feishu authentication

## Technology Stack

- Backend: TypeScript + Express + LanceDB + JWT + Zod
- Frontend: React 18 + TypeScript + Tailwind CSS
- Storage: LanceDB for vector search/metadata, Markdown files for original content

## Date

${new Date().toISOString()}
`;

    const document = await storage.createDocument({
      projectId: project.id,
      folderId: rootFolder.id,
      title: 'Development Discussion',
      content,
      tags: ['requirements', 'discussion'],
    });

    console.log(`Created first document: ${document.title} (${document.id})`);
  }

  console.log('\n✅ Initialization complete!');
  console.log(`\nTo start the server:\n  npm start`);
  console.log(`\nDefault login:\n  username: ${defaultUsername}\n  password: ${defaultPassword}`);

  await storage.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Initialization failed:', err);
  process.exit(1);
});
