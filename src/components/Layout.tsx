import { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  Home, Upload, BookOpen, 
  Users, Map, Clapperboard
} from 'lucide-react'
import { useUser } from '../store/UserContext'

interface LayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
  bottomPanel?: ReactNode;
  title?: string;
}

export default function Layout({ children, rightPanel, bottomPanel, title }: LayoutProps) {
  const { user } = useUser()
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'Upload Story', icon: <Upload size={20} />, path: '/upload' },
    { name: 'Story Review', icon: <BookOpen size={20} />, path: '/story-review' },
    { name: 'Characters', icon: <Users size={20} />, path: '/characters' },
    { name: 'World', icon: <Map size={20} />, path: '/world' },
    { name: 'Scenes', icon: <Clapperboard size={20} />, path: '/scenes' },
  ]

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] text-white overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1f1f23] bg-[#0d0d12] flex flex-col shrink-0 transition-all duration-300">
        <div className="p-5 flex items-center gap-3 border-b border-[#1f1f23]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            S
          </div>
          <span className="font-semibold text-lg tracking-wide">Story OS</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-indigo-500/15 text-indigo-400' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a20]'
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#1f1f23]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
              <span className="text-xs text-gray-500">Creator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#1f1f23] bg-[#0a0a0c]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
          <h1 className="text-xl font-semibold">{title || 'Workspace'}</h1>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-medium bg-[#131318] border border-[#2a2a30] px-3 py-1.5 rounded-full text-indigo-400">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
               </span>
               API Connected
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto relative flex">
          {/* Main workspace (left) */}
          <div className="flex-1 h-full overflow-y-auto p-6 scroll-smooth">
            {children}
          </div>

          {/* Right Panel Intelligence (optional) */}
          {rightPanel && (
            <aside className="w-80 border-l border-[#1f1f23] bg-[#0d0d12] overflow-y-auto shrink-0 hidden lg:block">
              {rightPanel}
            </aside>
          )}
        </main>

        {/* Bottom Panel (optional) */}
        {bottomPanel && (
          <footer className="h-64 border-t border-[#1f1f23] bg-[#0d0d12] shrink-0 overflow-y-auto">
            {bottomPanel}
          </footer>
        )}
      </div>

    </div>
  )
}
