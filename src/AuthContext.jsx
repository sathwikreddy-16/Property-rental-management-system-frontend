import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const KEY = 'haven.session.v2'

function readSession() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)
  const signIn = (details) => {
    const next = { name: details.user.name, email: details.user.email, role: details.user.role, token: details.token }
    localStorage.setItem(KEY, JSON.stringify(next))
    setUser(next)
    return next
  }
  const signOut = () => { localStorage.removeItem(KEY); setUser(null) }
  const value = useMemo(() => ({ user, signIn, signOut }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

