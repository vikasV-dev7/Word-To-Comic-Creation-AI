import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import NavBar from '../components/NavBar'
import { useUser } from '../store/UserContext'

const CARDS = [
  {
    id: 'memory',
    emoji: '✨',
    title: 'Memory Canvas',
    subtitle: 'Turn your memories into comic stories',
    path: '/memory-canvas',
    blobClass: 'blob-1',
    delay: 0,
  },
  {
    id: 'cover',
    emoji: '🎨',
    title: 'Cover Canvas',
    subtitle: 'Design your comic front & back covers',
    path: '/cover-canvas',
    blobClass: 'blob-2',
    delay: 0.1,
  },
  {
    id: 'flashback',
    emoji: '📖',
    title: 'Flashback',
    subtitle: 'Revisit all your past comic creations',
    path: '/flashback',
    blobClass: 'blob-3',
    delay: 0.2,
  },
]

export default function Dashboard() {
  const { user, projects } = useUser()
  const navigate = useNavigate()
  const firstName = user?.name?.split(' ')[0] ?? 'Friend'

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh' }}>
      <NavBar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 64, textAlign: 'center' }}
        >
          <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: 'var(--theme-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Welcome back
          </span>
          <h1 style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 700,
            margin: '8px 0 12px',
            color: 'var(--theme-primary)',
            lineHeight: 1.1,
          }}>
            Hello, {firstName} ✨
          </h1>
          <p style={{ color: 'var(--theme-muted)', fontSize: 16, margin: 0, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Every memory you hold deserves to be told as a story. What would you like to create today?
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ display: 'flex', gap: 16, marginBottom: 56, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {[
            { label: 'Comics Created', value: projects.length },
            { label: 'Characters', value: projects.reduce((a, p) => a + p.characters.length, 0) },
            { label: 'Memories Stored', value: projects.reduce((a, p) => a + p.situations.length, 0) },
          ].map(stat => (
            <div
              key={stat.label}
              className="glass"
              style={{ padding: '16px 28px', borderRadius: 16, textAlign: 'center', minWidth: 120 }}
            >
              <p style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--theme-primary)', margin: 0 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 11, color: 'var(--theme-muted)', margin: 0, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Blob cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 32,
          justifyItems: 'center',
        }}>
          {CARDS.map(card => (
            <BlobCard key={card.id} card={card} onClick={() => navigate(card.path)} />
          ))}
        </div>

        {/* Recent projects preview */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ marginTop: 72 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, color: 'var(--theme-text)', margin: 0 }}>
                Recent Stories
              </h2>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => navigate('/flashback')}>
                View All →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {projects.slice(0, 4).map(p => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="glass"
                  style={{ borderRadius: 16, padding: 16, cursor: 'pointer' }}
                  onClick={() => navigate(`/memory-canvas/${p.id}`)}
                >
                  <div style={{
                    height: 80, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)',
                    marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32,
                  }}>
                    📚
                  </div>
                  <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: 14, color: 'var(--theme-text)' }}>{p.title || 'Untitled Story'}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--theme-muted)', fontFamily: "'DM Mono', monospace" }}>
                    {new Date(p.createdAt).toLocaleDateString()} · {p.language}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function BlobCard({ card, onClick }: { card: typeof CARDS[0]; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: card.delay + 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.06, y: -8 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{ cursor: 'pointer', width: '100%', maxWidth: 320 }}
    >
      <motion.div
        animate={{
          borderRadius: [
            '62% 38% 46% 54% / 60% 44% 56% 40%',
            '48% 52% 60% 40% / 52% 64% 36% 48%',
            '55% 45% 35% 65% / 60% 44% 56% 40%',
            '62% 38% 46% 54% / 60% 44% 56% 40%',
          ],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: card.delay * 2 }}
        style={{
          background: 'var(--theme-card-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--theme-border)',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          boxShadow: `0 0 40px var(--theme-glow), 0 16px 40px rgba(0,0,0,0.3)`,
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: card.delay }}
          style={{ fontSize: 56, filter: 'drop-shadow(0 4px 12px var(--theme-glow))' }}
        >
          {card.emoji}
        </motion.div>
        <h3 style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 24, fontWeight: 700,
          color: 'var(--theme-primary)',
          margin: 0, textAlign: 'center',
          letterSpacing: '0.01em',
        }}>
          {card.title}
        </h3>
        <p style={{ color: 'var(--theme-muted)', fontSize: 13, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
          {card.subtitle}
        </p>
        <div style={{
          marginTop: 12,
          padding: '8px 20px',
          borderRadius: 50,
          background: 'var(--theme-primary)',
          color: 'var(--theme-bg)',
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 600, fontSize: 14,
          letterSpacing: '0.02em',
        }}>
          Open →
        </div>
      </motion.div>
    </motion.div>
  )
}
