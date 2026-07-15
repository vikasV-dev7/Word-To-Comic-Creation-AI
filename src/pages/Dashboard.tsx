import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, BookOpen, Clock, MoreVertical, Search, Folder, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'

interface Project {
  id: string;
  title: string;
  status: string;
  updatedAt?: string;
  language?: string;
}

const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch('http://localhost:8000/api/projects')
  if (!res.ok) throw new Error('Network response was not ok')
  const data = await res.json()
  return data.projects || []
}

const createProject = async (title: string) => {
  const newId = `proj_${Date.now()}`
  const res = await fetch('http://localhost:8000/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: newId,
      title,
      status: 'draft',
      language: 'English'
    })
  })
  if (!res.ok) throw new Error('Failed to create project')
  return newId
}

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects
  })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate(`/upload?project=${newId}`)
    },
  })

  const handleCreateNew = () => {
    setIsCreating(true)
    createMutation.mutate("Untitled Story")
  }

  const filteredProjects = projects.filter((p: Project) => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const intelligencePanel = (
    <div className="p-5 flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
        <button 
          onClick={handleCreateNew}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all disabled:opacity-50"
        >
          {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          New Project
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Workflow State</h3>
        <div className="bg-[#131318] border border-[#1f1f23] rounded-lg p-4">
          <div className="flex items-center gap-3 text-sm mb-2">
            <CheckCircleIcon active={true} /> <span className="text-gray-300">Backend API Connected</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircleIcon active={true} /> <span className="text-gray-300">Model Router Idle</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Layout title="Dashboard" rightPanel={intelligencePanel}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Area */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold font-['Fredoka',sans-serif]">Recent Projects</h2>
          
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search stories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131318] border border-[#2a2a30] text-sm text-gray-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Project Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading projects...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">
            Failed to load projects. Make sure the backend is running on port 8000.
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#2a2a30] rounded-2xl bg-[#0d0d12]">
            <Folder size={48} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300">No projects found</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">Create a new project to start building your story.</p>
            <button 
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg font-medium transition-all"
            >
              <Plus size={18} /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/upload?project=${project.id}`)}
                className="group relative bg-[#131318] border border-[#1f1f23] hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={18} />
                </div>
                
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg mb-4 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
                
                <h3 className="font-semibold text-gray-100 truncate pr-6">{project.title}</h3>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="capitalize">{project.status || 'Draft'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Just now'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

function CheckCircleIcon({ active }: { active: boolean }) {
  return (
    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  )
}
