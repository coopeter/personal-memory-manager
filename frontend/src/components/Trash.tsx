import * as React from 'react';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Trash() {
  const [projects, setProjects] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'documents' | 'folders' | 'projects'>('documents');

  useEffect(() => {
    loadTrash();
  }, []);

  const loadTrash = async () => {
    try {
      const [projectsRes, foldersRes, docsRes] = await Promise.all([
        api.get('/api/projects', { params: { deleted: true } }),
        api.get('/api/folders', { params: { deleted: true } }),
        api.get('/api/documents', { params: { deleted: true } }),
      ]);
      setProjects(projectsRes.data);
      setFolders(foldersRes.data);
      setDocuments(docsRes.data);
    } catch (err) {
      console.error('Failed to load trash', err);
    } finally {
      setLoading(false);
    }
  };

  const restoreDocument = async (id: string) => {
    try {
      await api.post(`/api/documents/${id}/restore`);
      loadTrash();
    } catch (err) {
      console.error('Failed to restore', err);
    }
  };

  const restoreFolder = async (id: string) => {
    try {
      await api.post(`/api/folders/${id}/restore`);
      loadTrash();
    } catch (err) {
      console.error('Failed to restore', err);
    }
  };

  const restoreProject = async (id: string) => {
    try {
      await api.post(`/api/projects/${id}/restore`);
      loadTrash();
    } catch (err) {
      console.error('Failed to restore', err);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  const isEmpty = (activeTab === 'documents' && documents.length === 0) ||
             (activeTab === 'folders' && folders.length === 0) ||
             (activeTab === 'projects' && projects.length === 0);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🗑️ Trash</h2>

      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'documents' ? 'border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents ({documents.length})
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'folders' ? 'border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('folders')}
        >
          Folders ({folders.length})
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'projects' ? 'border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects ({projects.length})
        </button>
      </div>

      <div className="space-y-2">
        {activeTab === 'documents' &&
          documents.map((doc: any) => (
            <div
              key={doc.id}
              className="p-3 bg-white rounded shadow flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{doc.title}</div>
                <div className="text-sm text-gray-500">
                  Deleted: {new Date(doc.deletedAt!).toLocaleString()}
                </div>
              </div>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                onClick={() => restoreDocument(doc.id)}
              >
                ♻️ Restore
              </button>
            </div>
          ))}

        {activeTab === 'folders' &&
          folders.map((folder: any) => (
            <div
              key={folder.id}
              className="p-3 bg-white rounded shadow flex justify-between items-center"
            >
              <div>
                <div className="font-medium">📁 {folder.name}</div>
                <div className="text-sm text-gray-500">
                  Deleted: {new Date(folder.deletedAt!).toLocaleString()}
                </div>
              </div>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                onClick={() => restoreFolder(folder.id)}
              >
                ♻️ Restore
              </button>
            </div>
          ))}

        {activeTab === 'projects' &&
          projects.map((project: any) => (
            <div
              key={project.id}
              className="p-3 bg-white rounded shadow flex justify-between items-center"
            >
              <div>
                <div className="font-medium">📁 {project.name}</div>
                <div className="text-sm text-gray-500">
                  Deleted: {new Date(project.deletedAt!).toLocaleString()}
                </div>
              </div>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                onClick={() => restoreProject(project.id)}
              >
                ♻️ Restore
              </button>
            </div>
          ))}

        {isEmpty && (
          <div className="text-center text-gray-500 p-8">Trash is empty</div>
        )}
      </div>
    </div>
  );
}
