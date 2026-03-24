import * as React from 'react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function Home() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [projectTree, setProjectTree] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const res = await api.get('/api/projects')
      setProjects(res.data.filter((p: any) => !p.deletedAt))
    } catch (err) {
      console.error('Failed to load projects', err)
    } finally {
      setLoading(false)
    }
  }

  const selectProject = async (project: any) => {
    setSelectedProject(project)
    try {
      const res = await api.get(`/api/projects/${project.id}/tree`)
      setProjectTree(res.data)
    } catch (err) {
      console.error('Failed to load project tree', err)
    }
  }

  const selectFolder = async (folder: any) => {
    setSelectedFolder(folder)
    setDocuments(folder.documents || [])
  }

  const createProject = async () => {
    try {
      await api.post('/api/projects', {
        name: newProjectName,
        description: newProjectDesc,
      })
      setNewProjectName('')
      setNewProjectDesc('')
      setShowNewProject(false)
      loadProjects()
    } catch (err) {
      console.error('Failed to create project', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.reload()
  }

  const renderFolders = (folders: any[], level: number = 0) => {
    return folders.map((folder: any) => (
      <div key={folder.id} className="ml-4">
        <div
          className={`p-2 cursor-pointer rounded hover:bg-gray-100 ${
            selectedFolder?.id === folder.id ? 'bg-blue-100' : ''
          }`}
          onClick={() => selectFolder(folder)}
        >
          📁 {folder.name}
        </div>
        {folder.children && folder.children.length > 0 && renderFolders(folder.children, level + 1)}
      </div>
    ))
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Projects</h2>
            <button
              className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
              onClick={() => setShowNewProject(!showNewProject)}
            >
              + New
            </button>
          </div>
          {showNewProject && (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                placeholder="Project name"
                className="w-full px-2 py-1 border rounded text-sm"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Description"
                className="w-full px-2 py-1 border rounded text-sm"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
              />
              <button
                className="w-full px-2 py-1 bg-green-600 text-white rounded text-sm"
                onClick={createProject}
              >
                Create
              </button>
            </div>
          )}
        </div>
        <div className="p-2">
          {projects.map((project: any) => (
            <div
              key={project.id}
              className={`p-2 cursor-pointer rounded hover:bg-gray-100 ${
                selectedProject?.id === project.id ? 'bg-blue-100' : ''
              }`}
              onClick={() => selectProject(project)}
            >
              📁 {project.name}
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2">
          <Link
            to="/workspace"
            className="block w-full px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-sm text-center"
          >
            🌐 Workspace Browser
          </Link>
          <Link
            to="/settings"
            className="block w-full px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-center"
          >
            ⚙️ Settings
          </Link>
          <button
            className="w-full px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedProject ? (
          <div className="h-full flex">
            {/* Folder tree */}
            <div className="w-48 border-r pr-4 mr-4">
              <h3 className="font-medium mb-2">{selectedProject.name}</h3>
              {renderFolders(projectTree)}
            </div>

            {/* Document list */}
            <div className="flex-1">
              {selectedFolder ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">{selectedFolder.name}</h3>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                      + New Document
                    </button>
                  </div>
                  <div className="space-y-2">
                    {documents.map((doc: any) => (
                      <Link
                        key={doc.id}
                        to={`/document/${selectedProject.id}/${selectedFolder.id}/${doc.id}`}
                        className="block p-3 bg-white rounded shadow hover:shadow-md transition-shadow"
                      >
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(doc.createdAt).toLocaleString()}
                          {doc.tags.length > 0 && (
                            <span className="ml-2">
                              • {doc.tags.map((t: string) => `#${t}`).join(' ')}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                    {documents.length === 0 && (
                      <div className="text-gray-500 text-center p-8">
                        No documents yet
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-center p-8">
                  Select a folder to view documents
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Personal Memory Manager
            </h2>
            <p>Select a project from the sidebar to get started</p>
          </div>
        )}

        {/* Bottom navigation for mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden p-2 flex justify-around">
          <Link to="/search" className="text-center text-sm">
            🔍 Search
          </Link>
          <Link to="/trash" className="text-center text-sm">
            🗑️ Trash
          </Link>
        </div>
      </div>
    </div>
  )
}
