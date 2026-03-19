#!/usr/bin/env node
import { Storage } from '../src/core/storage'
import { ProjectManager } from '../src/core/project'
import { config } from 'dotenv'
import { hash } from 'bcrypt'

config()

async function init() {
  const storage = new Storage({
    basePath: './data',
    useLanceDB: true,
    provider: 'local',
  })

  await storage.init()

  // Create default admin user
  const hashedPassword = await hash('password', 10)
  await storage.createUser({
    username: 'admin',
    password: hashedPassword,
  })

  // Create first project: "personal-memory-manager"
  const pm = new ProjectManager(storage)
  const project = await pm.createProject(
    'Personal Memory Manager',
    '开发一个通用的个人记忆与文档管理OpenClaw Skill'
  )

  // Create root folder
  const rootFolder = await pm.createFolder(project.id, null, '项目讨论', '记录我们开发这个项目的讨论过程')

  // Import our conversation content
  const conversationContent = `# 个人记忆管理器 - 开发讨论记录

## 需求讨论

我们要开发一个通用的记忆和文档管理功能，作为 OpenClaw Skill 发布。主要功能：

1. **完整记录所有对话**
   - 记录所有沟通内容，不丢失任何信息
   - 区分三种内容类型：灵感片段、讨论过程、最终成果

2. **按项目分组管理**
   - 用户可以自定义创建多个项目
   - 每个项目内用户可以自定义多级文件夹结构
   - 用户定义文件夹用途后，AI 自动把对话内容归类放入对应文件夹
   - 支持未归类到任何项目的内容，放在公共区域，支持标签和搜索

3. **工作进度追踪**
   - 记录每个项目当前进度
   - 按天记录每个项目做了什么
   - 重启/隔天之后能快速恢复上下文，记得之前聊到哪了

4. **存储方案**
   - LanceDB 向量索引，用于语义检索
   - Markdown 文件存储原始内容，方便同步和通用访问
   - 元数据 JSON 保存结构信息

5. **可分发为 Skill**
   - 做成一个通用的 OpenClaw Skill，不依赖飞书（飞书作为可选项）
   - 其他 OpenClaw 实例部署后也能使用

6. **前端界面**
   - 需要 Web 管理界面，方便浏览查看
   - 如果能集成到飞书更好，飞书内微应用，支持移动端访问

7. **文件管理操作**
   - 重命名：支持对已保存的对话/文档重命名
   - 移动：支持在不同项目/文件夹之间移动文档
   - 回收站：删除文件先放进回收站，不直接删除，支持恢复

8. **完整的文件夹管理在前端**
   - 新建文件夹/子文件夹：界面上直接操作，支持多级目录
   - 文件夹重命名：随时改名字和描述
   - 文件夹移动/删除：移动整棵目录树，删除放回收站
   - 文件夹描述：每个文件夹可以写说明，告诉 AI 这个文件夹放什么类型内容，方便自动分类
   - 拖拽排序：可以调整文件夹顺序

9. **搜索检索**
   - 全文搜索
   - 语义搜索（找相关内容）
   - 按项目/文件夹/标签/日期筛选

10. **自动总结**
    - 每天自动总结每个项目的进展
    - 对话结束后自动提炼关键点放到对应文件夹
    - 可以一键生成项目进度报告

11. **权限与登录**
    - 如果集成在飞书内：复用飞书账号登录，不需要额外登录
    - 如果是独立 Web 界面：需要账号密码登录功能，保证只有你能访问

## 开发进度

所有代码已经开发完成，包括：
- 后端核心逻辑全部完成
- 前端构建成功
- 飞书集成完成

这是第一个项目，用来测试整个系统。
`

  await storage.createDocument({
    projectId: project.id,
    folderId: rootFolder.id,
    title: '需求讨论与开发记录',
    content: conversationContent,
    contentType: 'result',
    tags: ['project', 'memory-manager', 'requirement'],
  })

  console.log('✅ Initialization complete!')
  console.log('')
  console.log('Default admin user created:')
  console.log('  Username: admin')
  console.log('  Password: password')
  console.log('')
  console.log('First project "Personal Memory Manager" created!')

  await storage.close()
}

init().catch(console.error)
