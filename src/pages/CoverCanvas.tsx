import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import NavBar from '../components/NavBar'
import { useUser } from '../store/UserContext'
import type { FrontCover, BackCover } from '../types'
import { generateComic, type ComicScript } from '../comic/generator'
import ComicPage from '../comic/ComicPage'

const COMIC_STYLES = ['Manga','Western Comics','Webtoon','Chibi','Realistic','Watercolor','Ink & Sketch','Vintage','Minimalist','Retro Pop']
const COVER_THEMES = ['Adventure','Romance','Mystery','Fantasy','Sci-Fi','Slice of Life','Horror','Comedy','Drama','Action']


const TABS = [
  { id: 'front', label: '📕 Front Cover' },
  { id: 'back', label: '📗 Back Cover' },
]

export default function CoverCanvas() {
  const { projects, updateProject } = useUser()
  const { id } = useParams()
  const navigate = useNavigate()

  const project = id ? projects.find(p => p.id === id) : projects[0]

  const [tab, setTab] = useState<'front' | 'back'>('front')
  const [front, setFront] = useState<FrontCover>(project?.frontCover ?? {
    title: project?.title ?? '',
    authorName: '',
    characterArrangement: '',
    comicStyle: 'Manga',
    coverTheme: 'Adventure',
    backgroundColor: '#1a0f2e',
    typography: 'Bold & Dramatic',
  })
  const [back, setBack] = useState<BackCover>(project?.backCover ?? { authorName: '', authorDescription: '' })
  const [generating, setGenerating] = useState(false)
  const [bioGenerated, setBioGenerated] = useState(false)
  const [saved, setSaved] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewPageIdx, setReviewPageIdx] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)

  const [comicScript, setComicScript] = useState<ComicScript | null>(null)

  useEffect(() => {
    if (project) {
      generateComic(project).then(setComicScript).catch(console.error)
    }
  }, [project])

  const reviewPages: { type: 'front' | 'page' | 'back'; data: any }[] = []
  if (project && comicScript) {
    reviewPages.push({ type: 'front', data: front })
    comicScript.pages.forEach(p => reviewPages.push({ type: 'page', data: p }))
    reviewPages.push({ type: 'back', data: back })
  }

  const handleSave = () => {
    if (!project) return
    updateProject({ ...project, frontCover: front, backCover: back })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExportPdf = async () => {
    if (!project || !comicScript) return
    setExporting(true)
    setExportSuccess(null)
    updateProject({ ...project, frontCover: front, backCover: back })
    
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, script: comicScript, frontCover: front, backCover: back })
      })
      if (!response.ok) throw new Error('API failed')
      const result = await response.json()
      
      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${result.pdfBase64}`
      link.download = result.fileName
      link.click()
      
      setExportSuccess(result.pdfPath)
    } catch (err) {
      console.error(err)
      alert('Failed to export PDF.')
    } finally {
      setExporting(false)
    }
  }

  const handleGenerateBio = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1800))
    setBack(b => ({
      ...b,
      authorDescription: `${b.authorName || 'The author'} is a passionate storyteller who weaves personal memories into vivid comic narratives. With a unique voice and an eye for emotional truth, they bring characters to life through bold visuals and heartfelt dialogue. This comic is a love letter to the moments that shaped who they are.`,
    }))
    setGenerating(false)
    setBioGenerated(true)
  }

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh' }}>
      <NavBar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--theme-muted)', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
            <span className="memo-label" style={{ margin: 0 }}>Cover Canvas</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 32, color: 'var(--theme-primary)', margin: 0 }}>
              🎨 Design Your Cover
            </h1>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-secondary"
                onClick={() => setReviewOpen(true)}
                style={{ fontSize: 14, padding: '10px 22px' }}
              >
                📖 Review & Export
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                style={{ background: saved ? '#22c55e' : undefined, fontSize: 14, padding: '10px 22px' }}
              >
                {saved ? '✓ Saved!' : '💾 Save Cover'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'front' | 'back')}
              style={{
                padding: '10px 24px', borderRadius: 50,
                border: `1px solid ${tab === t.id ? 'var(--theme-primary)' : 'var(--theme-border)'}`,
                background: tab === t.id ? 'var(--theme-primary)' : 'transparent',
                color: tab === t.id ? 'var(--theme-bg)' : 'var(--theme-muted)',
                fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 15,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'front' ? (
            <motion.div key="front" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <FrontCoverForm front={front} setFront={setFront} />
            </motion.div>
          ) : (
            <motion.div key="back" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <BackCoverForm
                back={back}
                setBack={setBack}
                onGenerateBio={handleGenerateBio}
                generating={generating}
                bioGenerated={bioGenerated}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Review Modal */}
        <AnimatePresence>
          {reviewOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(5,5,10,0.98)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-start',
                zIndex: 400,
                fontFamily: "'Nunito', sans-serif",
              }}
              onClick={() => setReviewOpen(false)}
            >
              <div
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 24px', background: 'rgba(0,0,0,0.6)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
                onClick={e => e.stopPropagation()}
              >
                <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, color: 'var(--theme-primary)', margin: 0 }}>
                  Comic Book Review & Export
                </h2>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="btn-primary"
                    onClick={handleExportPdf}
                    disabled={exporting}
                    style={{ background: exporting ? 'var(--theme-muted)' : 'var(--theme-primary)', fontSize: 14, padding: '8px 20px' }}
                  >
                    {exporting ? '⏳ Exporting PDF…' : '📥 Export PDF'}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setReviewOpen(false)}
                    style={{ fontSize: 14, padding: '8px 20px' }}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Content area */}
              <div
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '24px', width: '100%', gap: 20
                }}
                onClick={e => e.stopPropagation()}
              >
                {exportSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass"
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      borderColor: 'rgba(34, 197, 94, 0.3)',
                      borderRadius: 12, padding: '12px 24px',
                      color: '#4ade80', fontSize: 13, textAlign: 'center',
                      maxWidth: 500,
                    }}
                  >
                    🎉 PDF exported and downloaded successfully!<br/>
                    Saved to file explorer: <span style={{ fontFamily: "'DM Mono', monospace", background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: 4 }}>{exportSuccess}</span>
                  </motion.div>
                )}

                {/* Page view container */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setReviewPageIdx(p => Math.max(0, p - 1))}
                    disabled={reviewPageIdx === 0}
                    style={{ borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, padding: 0 }}
                  >
                    ←
                  </button>

                  <div style={{ minWidth: 380, minHeight: 536, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {reviewPages[reviewPageIdx]?.type === 'front' && (
                      <CoverPreviewLarge front={front} />
                    )}
                    {reviewPages[reviewPageIdx]?.type === 'page' && (
                      <ComicPage page={reviewPages[reviewPageIdx].data} pageWidth={380} pageHeight={536} showPageNumber={true} />
                    )}
                    {reviewPages[reviewPageIdx]?.type === 'back' && (
                      <BackCoverPreview back={back} />
                    )}
                  </div>

                  <button
                    className="btn-secondary"
                    onClick={() => setReviewPageIdx(p => Math.min(reviewPages.length - 1, p + 1))}
                    disabled={reviewPageIdx === reviewPages.length - 1}
                    style={{ borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, padding: 0 }}
                  >
                    →
                  </button>
                </div>

                {/* Indicator */}
                <div style={{ color: 'var(--theme-muted)', fontFamily: "'DM Mono', monospace", fontSize: 14 }}>
                  {reviewPages[reviewPageIdx]?.type === 'front' && 'Front Cover'}
                  {reviewPages[reviewPageIdx]?.type === 'page' && `Page ${reviewPages[reviewPageIdx].data.number} of ${project?.pages}`}
                  {reviewPages[reviewPageIdx]?.type === 'back' && 'Back Cover'}
                  {`  (Page ${reviewPageIdx + 1} / ${reviewPages.length})`}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function BackCoverPreview({ back }: { back: BackCover }) {
  return (
    <div style={{
      width: 340,
      height: 480,
      background: '#111827',
      borderRadius: 20,
      border: '2px solid var(--theme-primary)',
      boxShadow: '0 0 60px var(--theme-glow), 0 40px 80px rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 28,
      position: 'relative',
      color: '#ffffff'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'var(--theme-primary)' }} />
      <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 24, color: 'var(--theme-primary)', marginTop: 20, marginBottom: 20 }}>
        ABOUT THE AUTHOR
      </h3>
      {back.authorName && (
        <h4 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, margin: '0 0 12px', color: '#fff' }}>
          {back.authorName}
        </h4>
      )}
      {back.authorDescription && (
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: '#d1d5db', textAlign: 'center', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: 220 }}>
          {back.authorDescription}
        </p>
      )}
      {back.signatureDataUrl && (
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Author Signature</p>
          <img src={back.signatureDataUrl} alt="Signature" style={{ height: 60, objectFit: 'contain', background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }} />
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: 'var(--theme-accent)' }} />
    </div>
  )
}

/* ─── Front Cover ─── */
function FrontCoverForm({ front, setFront }: { front: FrontCover; setFront: React.Dispatch<React.SetStateAction<FrontCover>> }) {
  const upd = (field: keyof FrontCover, value: string) => setFront(f => ({ ...f, [field]: value }))
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
      {/* Form */}
      <div className="glass" style={{ borderRadius: 20, padding: 28 }}>
        <h3 style={{ fontFamily: "'Fredoka', sans-serif", color: 'var(--theme-primary)', fontSize: 20, margin: '0 0 20px' }}>📕 Front Cover Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CField label="Comic Title">
            <input className="memo-input" placeholder="Your comic title" value={front.title} onChange={e => upd('title', e.target.value)} />
          </CField>
          <CField label="Author Name">
            <input className="memo-input" placeholder="Your name" value={front.authorName} onChange={e => upd('authorName', e.target.value)} />
          </CField>
          <CField label="Comic Style">
            <select className="memo-input" value={front.comicStyle} onChange={e => upd('comicStyle', e.target.value)}>
              {COMIC_STYLES.map(s => <option key={s}>{s}</option>)}
            </select>
          </CField>
          <CField label="Cover Theme">
            <select className="memo-input" value={front.coverTheme} onChange={e => upd('coverTheme', e.target.value)}>
              {COVER_THEMES.map(t => <option key={t}>{t}</option>)}
            </select>
          </CField>
          <CField label="Typography Style">
            <select className="memo-input" value={front.typography} onChange={e => upd('typography', e.target.value)}>
              {['Bold & Dramatic','Elegant Serif','Playful Rounded','Handwritten','Minimalist Sans','Retro Display'].map(t => <option key={t}>{t}</option>)}
            </select>
          </CField>
          <CField label="Background Color">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input className="memo-input" value={front.backgroundColor} onChange={e => upd('backgroundColor', e.target.value)} placeholder="#1a0f2e" style={{ flex: 1 }} />
              <input type="color" value={front.backgroundColor} onChange={e => upd('backgroundColor', e.target.value)} style={{ width: 48, height: 40, borderRadius: 8, border: '1px solid var(--theme-border)', cursor: 'pointer', padding: 2 }} />
            </div>
          </CField>
          <CField label="Character Arrangement">
            <textarea className="memo-input" placeholder="e.g. Two characters facing each other at sunset, protagonist in foreground looking determined…" value={front.characterArrangement} onChange={e => upd('characterArrangement', e.target.value)} style={{ minHeight: 80 }} />
          </CField>
          <CField label="Character Image (Optional)">
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
              border: '1px dashed var(--theme-border)', borderRadius: 12,
              cursor: 'pointer', color: 'var(--theme-muted)', fontSize: 13,
            }}>
              <span>🖼️</span> {front.characterImageUrl ? 'Image attached ✓' : 'Upload character image for cover'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                const f = e.target.files?.[0]
                if (f) upd('characterImageUrl', URL.createObjectURL(f))
              }} />
            </label>
          </CField>
        </div>
        <button className="btn-primary" style={{ marginTop: 24, width: '100%' }} onClick={() => setPreviewOpen(true)}>
          ✨ Generate Cover Preview
        </button>
      </div>

      {/* Live preview */}
      <CoverPreview front={front} />

      {/* Preview modal */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(8px)' }}
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative' }}
            >
              <CoverPreviewLarge front={front} />
              <button onClick={() => setPreviewOpen(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CoverPreview({ front }: { front: FrontCover }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: 280, height: 380,
        background: front.backgroundColor || '#1a0f2e',
        borderRadius: 16,
        border: '1px solid var(--theme-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 20,
        flexShrink: 0,
      }}
    >
      {/* Decorative top band */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'var(--theme-primary)' }} />

      {front.characterImageUrl ? (
        <img src={front.characterImageUrl} alt="Cover" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, marginTop: 12 }} />
      ) : (
        <div style={{
          width: '100%', height: 180, borderRadius: 10, marginTop: 12,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 48, color: 'rgba(255,255,255,0.2)',
        }}>
          🎭
        </div>
      )}

      <div style={{ marginTop: 'auto', textAlign: 'center', width: '100%' }}>
        <p style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: front.title.length > 15 ? 18 : 22,
          fontWeight: 700,
          color: 'var(--theme-primary)',
          margin: '12px 0 4px',
          lineHeight: 1.2,
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          {front.title || 'Your Comic Title'}
        </p>
        {front.authorName && (
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            by {front.authorName}
          </p>
        )}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
          {front.comicStyle && <span className="chip" style={{ fontSize: 10 }}>{front.comicStyle}</span>}
          {front.coverTheme && <span className="chip" style={{ fontSize: 10 }}>{front.coverTheme}</span>}
        </div>
      </div>

      {/* Bottom band */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'var(--theme-accent)' }} />
    </motion.div>
  )
}

function CoverPreviewLarge({ front }: { front: FrontCover }) {
  return (
    <div style={{
      width: 340, height: 480,
      background: front.backgroundColor || '#1a0f2e',
      borderRadius: 20,
      border: '2px solid var(--theme-primary)',
      boxShadow: '0 0 60px var(--theme-glow), 0 40px 80px rgba(0,0,0,0.6)',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 28,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'var(--theme-primary)' }} />
      {front.characterImageUrl ? (
        <img src={front.characterImageUrl} alt="Cover" style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, marginTop: 14 }} />
      ) : (
        <div style={{ width: '100%', height: 220, borderRadius: 12, marginTop: 14, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>🎭</div>
      )}
      <div style={{ marginTop: 'auto', textAlign: 'center', width: '100%' }}>
        <p style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--theme-primary)', margin: '16px 0 6px', lineHeight: 1.2 }}>
          {front.title || 'Your Comic Title'}
        </p>
        {front.authorName && <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>by {front.authorName}</p>}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          {front.comicStyle && <span className="chip">{front.comicStyle}</span>}
          {front.coverTheme && <span className="chip">{front.coverTheme}</span>}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: 'var(--theme-accent)' }} />
    </div>
  )
}

/* ─── Back Cover ─── */
function BackCoverForm({ back, setBack, onGenerateBio, generating, bioGenerated }: {
  back: BackCover; setBack: React.Dispatch<React.SetStateAction<BackCover>>
  onGenerateBio: () => void; generating: boolean; bioGenerated: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [sigColor, setSigColor] = useState('#D97A9B')
  const [brushSize, setBrushSize] = useState(3)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const startDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    lastPos.current = getPos(e, canvas)
  }, [])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!drawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !lastPos.current) return
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.strokeStyle = sigColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }, [drawing, sigColor, brushSize])

  const endDraw = useCallback(() => {
    setDrawing(false)
    lastPos.current = null
    const canvas = canvasRef.current
    if (canvas) {
      setBack(b => ({ ...b, signatureDataUrl: canvas.toDataURL() }))
    }
  }, [setBack])

  const clearSig = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setBack(b => ({ ...b, signatureDataUrl: undefined }))
  }

  return (
    <div className="glass" style={{ borderRadius: 20, padding: 28 }}>
      <h3 style={{ fontFamily: "'Fredoka', sans-serif", color: 'var(--theme-primary)', fontSize: 20, margin: '0 0 24px' }}>📗 Back Cover Details</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <CField label="Author Name">
          <input className="memo-input" placeholder="Your full name" value={back.authorName} onChange={e => setBack(b => ({ ...b, authorName: e.target.value }))} />
        </CField>

        <CField label="Author Description">
          <textarea className="memo-input" placeholder="Describe yourself, your journey, what inspired this comic…" value={back.authorDescription} onChange={e => setBack(b => ({ ...b, authorDescription: e.target.value }))} style={{ minHeight: 100 }} />
          <button
            className="btn-secondary"
            onClick={onGenerateBio}
            disabled={generating}
            style={{ marginTop: 8, fontSize: 12, padding: '6px 16px', opacity: generating ? 0.6 : 1 }}
          >
            {generating ? '✨ Generating…' : bioGenerated ? '🔄 Regenerate Bio' : '✨ AI Generate Bio'}
          </button>
        </CField>

        {/* Digital Signature */}
        <div>
          <label className="memo-label" style={{ marginBottom: 12, display: 'block' }}>✍️ Digital Signature</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--theme-muted)', fontFamily: "'DM Mono', monospace" }}>Color</span>
              <input type="color" value={sigColor} onChange={e => setSigColor(e.target.value)} style={{ width: 40, height: 32, borderRadius: 8, border: '1px solid var(--theme-border)', cursor: 'pointer', padding: 2 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--theme-muted)', fontFamily: "'DM Mono', monospace" }}>Size</span>
              <input type="range" min={1} max={12} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} style={{ width: 100, accentColor: 'var(--theme-primary)' }} />
              <span style={{ fontSize: 12, color: 'var(--theme-primary)', fontFamily: "'DM Mono', monospace" }}>{brushSize}px</span>
            </div>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={clearSig}>Clear</button>
          </div>
          <canvas
            ref={canvasRef}
            width={600}
            height={160}
            className="sig-canvas"
            style={{ width: '100%', height: 160, display: 'block', background: 'rgba(255,255,255,0.03)' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          <p style={{ fontSize: 11, color: 'var(--theme-muted)', marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
            Draw your signature above — it will appear on the back cover.
          </p>
        </div>
      </div>
    </div>
  )
}

function CField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="memo-label">{label}</label>
      {children}
    </div>
  )
}
