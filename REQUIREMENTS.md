# Personal Memory Manager - Complete Requirements Document

---

## 1. Project Overview

**Personal Memory Manager** is a general-purpose personal memory and document management OpenClaw Skill that:

- Automatically records all conversations, organizes them by categories
- Provides full-text search + AI semantic search
- Tracks daily work progress, automatically generates summaries
- Offers a responsive web management interface
- Can be deployed as an independent service, Feishu integration is optional

**Design Goals:**
- General reusable skill, no mandatory Feishu dependency, Feishu integration is an optional plugin
- All management operations are done via the web interface, no manual server file operations needed
- Supports account/password login for standalone deployment, Feishu integration can reuse Feishu identity authentication

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
- ✅ Support rename/move/delete for documents and folders
- ✅ Deleted items go to **trash can**, supports restore, can empty trash

### 2.3 AI Smart Features
- ✅ Automatically extract keywords tags from document title and content
- ✅ Automatically recommend classification folder based on document content
- ✅ Auto-generate daily progress summary, supports Markdown export
- ✅ Optional OpenAI embeddings for **semantic search**

### 2.4 Progress Tracking
- ✅ Record daily work progress by date
- ✅ Auto associate documents modified today
- ✅ Support querying progress for any date range
- ✅ Support exporting progress summary as Markdown

### 2.5 Search
- ✅ **Full-text search** - fuzzy keyword matching in document content and title
- ✅ **Semantic search** - find semantically related documents via LanceDB vector index
- ✅ Support filtering by **project** / **folder** / **tags** / **date range**

### 2.6 Storage Architecture
- ✅ **LanceDB** stores vector index and metadata for efficient retrieval
- ✅ **Markdown files** store original document content ensuring generality and compatibility
- ✅ Optional **Feishu Cloud Drive** as storage backend, supports cloud sync

### 2.7 Web Management Interface
- ✅ Single-page application, responsive design
- ✅ Perfect adaptation for **desktop** and **mobile**
- ✅ Supports Feishu **mini-app** integration
- ✅ All management operations via interface, no need for SSH manual file operations

### 2.8 Authentication
- ✅ Standalone deployment: **username/password** JWT login
- ✅ Feishu integration: reuse **Feishu identity authentication**, no second login needed

### 2.9 Tech Stack
- **Backend**: TypeScript + Express.js + LanceDB + JWT
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Storage**: LanceDB (vector search) + Markdown files (raw content)
- **Authentication**: JWT (standalone) / Feishu OAuth (integrated)

---

## 3. API Design

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Login with username/password, returns JWT token

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

### Search (`/api/search`)
- `GET /api/search?q=xxx` - Mixed search (full-text + semantic if enabled)
- `POST /api/search` - Search with complex filtering conditions
- `GET /api/search/tags?tags=a,b,c` - Filter by tags
- `GET /api/search/supports-semantic` - Check if semantic search is supported

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

// User
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
```

---

## 5. Deployment Instructions

### 5.1 Standalone Deployment (Recommended)

```bash
# Clone project
git clone https://github.com/coopeter/personal-memory-manager.git
cd personal-memory-manager

# Install dependencies
npm install

# Compile backend (already compiled, can skip)
npx tsc

# Initialize data, create default admin account
npx ts-node scripts/init-data.ts

# Start service
npm start
```

**Default Configuration:**
- Port: `8080`
- Default username: `admin`
- Default password: `password`
- Data directory: `./data`

**Environment Variables:**
- `PORT` - Service port (default 8080)
- `DATA_PATH` - Data storage path (default ./data)
- `JWT_SECRET` - JWT signing secret (default has test value, change for production)
- `OPENAI_API_KEY` - Configure OpenAI API key if you want semantic search

Visit: `http://<your-server-ip>:8080` to login and use.

### 5.2 Feishu Integration Deployment

1. Create app on Feishu Open Platform
2. Configure environment variables:
   - `FEISHU_APP_ID` - Feishu app ID
   - `FEISHU_APP_SECRET` - Feishu app secret
   - `FEISHU_BASE_FOLDER_TOKEN` - Feishu cloud drive base folder token

Feishu integration provides:
- Cloud drive storage
- Feishu OAuth authentication

---

## 6. Development Log

**Development Completion Date**: 2026-03-19  
**Developer**: 小火炉 🔥 (Requirements by Pan Feng)  
**GitHub Repository**: https://github.com/coopeter/personal-memory-manager
