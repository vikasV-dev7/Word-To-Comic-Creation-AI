import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './store/UserContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Flashback from './pages/Flashback'
import MemoryCanvas from './pages/MemoryCanvas'
import CoverCanvas from './pages/CoverCanvas'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useUser()
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
      <Route path="/flashback" element={<AuthGuard><Flashback /></AuthGuard>} />
      <Route path="/memory-canvas" element={<AuthGuard><MemoryCanvas /></AuthGuard>} />
      <Route path="/memory-canvas/:id" element={<AuthGuard><MemoryCanvas /></AuthGuard>} />
      <Route path="/cover-canvas" element={<AuthGuard><CoverCanvas /></AuthGuard>} />
      <Route path="/cover-canvas/:id" element={<AuthGuard><CoverCanvas /></AuthGuard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  )
}
