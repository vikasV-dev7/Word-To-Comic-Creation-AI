import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ComicScript } from './generator'
import ComicPage from './ComicPage'

interface Props {
  comic: ComicScript
  onClose: () => void
}

export default function ComicViewer({ comic, onClose }: Props) {
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [direction, setDirection] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalPages = comic.pages.length
  const page = comic.pages[currentPage]

  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setDirection(1)
      setCurrentPage(p => p + 1)
    }
  }, [currentPage, totalPages])

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setDirection(-1)
      setCurrentPage(p => p - 1)
    }
  }, [currentPage])

  // Keyboard navigation
  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
    if (e.key === 'Escape') onClose()
  }, [goNext, goPrev, onClose])

  // Responsive page size
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 900
  const maxW = Math.min(640, viewportW * 0.85)
  const maxH = viewportH * 0.78
  const pageAspect = 680 / 960
  let pageW = maxW
  let pageH = pageW / pageAspect
  if (pageH > maxH) { pageH = maxH; pageW = pageH * pageAspect }
  pageW = Math.round(pageW * zoom)
  pageH = Math.round(pageH * zoom)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5,5,10,0.97)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        zIndex: 500,
        fontFamily: "'Nunito', sans-serif",
      }}
      tabIndex={0}
      onKeyDown={handleKey}
      ref={containerRef}
    >
      {/* ─── Top bar ─── */}
      <div style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(0,0,0,0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>📚</span>
          <div>
            <p style={{ margin: 0, fontFamily: "'Fredoka', sans-serif", fontSize: 18, color: 'var(--theme-primary)', fontWeight: 700 }}>
              {comic.title}
            </p>
            {comic.tikTikLabel && (
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Mono', monospace" }}>
                {comic.tikTikLabel}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Zoom */}
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} style={iconBtn}>−</button>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Mono', monospace", minWidth: 40, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} style={iconBtn}>+</button>
          <button onClick={() => setZoom(1)} style={{ ...iconBtn, fontSize: 11, padding: '4px 8px' }}>Reset</button>

          {/* Close */}
          <button
            onClick={onClose}
            style={{ ...iconBtn, marginLeft: 8, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ─── Page viewer ─── */}
      <div
        style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', width: '100%' }}
        className="scroll-panel"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <AnimatePresence mode="wait">
            {page && (
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: direction * 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -80 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'top center' }}
              >
                <ComicPage
                  page={page}
                  pageWidth={pageW}
                  pageHeight={pageH}
                  showPageNumber
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Bottom nav ─── */}
      <div style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: '14px 20px',
        background: 'rgba(0,0,0,0.6)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
          style={{
            ...navBtn,
            opacity: currentPage === 0 ? 0.3 : 1,
            cursor: currentPage === 0 ? 'default' : 'pointer',
          }}
        >
          ← Prev
        </button>

        {/* Page dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 300 }}>
          {comic.pages.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > currentPage ? 1 : -1); setCurrentPage(i) }}
              style={{
                width: i === currentPage ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === currentPage ? 'var(--theme-primary)' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
              }}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentPage === totalPages - 1}
          style={{
            ...navBtn,
            opacity: currentPage === totalPages - 1 ? 0.3 : 1,
            cursor: currentPage === totalPages - 1 ? 'default' : 'pointer',
          }}
        >
          Next →
        </button>
      </div>

      {/* ─── Cover page (page 0 indicator) ─── */}
      {totalPages === 0 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
          No pages generated yet.
        </div>
      )}
    </motion.div>
  )
}

/* ─── Thumbnail strip (all pages overview) ─── */
export function ComicThumbnailStrip({ comic, currentPage, onSelect }: { comic: ComicScript; currentPage: number; onSelect: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0' }} className="scroll-panel">
      {comic.pages.map((page, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          style={{
            flexShrink: 0,
            width: 64, height: 90,
            border: i === currentPage ? '2px solid var(--theme-primary)' : '2px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Fredoka', sans-serif", fontSize: 11,
            color: i === currentPage ? 'var(--theme-primary)' : 'rgba(255,255,255,0.4)',
            transition: 'border-color 0.2s',
          }}
        >
          p.{page.number}
        </button>
      ))}
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: 'white',
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: 14,
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 600,
  transition: 'background 0.15s',
}

const navBtn: React.CSSProperties = {
  background: 'var(--theme-primary)',
  border: 'none',
  borderRadius: 50,
  color: 'var(--theme-bg)',
  padding: '10px 24px',
  fontFamily: "'Fredoka', sans-serif",
  fontWeight: 700,
  fontSize: 15,
  letterSpacing: '0.02em',
  transition: 'opacity 0.2s',
}
