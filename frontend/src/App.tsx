import * as React from 'react'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import DocumentView from './components/DocumentView'
import Search from './components/Search'
import Trash from './components/Trash'
import Progress from './components/Progress'
import WorkspaceBrowser from './components/WorkspaceBrowser'
import Settings from './components/Settings'
import { api } from './utils/api'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    // Check token validity
    if (isLoggedIn) {
      api.get('/api/me').catch(() => {
        setIsLoggedIn(false)
        localStorage.removeItem('token')
      })
    }
  }, [isLoggedIn])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {!isLoggedIn ? (
          <Login onLogin={() => setIsLoggedIn(true)} />
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/document/:projectId/:folderId/:docId" element={<DocumentView />} />
            <Route path="/search" element={<Search />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/progress/:projectId" element={<Progress />} />
            <Route path="/workspace" element={<WorkspaceBrowser />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  )
}

export default App
