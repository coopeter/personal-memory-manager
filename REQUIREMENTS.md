# Personal Memory Manager - Complete Requirements Document

---

## 1. Project Overview

**Personal Memory Manager** is a personal memory and document management system specifically designed for OpenClaw running on cloud servers. It:

- Automatically records all conversations with the AI assistant, organizes them by projects/folders
- Provides full-text search + AI semantic search for quick knowledge retrieval
- Tracks daily work progress, automatically generates daily summaries
- Offers a responsive web management interface accessible from anywhere
- Designed for **single-user** use case (the OpenClaw owner only)
- Read-only access to all OpenClaw workspace files

**Design Goals:**
- Specifically built for cloud-deployed OpenClaw, serves the owner exclusively
- Single-user design: no registration needed, only one built-in admin account
- All management operations via web interface, no SSH manual operations needed
- Standalone deployment, optional Feishu integration
- Supports browsing OpenClaw workspace files in read-only mode

---

## 2. Feature List

### 2.1 Conversation Recording
- ✅ Automatically record complete conversation history
- ✅ Support distinguishing between **inspiration** / **discussion** / **final result** types
- ✅ Each record saved as Markdown file, compatible with general tools

### 2.2 Project & Folder Organization
- ✅ Support top-level **project** grouping
- ✅ Support user-defined **multi-level folders** inside each project
- ✅ AI automatically classifies new documents based on folder descriptions, recommends the best matching folder
- ✅ Support rename/move/delete for documents and folders within the managed memory space
- ✅ Deleted items go to **trash can**, supports restore, can empty trash

### 2.3 OpenClaw Workspace Browser (New Feature)
- ✅ Read-only access to the entire OpenClaw workspace directory
- ✅ Browse files and folders in the workspace through the web interface
- ✅ View file contents (supports text-based files: Markdown, JS/TS, Python, JSON, etc.)
- ✅ **AI automatic file description generation** - helps understand what each file is for
- ✅ **AI automatic tag extraction** - for easier identification and search
- ✅ **Reader-friendly formatting** - code syntax highlighting, clean typography
- ✅ No modification/delete/write permissions for workspace files - read-only only
- ✅ Configurable workspace root path, defaults to OpenClaw workspace

### 2.4 AI Smart Features
- ✅ Automatically extract keywords tags from document title and content
- ✅ Automatically recommend classification folder based on document content
- ✅ Auto-generate daily progress summary, supports Markdown export
- ✅ Optional OpenAI embeddings for **semantic search**

### 2.5 Progress Tracking
- ✅ Record daily work progress by date
- ✅ Auto associate documents modified today
- ✅ Support querying progress for any date range
- ✅ Support exporting progress summary as Markdown

### 2.6 Search
- ✅ **Full-text search** - fuzzy keyword matching in document content and title
- ✅ **Semantic search** - find semantically related documents via LanceDB vector index
- ✅ Support filtering by **project** / **folder** / **tags** / **date range**

### 2.7 Storage Architecture
- ✅ **LanceDB** stores vector index and metadata (including project/folder structure) for efficient retrieval
- ✅ **Markdown files** store original document content ensuring generality and compatibility
- ✅ **Virtual folder structure**: Projects and folders are logically organized in LanceDB (not mirroring the physical file system), no need to match physical directory structure on server
- ✅ Dedicated data directory for managed memory documents (separate from workspace), all documents stored within this directory
- ✅ Workspace Browser directly reads physical files from the OpenClaw workspace (read-only)
- ✅ Optional **Feishu Cloud Drive** as storage backend, supports cloud sync

### 2.8 Web Management Interface
- ✅ Single-page application, responsive design
- ✅ Perfect adaptation for **desktop** and **mobile**
- ✅ Supports Feishu **mini-app** integration
- ✅ **Reader-friendly design** throughout the system:
  - Clean typography for comfortable reading
  - Code syntax highlighting for code files
  - Proper spacing and formatting for Markdown content
- ✅ Two main sections:
  - **Memory Manager**: manage your conversational memory and documents
  - **Workspace Browser**: browse OpenClaw workspace files (read-only)
- ✅ All management operations via interface, no need for SSH manual operations

### 2.9 Authentication
- ✅ **Single-user design**: no registration functionality at all
- ✅ One built-in admin account only:
  - Admin username/password set during initialization via CLI command
  - Can also be configured via environment variables
  - Supports changing password through web interface after login
  - When integrated with Feishu, can also change password via Feishu conversation with OpenClaw (since Feishu is exclusively owned by the user, it's secure)
- ✅ JWT token based authentication
- ✅ Feishu integration: can reuse **Feishu identity authentication** for seamless login (no need to login again)
- ✅ Public network accessible with secure login protection

### 2.10 Security
- ✅ Prevent directory traversal attacks - strictly limit access to configured root directories only
- ✅ All routes require authentication except login
- ✅ Password stored as salted hash
- ✅ Workspace files are strictly read-only - no write/delete operations allowed through the interface

### 2.11 Tech Stack
- **Backend**: TypeScript + Express.js + LanceDB + JWT
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Storage**: LanceDB (vector search) + Markdown files (raw content)
- **Authentication**: JWT (single-user) / Feishu OAuth (integrated)

---

## 3. API Design

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Login with username/password, returns JWT token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/password` - Change admin password (requires current password)
- **No registration endpoints** - single admin account pre-configured

### Projects (`/api/projects`)
- `GET /api/projects/tree` - Get complete project tree (all projects + folders)
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (cascade delete all folders and documents)
- `GET /api/projects/:projectId/folders` - List all folders in project
- `POST /api/projects/:projectId/folders` - Create folder
- `GET /api/projects/folders/:id/path` - Get folder path from root to current
- `PUT /api/projects/folders/:id` - Update folder
- `DELETE /api/projects/folders/:id` - Delete folder
- `GET /api/projects/folders/:id/documents` - List all documents in folder

### Documents (`/api/documents`)
- `GET /api/documents/:id` - Get document details
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Soft delete document (move to trash)
- `POST /api/documents/:id/restore` - Restore document from trash
- `DELETE /api/documents/:id/permanent` - Permanently delete document
- `GET /api/documents/trash/list` - List deleted documents
- `DELETE /api/documents/trash/empty` - Empty trash
- `POST /api/documents/:id/move` - Move document to another folder
- `POST /api/documents/classify` - AI auto classification recommendation

### Workspace Browser (`/api/workspace`) - *New*
- `GET /api/workspace/browse` - List files and folders at given path (query param: `path`)
- `GET /api/workspace/file` - Get content of a text file (query param: `path`)
- `GET /api/workspace/stats` - Get file/directory stats
- `POST /api/workspace/describe` - Generate AI description and tags for a file
- `GET /api/workspace/describe/cached` - Get cached AI description for a file
- **All endpoints are read-only** - no create/update/delete operations allowed

### Search (`/api/search`)
- `GET /api/search?q=xxx` - Mixed search (full-text + semantic if enabled)
- `POST /api/search` - Search with complex filtering conditions
- `GET /api/search/tags?tags=a,b,c` - Filter by tags
- `GET /api/search/supports-semantic` - Check if semantic search is supported

### Progress (`/api/progress`)
- `GET /api/progress/daily/:date` - Get progress for specific date (YYYY-MM-DD)
- `GET /api/progress/range` - Get progress for date range
- `POST /api/progress/daily/:date` - Update daily progress
- `GET /api/progress/export` - Export progress as Markdown

---

## 4. Data Models

```typescript
// Project
interface Project {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

// Folder
interface Folder {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

// Document
interface Document {
  id: string;
  projectId: string;
  folderId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
  deletedAt: number | null;
}

// User (Single pre-configured admin only)
interface User {
  id: string;
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: number;
}

// Progress Entry
interface ProgressEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  summary: string;
  documentIds: string[];
  createdAt: number;
  updatedAt: number;
}

// Workspace File Info
interface WorkspaceFileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: number;
  aiDescription?: string; // AI-generated description of the file
  aiTags?: string[]; // AI-extracted tags
}

// Workspace file description request/response
interface WorkspaceFileDescribeResponse {
  path: string;
  description: string;
  tags: string[];
}
```

---

## 5. Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Service port | `8080` | No |
| `DATA_PATH` | Path for stored memory data | `./data` | No |
| `WORKSPACE_PATH` | Path to OpenClaw workspace for read-only browsing | `/root/.openclaw/workspace` | No |
| `JWT_SECRET` | JWT signing secret | (auto-generated on first init) | No |
| `ADMIN_USERNAME` | Admin username | `admin` | No |
| `ADMIN_PASSWORD` | Admin password | `password` | **Change in production!** | No |
| `OPENAI_API_KEY` | OpenAI API key for embeddings (semantic search) | - | Optional |
| `FEISHU_APP_ID` | Feishu app ID for integration | - | Optional |
| `FEISHU_APP_SECRET` | Feishu app secret | - | Optional |
| `FEISHU_BASE_FOLDER_TOKEN` | Feishu cloud drive base folder | - | Optional |
| `ENABLE_WORKSPACE_BROWSER` | Enable workspace browser feature | `true` | No |

---

## 6. Deployment Instructions

### 6.1 Standalone Deployment (Recommended)

```bash
# Clone project
git clone https://github.com/coopeter/personal-memory-manager.git
cd personal-memory-manager

# Install dependencies
npm install

# Compile backend (already compiled, can skip)
npx tsc

# Initialize data (creates admin account)
npx ts-node scripts/init-data.ts

# Configure environment variables (edit .env file)
# Change ADMIN_USERNAME and ADMIN_PASSWORD!

# Start service
npm start
```

**Default Configuration:**
- Port: `8080`
- Default username: `admin`
- Default password: `password` **(change this!)**
- Data directory: `./data`
- Workspace root: `/root/.openclaw/workspace`

After starting, visit: `http://<your-server-ip>:8080` to login and use.

### 6.2 Running as Service (PM2 recommended)

```bash
pm2 start npm --name "personal-memory-manager" -- start
pm2 save
pm2 startup
```

### 6.3 Feishu Integration Deployment

1. Create app on Feishu Open Platform
2. Configure environment variables:
   - `FEISHU_APP_ID` - Feishu app ID
   - `FEISHU_APP_SECRET` - Feishu app secret
   - `FEISHU_BASE_FOLDER_TOKEN` - Feishu cloud drive base folder token

Feishu integration provides:
- Cloud drive storage
- Feishu OAuth authentication

---

## 7. Key Changes from Original Design

1. **Single-user focus**: Removed all registration functionality, one built-in admin account only
2. **Workspace Browser**: Added read-only file browser for the entire OpenClaw workspace
3. **Security hardening**: Strict path validation and access control for public internet exposure
4. **Simplified deployment**: Pre-configured single admin, easier setup

---

## 8. Development Log

**Updated**: 2026-03-20 - Added AI file description, reading friendly, password change, clarified virtual folder structure  
**Added single-user focus**: 2026-03-20 - Added single-user design and workspace browser requirements  
**Original Development Completion**: 2026-03-19  
**Developer**: 小火炉 🔥 (Requirements by Pan Feng)  
**GitHub Repository**: https://github.com/coopeter/personal-memory-manager
