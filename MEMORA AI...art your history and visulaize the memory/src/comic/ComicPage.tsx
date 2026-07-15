import type { PageScript, LayoutType } from './generator'
import ComicPanel from './ComicPanel'

interface Props {
  page: PageScript
  pageWidth?: number
  pageHeight?: number
  showPageNumber?: boolean
}

const GAP = 4 // px between panels

export default function ComicPage({ page, pageWidth = 680, pageHeight = 960, showPageNumber = true }: Props) {
  const slots = getLayoutSlots(page.layout, page.panels.length, pageWidth, pageHeight)

  return (
    <div style={{
      width: pageWidth,
      height: pageHeight,
      background: 'white',
      position: 'relative',
      boxShadow: '4px 4px 0 #1a1a1a, 8px 8px 0 rgba(0,0,0,0.15)',
      flexShrink: 0,
      fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Outer border */}
      <div style={{ position: 'absolute', inset: 10, border: '3px solid #1a1a1a', pointerEvents: 'none', zIndex: 50 }} />

      {/* Panels */}
      {slots.map((slot, i) => {
        const panel = page.panels[i]
        if (!panel) return null
        return (
          <div
            key={panel.id}
            style={{
              position: 'absolute',
              left: slot.x,
              top: slot.y,
              width: slot.w,
              height: slot.h,
            }}
          >
            <ComicPanel panel={panel} width={slot.w} height={slot.h} />
          </div>
        )
      })}

      {/* Page number */}
      {showPageNumber && (
        <div style={{
          position: 'absolute',
          bottom: 14, [page.number % 2 === 0 ? 'left' : 'right']: 20,
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 14, fontWeight: 700,
          color: '#1a1a1a',
          zIndex: 60,
          letterSpacing: '0.05em',
        }}>
          {page.number}
        </div>
      )}
    </div>
  )
}

interface Slot { x: number; y: number; w: number; h: number }

function getLayoutSlots(layout: LayoutType, panelCount: number, pw: number, ph: number): Slot[] {
  const pad = 10   // inset from page edge (where the border is)
  const inner_x = pad
  const inner_y = pad
  const inner_w = pw - pad * 2
  const inner_h = ph - pad * 2

  // Actual usable area
  const x0 = inner_x, y0 = inner_y, W = inner_w, H = inner_h

  // If fewer panels than layout expects, collapse to simpler layout
  const actual = Math.min(panelCount, slotsForLayout(layout))

  if (actual === 1) {
    return [{ x: x0, y: y0, w: W, h: H }]
  }

  if (actual === 2) {
    if (layout === 'wide-narrow') {
      const wW = Math.round(W * 0.6) - GAP / 2
      const nW = W - wW - GAP
      return [
        { x: x0, y: y0, w: wW, h: H },
        { x: x0 + wW + GAP, y: y0, w: nW, h: H },
      ]
    }
    if (layout === 'narrow-wide') {
      const nW = Math.round(W * 0.4) - GAP / 2
      const wW = W - nW - GAP
      return [
        { x: x0, y: y0, w: nW, h: H },
        { x: x0 + nW + GAP, y: y0, w: wW, h: H },
      ]
    }
    // two-equal or default
    const hw = Math.round((W - GAP) / 2)
    return [
      { x: x0, y: y0, w: hw, h: H },
      { x: x0 + hw + GAP, y: y0, w: W - hw - GAP, h: H },
    ]
  }

  if (actual === 3) {
    if (layout === 'big-top-two') {
      const topH = Math.round(H * 0.52)
      const botH = H - topH - GAP
      const hw = Math.round((W - GAP) / 2)
      return [
        { x: x0, y: y0, w: W, h: topH },
        { x: x0, y: y0 + topH + GAP, w: hw, h: botH },
        { x: x0 + hw + GAP, y: y0 + topH + GAP, w: W - hw - GAP, h: botH },
      ]
    }
    if (layout === 'two-big-bottom') {
      const topH = Math.round(H * 0.45)
      const botH = H - topH - GAP
      const hw = Math.round((W - GAP) / 2)
      return [
        { x: x0, y: y0, w: hw, h: topH },
        { x: x0 + hw + GAP, y: y0, w: W - hw - GAP, h: topH },
        { x: x0, y: y0 + topH + GAP, w: W, h: botH },
      ]
    }
    if (layout === 'three') {
      const tw = Math.round((W - GAP * 2) / 3)
      return [
        { x: x0, y: y0, w: tw, h: H },
        { x: x0 + tw + GAP, y: y0, w: tw, h: H },
        { x: x0 + (tw + GAP) * 2, y: y0, w: W - (tw + GAP) * 2, h: H },
      ]
    }
    // tall-left-two-right
    const lW = Math.round(W * 0.55)
    const rW = W - lW - GAP
    const rH = Math.round((H - GAP) / 2)
    return [
      { x: x0, y: y0, w: lW, h: H },
      { x: x0 + lW + GAP, y: y0, w: rW, h: rH },
      { x: x0 + lW + GAP, y: y0 + rH + GAP, w: rW, h: H - rH - GAP },
    ]
  }

  // Fallback: 2x2 grid
  const hw = Math.round((W - GAP) / 2)
  const hh = Math.round((H - GAP) / 2)
  return [
    { x: x0, y: y0, w: hw, h: hh },
    { x: x0 + hw + GAP, y: y0, w: W - hw - GAP, h: hh },
    { x: x0, y: y0 + hh + GAP, w: hw, h: H - hh - GAP },
    { x: x0 + hw + GAP, y: y0 + hh + GAP, w: W - hw - GAP, h: H - hh - GAP },
  ]
}

function slotsForLayout(layout: LayoutType): number {
  const map: Record<LayoutType, number> = {
    single: 1,
    'two-equal': 2,
    'wide-narrow': 2,
    'narrow-wide': 2,
    three: 3,
    'big-top-two': 3,
    'two-big-bottom': 3,
    'tall-left-two-right': 3,
  }
  return map[layout] ?? 2
}
