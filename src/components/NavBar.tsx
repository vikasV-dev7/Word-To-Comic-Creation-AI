import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../store/UserContext'

export default function NavBar() {
  const { user, logout } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const firstName = user?.name?.split(' ')[0] ?? 'Friend'

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 32px', position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--theme-border)',
    }}>
      {/* Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        onClick={() => navigate('/dashboard')}
      >
        <span style={{ fontSize: 24 }}>📖</span>
        <span style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 22, fontWeight: 700,
          color: 'var(--theme-primary)',
          letterSpacing: '0.01em',
        }}>
          MemoraAI
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {[
          { label: '🏠 Home', path: '/dashboard' },
          { label: '📖 Flashback', path: '/flashback' },
          { label: '🎨 Memory Canvas', path: '/memory-canvas' },
          { label: '📚 Cover Canvas', path: '/cover-canvas' },
        ].map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: location.pathname === item.path ? 'var(--theme-glow)' : 'transparent',
              border: location.pathname === item.path ? '1px solid var(--theme-primary)' : '1px solid transparent',
              borderRadius: 50,
              padding: '6px 14px',
              color: location.pathname === item.path ? 'var(--theme-primary)' : 'var(--theme-muted)',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--theme-glow)',
            border: '1px solid var(--theme-border)',
            borderRadius: 50, padding: '8px 16px',
            cursor: 'pointer', color: 'var(--theme-text)',
            fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14,
          }}
        >
          <span style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--theme-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'var(--theme-bg)', fontWeight: 700,
          }}>
            {firstName[0].toUpperCase()}
          </span>
          {firstName}
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: '110%', right: 0,
                minWidth: 200,
                background: 'var(--theme-surface)',
                border: '1px solid var(--theme-border)',
                borderRadius: 16,
                padding: 8,
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--theme-border)', marginBottom: 4 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--theme-text)' }}>{user?.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--theme-muted)', fontFamily: "'DM Mono', monospace" }}>{user?.email}</p>
              </div>
              <MenuItem label="⚙️ Settings" onClick={() => { setMenuOpen(false) }} />
              <MenuItem label="🚪 Sign Out" onClick={() => { logout(); navigate('/') }} danger />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '8px 12px', borderRadius: 10, border: 'none',
        background: 'transparent', cursor: 'pointer',
        color: danger ? '#f87171' : 'var(--theme-text)',
        fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 600,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--theme-glow)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {label}
    </button>
  )
}
