import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, ComicProject } from '../types'

interface UserContextValue {
  user: User | null
  projects: ComicProject[]
  login: (u: User) => void
  logout: () => void
  addProject: (p: ComicProject) => void
  updateProject: (p: ComicProject) => void
  deleteProject: (id: string) => void
}

const UserContext = createContext<UserContextValue | null>(null)

const STORAGE_KEY_USER = 'memora_user'


export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || 'null') } catch { return null }
  })
  const [projects, setProjects] = useState<ComicProject[]>([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  }, [user])

  // Fetch projects from the new Python backend
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data && data.projects) {
          setProjects(data.projects)
        }
      })
      .catch(err => console.error("Failed to load projects from backend:", err))
  }, [])

  // Apply theme class to body based on gender
  useEffect(() => {
    document.body.classList.remove('theme-female', 'theme-male')
    if (user?.gender === 'female') document.body.classList.add('theme-female')
    else if (user?.gender === 'male') document.body.classList.add('theme-male')
  }, [user])

  const login = (u: User) => setUser(u)
  const logout = () => { setUser(null); document.body.classList.remove('theme-female', 'theme-male') }
  
  const saveToBackend = async (p: ComicProject) => {
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: p.id,
          title: p.title,
          language: p.language || 'English',
          emotion: p.emotion || '',
          pages: p.pages || 10,
          status: p.status || 'draft',
          data: p
        })
      })
    } catch (err) {
      console.error("Failed to save project to backend:", err)
    }
  }

  const addProject = (p: ComicProject) => {
    setProjects(prev => [p, ...prev])
    saveToBackend(p)
  }
  
  const updateProject = (p: ComicProject) => {
    setProjects(prev => prev.map(x => x.id === p.id ? p : x))
    saveToBackend(p)
  }
  
  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(x => x.id !== id))
    // We haven't built a DELETE /api/projects endpoint yet, but UI works
  }

  return (
    <UserContext.Provider value={{ user, projects, login, logout, addProject, updateProject, deleteProject }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
