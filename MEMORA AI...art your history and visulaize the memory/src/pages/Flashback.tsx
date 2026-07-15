import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import NavBar from '../components/NavBar'
import { useUser } from '../store/UserContext'
import type { ComicProject } from '../types'

const EMOTIONS = ['All', 'Happy', 'Sad', 'Nostalgic', 'Funny', 'Romantic', 'Adventurous']
const YEARS = ['All', '2024', '2023', '2022', '2021', '2020']

export default function Flashback() {
  const { projects, deleteProject } = useUser()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterEmotion, setFilterEmotion] = useState('All')
  const [filterYear, setFilterYear] = useState('All')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.language?.toLowerCase().includes(search.toLowerCase())
    const matchEmotion = filterEmotion === 'All' || p.emotion === filterEmotion
    const matchYear = filterYear === 'All' || new Date(p.createdAt).getFullYear().toString() === filterYear
    return matchSearch && matchEmotion && matchYear
  })

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh' }}>
      <NavBar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ marginBottom: 40 }}>
            <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: 'var(--theme-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Your Archive
            </span>
            <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 40, fontWeight: 700, color: 'var(--theme-primary)', margin: '8px 0 4px' }}>
              📖 Flashback
            </h1>
            <p style={{ color: 'var(--theme-muted)', margin: 0 }}>Every story you've ever told, waiting to be revisited.</p>
          </div>

          {/* Search + Filters */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
            <input
              className="memo-input"
              placeholder="🔍 Search your memories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <select className="memo-input" value={filterEmotion} onChange={e => setFilterEmotion(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
              {EMOTIONS.map(e => <option key={e} value={e}>{e === 'All' ? '😊 Emotion' : e}</option>)}
            </select>
            <select className="memo-input" value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ width: 'auto', minWidth: 120 }}>
              {YEARS.map(y => <option key={y} value={y}>{y === 'All' ? '📅 Year' : y}</option>)}
            </select>
          </div>

          {/* Projects grid */}
          {filtered.length === 0 ? (
            <EmptyState onCreate={() => navigate('/memory-canvas')} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              <AnimatePresence>
                {filtered.map((project, i) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={i}
                    onOpen={() => navigate(`/memory-canvas/${project.id}`)}
                    onEdit={() => navigate(`/memory-canvas/${project.id}`)}
                    onDelete={() => setConfirmDelete(project.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="glass"
              style={{ borderRadius: 20, padding: 32, maxWidth: 360, textAlign: 'center' }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{ fontSize: 36, margin: '0 0 12px' }}>🗑️</p>
              <h3 style={{ fontFamily: "'Fredoka', sans-serif", color: 'var(--theme-text)', margin: '0 0 8px' }}>Delete this story?</h3>
              <p style={{ color: 'var(--theme-muted)', fontSize: 13, marginBottom: 24 }}>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button
                  className="btn-primary"
                  style={{ flex: 1, background: '#ef4444' }}
                  onClick={() => { deleteProject(confirmDelete); setConfirmDelete(null) }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProjectCard({ project, index, onOpen, onEdit, onDelete }: {
  project: ComicProject; index: number
  onOpen: () => void; onEdit: () => void; onDelete: () => void
}) {
  const [hover, setHover] = useState(false)
  const palette = ['#D97A9B', '#5878A8', '#a78bfa', '#34d399', '#fb923c']
  const bg = palette[index % palette.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="glass"
      style={{ borderRadius: 20, overflow: 'hidden', cursor: 'pointer' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Thumbnail */}
      <div
        onClick={onOpen}
        style={{
          height: 140,
          background: `linear-gradient(135deg, ${bg}66 0%, ${bg}33 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 56, position: 'relative', overflow: 'hidden',
          borderBottom: '1px solid var(--theme-border)',
        }}
      >
        <motion.span animate={{ y: hover ? -4 : 0 }} transition={{ duration: 0.3 }}>📚</motion.span>
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
        }}>
          <span className="chip" style={{ fontSize: 10 }}>{project.status}</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <h3 onClick={onOpen} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 17, color: 'var(--theme-text)', margin: '0 0 6px', cursor: 'pointer' }}>
          {project.title || 'Untitled Story'}
        </h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {project.language && <span className="chip">{project.language}</span>}
          {project.emotion && <span className="chip">{project.emotion}</span>}
          <span className="chip">{project.pages} pages</span>
        </div>
        <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--theme-muted)', fontFamily: "'DM Mono', monospace" }}>
          {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--theme-muted)' }}>
          {project.characters.length} character{project.characters.length !== 1 ? 's' : ''} · {project.situations.length} scene{project.situations.length !== 1 ? 's' : ''}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <ActionBtn label="Open" onClick={onOpen} />
          <ActionBtn label="Edit" onClick={onEdit} />
          <ActionBtn label="🗑️" onClick={onDelete} danger />
        </div>
      </div>
    </motion.div>
  )
}

function ActionBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: danger ? 'none' : 1,
        padding: '6px 10px',
        borderRadius: 10,
        border: `1px solid ${danger ? '#ef444433' : 'var(--theme-border)'}`,
        background: 'transparent',
        color: danger ? '#ef4444' : 'var(--theme-primary)',
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 700, fontSize: 12, cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? '#ef444422' : 'var(--theme-glow)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {label}
    </button>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ textAlign: 'center', padding: '80px 20px' }}
    >
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: 80, marginBottom: 20 }}>
        📭
      </motion.div>
      <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 24, color: 'var(--theme-primary)', marginBottom: 8 }}>
        No stories yet
      </h3>
      <p style={{ color: 'var(--theme-muted)', marginBottom: 28 }}>Your flashback will be full of memories soon.</p>
      <button className="btn-primary" onClick={onCreate}>✨ Create Your First Story</button>
    </motion.div>
  )
}
