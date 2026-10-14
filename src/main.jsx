import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'
import './styles.css'

function Root() {
  const [dark, setDark] = useState(() => localStorage.getItem('haven.theme') === 'dark')
  useEffect(() => {
    const toggle = () => setDark(value => !value)
    window.addEventListener('haven:toggle-theme', toggle)
    return () => window.removeEventListener('haven:toggle-theme', toggle)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('haven.theme', dark ? 'dark' : 'light')
  }, [dark])
  return <AuthProvider><App /></AuthProvider>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><Root /></React.StrictMode>)
