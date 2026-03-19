import * as React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { api } from '../utils/api'

export default function DocumentView() {
  const { projectId, folderId, docId } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocument()
  }, [docId])

  const loadDocument = async () => {
    try {
      const res = await api.get(`/api/documents/${docId}`)
      setDoc(res.data)
      setContent(res.data.content)
      setTitle(res.data.title)
      setTags(res.data.tags.join(', '))
    } catch (err) {
      console.error('Failed to load document', err)
    } finally {
      setLoading(false)
    }
  }

  const saveDocument = async () => {
    try {
      await api.put(`/api/documents/${docId}`, {
        title,
        content,
        tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      })
      setDoc({ ...doc, title, content, tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean) })
      setEditing(false)
    } catch (err) {
      console.error('Failed to save document', err)
    }
  }

  const deleteDocument = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) return
    try {
      await api.delete(`/api/documents/${docId}`)
      navigate(`/`)
    } catch (err) {
      console.error('Failed to delete document', err)
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!doc) {
    return <div className="p-4 text-red-500">Document not found</div>
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded text-sm"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div className="space-x-2">
          {!editing && (
            <>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                onClick={() => setEditing(true)}
              >
                ✏️ Edit
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                onClick={deleteDocument}
              >
                🗑️ Delete
              </button>
            </>
          )}
          {editing && (
            <>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                onClick={saveDocument}
              >
                💾 Save
              </button>
              <button
                className="px-3 py-1 bg-gray-200 rounded text-sm"
                onClick={() => {
                  setEditing(false)
                  setContent(doc.content)
                  setTitle(doc.title)
                  setTags(doc.tags.join(', '))
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content (Markdown)
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded h-96 font-mono text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
          <div className="text-sm text-gray-500 mb-4">
            Created: {new Date(doc.createdAt).toLocaleString()}
            {doc.tags.length > 0 && (
              <span className="ml-4">
                Tags: {doc.tags.map((t: string) => `#${t}`).join(' ')}
              </span>
            )}
          </div>
          <div className="prose max-w-none bg-white p-6 rounded-lg shadow">
            <ReactMarkdown>{doc.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
