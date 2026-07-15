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
const STORAGE_KEY_PROJECTS = 'memora_projects'

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || 'null') } catch { return null }
  })
  const [projects, setProjects] = useState<ComicProject[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_PROJECTS) || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  }, [user])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects))
  }, [projects])

  // Apply theme class to body based on gender
  useEffect(() => {
    document.body.classList.remove('theme-female', 'theme-male')
    if (user?.gender === 'female') document.body.classList.add('theme-female')
    else if (user?.gender === 'male') document.body.classList.add('theme-male')
  }, [user])

  const login = (u: User) => setUser(u)
  const logout = () => { setUser(null); document.body.classList.remove('theme-female', 'theme-male') }
  const addProject = (p: ComicProject) => setProjects(prev => [p, ...prev])
  const updateProject = (p: ComicProject) => setProjects(prev => prev.map(x => x.id === p.id ? p : x))
  const deleteProject = (id: string) => setProjects(prev => prev.filter(x => x.id !== id))

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
