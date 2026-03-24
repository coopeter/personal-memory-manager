import * as React from 'react'
import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import CodeFileViewer from './CodeFileViewer'
import type { WorkspaceFileInfo } from '../../../src/core/types'

export default function WorkspaceBrowser() {
  const [currentPath, setCurrentPath] = useState<string>('')
  const [files, setFiles] = useState<WorkspaceFileInfo[]>([])
  const [selectedFile, setSelectedFile] = useState<WorkspaceFileInfo | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [aiDescription, setAiDescription] = useState<string | null>(null)
  const [aiTags, setAiTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingDescription, setGeneratingDescription] = useState(false)
  const [breadcrumbs, setBreadcrumbs] = useState<{name: string, path: string}[]>([])

  useEffect(() => {
    browsePath(currentPath)
  }, [currentPath])

  const browsePath = async (path: string) => {
    setLoading(true)
    try {
      const res = await api.get('/api/workspace/browse', { params: { path } })
      setFiles(res.data.files)
      setSelectedFile(null)
      setFileContent('')
      setAiDescription(null)
      setAiTags([])
      
      // Build breadcrumbs
      if (!path) {
        setBreadcrumbs([])
        return
      }
      const parts = path.split('/').filter(p => p)
      let accumulated = ''
      const crumbs = parts.map(part => {
        accumulated = accumulated ? `${accumulated}/${part}` : part
        return { name: part, path: accumulated }
      })
      setBreadcrumbs(crumbs)
    } catch (err) {
      console.error('Failed to browse', err)
      alert('Failed to load directory')
    } finally {
      setLoading(false)
    }
  }

  const navigateTo = (path: string) => {
    setCurrentPath(path)
  }

  const openFile = async (file: WorkspaceFileInfo) => {
    if (file.isDirectory) {
      navigateTo(file.path)
      return
    }

    setLoading(true)
    try {
      const res = await api.get('/api/workspace/file', { params: { path: file.path } })
      setSelectedFile(file)
      setFileContent(res.data.content)
      
      // Try to load cached description
      try {
        const cachedRes = await api.get('/api/workspace/describe/cached', { params: { path: file.path } })
        setAiDescription(cachedRes.data.description)
        setAiTags(cachedRes.data.tags)
      } catch {
        setAiDescription(null)
        setAiTags([])
      }
    } catch (err) {
      console.error('Failed to open file', err)
      alert('Failed to open file')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (breadcrumbs.length === 0) return
    const parentPath = breadcrumbs.length > 1 
      ? breadcrumbs[breadcrumbs.length - 2].path 
      : ''
    setCurrentPath(parentPath)
  }

  const goHome = () => {
    setCurrentPath('')
  }

  const generateDescription = async () => {
    if (!selectedFile) return
    
    setGeneratingDescription(true)
    try {
      const res = await api.post('/api/workspace/describe', { path: selectedFile.path })
      setAiDescription(res.data.description)
      setAiTags(res.data.tags)
    } catch (err) {
      console.error('Failed to generate description', err)
      alert('Failed to generate description: ' + (err as any).response?.data?.error || (err as Error).message)
    } finally {
      setGeneratingDescription(false)
    }
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
    return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB'
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar - File list */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Workspace Browser</h2>
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-600 flex-wrap">
            <button
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              onClick={goHome}
            >
              🏠 Root
            </button>
            {breadcrumbs.length > 0 && (
              <button
                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                onClick={goBack}
              >
                ← Back
              </button>
            )}
          </div>
          {breadcrumbs.length > 0 && (
            <div className="mt-2 text-xs text-gray-500 break-all">
              /{breadcrumbs.map(b => b.name).join('/')}/
            </div>
          )}
        </div>

        <div className="p-2">
          {loading && <div className="p-4 text-gray-500">Loading...</div>}
          {!loading && files.length === 0 && (
            <div className="p-4 text-gray-500 text-center">
              This directory is empty
            </div>
          )}
          {files.map((file) => (
            <div
              key={file.path}
              className={`p-2 cursor-pointer rounded hover:bg-gray-100 ${
                selectedFile?.path === file.path ? 'bg-blue-100' : ''
              }`}
              onClick={() => openFile(file)}
            >
              <div className="flex items-center gap-2">
                <span>{file.isDirectory ? '📁' : '📄'}</span>
                <span className="flex-1">{file.name}</span>
                {!file.isDirectory && (
                  <span className="text-xs text-gray-500">{formatSize(file.size)}</span>
                )}
              </div>
              {file.aiDescription && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {file.aiDescription}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content - File viewer */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {selectedFile ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-xl font-bold mb-1">{selectedFile.name}</h1>
                  <p className="text-sm text-gray-500">
                    {formatSize(selectedFile.size)} • Modified: {new Date(selectedFile.modifiedTime).toLocaleString()}
                  </p>
                  {aiTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {aiTags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {!aiDescription && (
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded text-sm disabled:opacity-50"
                    onClick={generateDescription}
                    disabled={generatingDescription}
                  >
                    {generatingDescription ? 'Generating...' : '🤖 AI Describe'}
                  </button>
                )}
              </div>

              {aiDescription && (
                <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-800 mb-1">🤖 AI Description</div>
                  <p className="text-purple-900">{aiDescription}</p>
                  <button
                    className="mt-2 text-sm text-purple-600 hover:underline"
                    onClick={generateDescription}
                    disabled={generatingDescription}
                  >
                    {generatingDescription ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <CodeFileViewer content={fileContent} extension={selectedFile.name.split('.').pop() || ''} />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              OpenClaw Workspace Browser
            </h2>
            <p>Select a file from the sidebar to view it</p>
          </div>
        )}
      </div>
    </div>
  )
}
