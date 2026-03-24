# Personal Memory Manager - 个人记忆和文档管理 Skill

专为 OpenClaw 设计的个人记忆和文档管理系统，自动记录对话、支持 AI 语义搜索、提供响应式 Web 管理界面。

## 功能特性

- **对话自动记录**：完整记录所有对话，区分灵感片段、讨论过程、最终成果
- **项目分组管理**：支持用户自定义多级文件夹结构，AI 自动分类推荐
- **工作进度追踪**：按天记录进度，自动汇总每日进展，支持导出
- **双重搜索**：全文搜索 + LanceDB 向量语义搜索，快速找到需要的信息
- **OpenClaw 工作区浏览器**：只读浏览整个 OpenClaw 工作区文件，AI 自动生成文件描述和标签
- **回收站支持**：删除文件可恢复，支持清空回收站
- **响应式 Web 界面**：完美适配桌面和移动端，支持飞书微应用
- **权限管理**：单用户设计，内置管理员账号，JWT 认证安全可靠
- **存储架构**：LanceDB 做向量索引 + Markdown 文件存储原始内容，兼顾效率和通用性
- **飞书集成**：可选飞书云端存储和身份认证集成

## 启动方式

```bash
# 安装依赖
npm install

# 初始化数据（创建管理员账号）
npx ts-node scripts/init-data.ts

# 编译 TypeScript
npm run build

# 启动服务
npm start
```

## 环境变量

| 变量 | 说明 | 默认值 | 是否必需 |
|------|------|--------|----------|
| `PORT` | 服务端口 | `8080` | 否 |
| `DATA_PATH` | 数据存储路径 | `./data` | 否 |
| `WORKSPACE_PATH` | OpenClaw 工作区路径（只读浏览） | `/root/.openclaw/workspace` | 否 |
| `JWT_SECRET` | JWT 签名密钥 | 自动生成 | 否 |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` | 否 |
| `ADMIN_PASSWORD` | 管理员密码 | `password` | **生产环境必须修改** |
| `OPENAI_API_KEY` | OpenAI API Key（用于语义搜索嵌入） | - | 可选（不填则仅全文搜索） |
| `FEISHU_APP_ID` | 飞书应用 ID | - | 可选（飞书集成） |
| `FEISHU_APP_SECRET` | 飞书应用密钥 | - | 可选（飞书集成） |
| `ENABLE_WORKSPACE_BROWSER` | 启用工作区浏览器 | `true` | 否 |

## API 文档

详见 [REQUIREMENTS.md](./REQUIREMENTS.md) 中的 API 设计部分。

## 作者

小火炉 🔥 基于潘峰的需求开发

## 仓库

https://github.com/coopeter/personal-memory-manager
