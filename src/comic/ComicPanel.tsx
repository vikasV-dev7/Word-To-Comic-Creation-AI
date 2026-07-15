import type { PanelScript } from './generator'
import { getPanelPalette } from './generator'
import CharacterSVG, { emotionToExpression } from './CharacterSVG'


interface Props {
  panel: PanelScript
  width: number
  height: number
}

export default function ComicPanel({ panel, width, height }: Props) {
  const palette = getPanelPalette(panel.situation)
  const hasDialogue = !!panel.dialogue?.text
  const speakerName = panel.speaker?.name || ''

  // Character layout
  const chars = panel.characters.slice(0, 3)
  const leftChar = panel.focusLeft
  const rightChar = panel.focusRight

  // Scale characters based on panel size
  const charScale = Math.min(width, height) < 180 ? 0.55 : Math.min(width, height) < 260 ? 0.7 : 0.9
  const charH = 160 * charScale
  const groundY = height - 8 // characters stand above border

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', border: '3px solid #1a1a1a', boxSizing: 'border-box', background: palette.bg, flexShrink: 0 }}>

      {/* ─── Background scene ─── */}
      {panel.imageUrl ? (
        <img
          src={panel.imageUrl}
          alt={panel.situation.description || 'Comic panel'}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
          }}
        />
      ) : (
        <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
          <defs>
            <clipPath id={`clip-${panel.id}`}>
              <rect x={0} y={0} width={width} height={height} />
            </clipPath>
          </defs>

          {/* Sky gradient */}
          <defs>
            <linearGradient id={`sky-${panel.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.sky} />
              <stop offset="100%" stopColor={palette.bg} />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={width} height={height * 0.65} fill={`url(#sky-${panel.id})`} />

          {/* Ground */}
          <ellipse cx={width / 2} cy={height} rx={width * 0.7} ry={height * 0.18} fill={palette.ground} opacity={0.6} />
          <rect x={0} y={height * 0.82} width={width} height={height * 0.18} fill={palette.ground} opacity={0.4} />

          {/* Decorative elements */}
          <SceneDecorations panel={panel} width={width} height={height} palette={palette} />
        </svg>
      )}

      {/* ─── Characters SVG layer ─── */}
      {!panel.imageUrl && (
        <svg
          width={width}
          height={height}
          style={{ position: 'absolute', inset: 0 }}
          viewBox={`0 0 ${width} ${height}`}
          aria-label={`Scene: ${panel.situation.location || 'panel'}`}
        >
          {/* Left character */}
          {leftChar && (
            <CharacterSVG
              character={leftChar}
              expression={panel.speaker?.id === leftChar.id
                ? emotionToExpression(panel.dialogue?.emotion || panel.emotion)
                : emotionToExpression(panel.emotion)}
              pose={panel.type === 'scene-intro' ? 'standing' : panel.speaker?.id === leftChar.id ? 'talking' : 'standing'}
              facing="right"
              scale={charScale}
              x={Math.max(4, width * 0.05)}
              y={groundY - charH}
            />
          )}
          {/* Right character */}
          {rightChar && rightChar.id !== leftChar?.id && (
            <CharacterSVG
              character={rightChar}
              expression={panel.speaker?.id === rightChar.id
                ? emotionToExpression(panel.dialogue?.emotion || panel.emotion)
                : emotionToExpression(panel.emotion)}
              pose={panel.type === 'scene-intro' ? 'standing' : panel.speaker?.id === rightChar.id ? 'talking' : 'standing'}
              facing="left"
              scale={charScale}
              x={width - 80 * charScale - Math.max(4, width * 0.05)}
              y={groundY - charH}
            />
          )}
          {/* Third character, centered */}
          {chars[2] && chars[2].id !== leftChar?.id && chars[2].id !== rightChar?.id && (
            <CharacterSVG
              character={chars[2]}
              expression={emotionToExpression(panel.emotion)}
              facing="right"
              scale={charScale * 0.85}
              x={width / 2 - 40 * charScale}
              y={groundY - charH * 0.85}
            />
          )}
        </svg>
      )}

      {/* ─── Narration caption (top bar) ─── */}
      {panel.narratorText && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          background: 'rgba(255,255,240,0.96)',
          borderBottom: '2.5px solid #1a1a1a',
          padding: '5px 10px',
          fontFamily: "'Nunito', sans-serif",
          fontSize: Math.min(12, width / 18),
          fontWeight: 700,
          color: '#1a1a1a',
          letterSpacing: '0.02em',
          lineHeight: 1.3,
          zIndex: 20,
        }}>
          {panel.narratorText}
        </div>
      )}

      {/* ─── Speech bubble ─── */}
      {hasDialogue && panel.speaker && panel.dialogue && (
        <SpeechBubble
          text={panel.dialogue.text}
          speakerName={speakerName}
          panelWidth={width}
          panelHeight={height}
          speakerIsLeft={panel.focusLeft?.id === panel.speaker.id}
          narratorOffset={panel.narratorText ? 28 : 0}
        />
      )}

      {/* ─── Scene intro label ─── */}
      {panel.type === 'scene-intro' && !hasDialogue && panel.situation.description && (
        <div style={{
          position: 'absolute', bottom: 6, left: 8, right: 8,
          background: 'rgba(0,0,0,0.7)',
          borderRadius: 6,
          padding: '4px 8px',
          fontFamily: "'Nunito', sans-serif",
          fontSize: Math.min(11, width / 20),
          color: 'rgba(255,255,255,0.92)',
          lineHeight: 1.35,
          zIndex: 20,
          maxHeight: height * 0.25,
          overflow: 'hidden',
        }}>
          {panel.situation.description.slice(0, 120)}{panel.situation.description.length > 120 ? '…' : ''}
        </div>
      )}
    </div>
  )
}

/* ─── Speech bubble ─── */
function SpeechBubble({ text, speakerName, panelWidth, panelHeight, speakerIsLeft, narratorOffset }: {
  text: string; speakerName: string
  panelWidth: number; panelHeight: number
  speakerIsLeft: boolean; narratorOffset: number
}) {
  const fontSize = Math.min(12, panelWidth / 15)
  const maxW = Math.min(panelWidth * 0.65, 240)
  const maxLineChars = Math.floor(maxW / (fontSize * 0.55))
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  words.forEach(w => {
    if ((cur + ' ' + w).trim().length > maxLineChars) { lines.push(cur.trim()); cur = w }
    else cur = (cur + ' ' + w).trim()
  })
  if (cur) lines.push(cur)
  const lineH = fontSize * 1.4
  const bH = Math.max(40, lines.length * lineH + 20)
  const bW = Math.min(maxW, Math.max(80, lines.reduce((a, l) => Math.max(a, l.length * fontSize * 0.55), 0) + 24))

  // Bubble position: opposite side from speaker, upper area
  const bX = speakerIsLeft ? panelWidth - bW - 8 : 8
  const bY = narratorOffset + 10

  // Tail anchor (points down toward speaker)
  const tailTip: [number, number] = speakerIsLeft
    ? [bX + bW * 0.25, bY + bH + 14]
    : [bX + bW * 0.75, bY + bH + 14]

  const tailBase = speakerIsLeft
    ? [[bX + 18, bY + bH - 2], [bX + 34, bY + bH - 2]] as [number, number][]
    : [[bX + bW - 34, bY + bH - 2], [bX + bW - 18, bY + bH - 2]] as [number, number][]

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      <svg width={panelWidth} height={panelHeight} style={{ position: 'absolute', inset: 0 }}>
        {/* Bubble body */}
        <rect
          x={bX} y={bY} width={bW} height={bH}
          rx={10} ry={10}
          fill="white" stroke="#1a1a1a" strokeWidth="2"
        />
        {/* Tail */}
        <polygon
          points={`${tailBase[0][0]},${tailBase[0][1]} ${tailTip[0]},${tailTip[1]} ${tailBase[1][0]},${tailBase[1][1]}`}
          fill="white" stroke="#1a1a1a" strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Cover tail base seam */}
        <line
          x1={tailBase[0][0]} y1={tailBase[0][1] + 1}
          x2={tailBase[1][0]} y2={tailBase[1][1] + 1}
          stroke="white" strokeWidth="3"
        />
      </svg>
      {/* Speaker name */}
      {speakerName && (
        <div style={{
          position: 'absolute', left: bX + 8, top: bY + 5,
          fontFamily: "'Fredoka', sans-serif",
          fontSize: fontSize - 1, fontWeight: 700,
          color: '#555', letterSpacing: '0.04em',
        }}>
          {speakerName}:
        </div>
      )}
      {/* Text lines */}
      <div style={{
        position: 'absolute',
        left: bX + 8,
        top: bY + (speakerName ? fontSize + 6 : 8),
        width: bW - 16,
        fontFamily: "'Nunito', sans-serif",
        fontSize,
        fontWeight: 600,
        color: '#1a1a1a',
        lineHeight: 1.35,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {lines.join('\n')}
      </div>
    </div>
  )
}

/* ─── Scene decorations ─── */
function SceneDecorations({ panel, width, height, palette }: {
  panel: PanelScript; width: number; height: number
  palette: ReturnType<typeof getPanelPalette>
}) {
  const loc = (panel.situation.location || '').toLowerCase()
  const weather = (panel.situation.weather || '').toLowerCase()
  const time = (panel.situation.time || '').toLowerCase()

  return (
    <>
      {/* Sun or Moon */}
      {(time.includes('morning') || time.includes('afternoon') || !time || time.includes('sunny') || weather.includes('sunny')) && (
        <circle cx={width * 0.85} cy={height * 0.12} r={height * 0.07} fill="#FFD54F" opacity={0.9} />
      )}
      {(time.includes('night') || time.includes('evening')) && (
        <>
          <circle cx={width * 0.8} cy={height * 0.12} r={height * 0.065} fill="#FFF9C4" opacity={0.9} />
          <circle cx={width * 0.82} cy={height * 0.10} r={height * 0.05} fill={palette.sky} />
          {/* Stars */}
          {[[0.2, 0.08], [0.4, 0.05], [0.6, 0.09], [0.15, 0.14], [0.5, 0.13]].map(([sx, sy], i) => (
            <circle key={i} cx={width * sx} cy={height * sy} r={1.2} fill="white" opacity={0.8} />
          ))}
        </>
      )}

      {/* Rain drops */}
      {weather.includes('rain') && (
        <>
          {[[0.15, 0.2], [0.35, 0.15], [0.55, 0.25], [0.75, 0.18], [0.9, 0.22], [0.25, 0.32], [0.65, 0.3]].map(([rx, ry], i) => (
            <line key={i} x1={width * rx} y1={height * ry} x2={width * rx - 3} y2={height * (ry + 0.06)} stroke="#90CAF9" strokeWidth="1.5" opacity={0.7} />
          ))}
        </>
      )}

      {/* Clouds */}
      {(weather.includes('cloud') || weather.includes('rain')) && (
        <>
          <CloudShape cx={width * 0.2} cy={height * 0.12} size={width * 0.12} />
          <CloudShape cx={width * 0.55} cy={height * 0.08} size={width * 0.15} />
        </>
      )}

      {/* Trees for outdoor/park */}
      {(loc.includes('park') || loc.includes('forest') || loc.includes('outside') || loc.includes('garden')) && (
        <>
          <Tree x={width * 0.05} y={height * 0.6} size={height * 0.25} />
          <Tree x={width * 0.85} y={height * 0.6} size={height * 0.22} />
        </>
      )}

      {/* School building detail */}
      {loc.includes('school') && (
        <Building x={width * 0.7} y={height * 0.35} w={width * 0.25} h={height * 0.3} />
      )}

      {/* Snowflakes */}
      {weather.includes('snow') && (
        <>
          {[[0.1, 0.15], [0.3, 0.1], [0.6, 0.18], [0.8, 0.12], [0.5, 0.25]].map(([sx, sy], i) => (
            <text key={i} x={width * sx} y={height * sy} fontSize="12" fill="white" opacity={0.7}>❄</text>
          ))}
        </>
      )}
    </>
  )
}

function CloudShape({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  return (
    <g opacity={0.85}>
      <circle cx={cx} cy={cy} r={size * 0.45} fill="white" />
      <circle cx={cx + size * 0.4} cy={cy + size * 0.1} r={size * 0.35} fill="white" />
      <circle cx={cx - size * 0.35} cy={cy + size * 0.12} r={size * 0.3} fill="white" />
      <rect x={cx - size * 0.65} y={cy + size * 0.1} width={size * 1.3} height={size * 0.35} fill="white" rx={size * 0.15} />
    </g>
  )
}

function Tree({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g>
      <rect x={x - size * 0.08} y={y + size * 0.55} width={size * 0.16} height={size * 0.45} fill="#6D4C41" />
      <polygon points={`${x},${y} ${x - size * 0.4},${y + size * 0.6} ${x + size * 0.4},${y + size * 0.6}`} fill="#388E3C" opacity={0.9} />
      <polygon points={`${x},${y + size * 0.2} ${x - size * 0.35},${y + size * 0.75} ${x + size * 0.35},${y + size * 0.75}`} fill="#43A047" opacity={0.95} />
    </g>
  )
}

function Building({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g opacity={0.55}>
      <rect x={x} y={y} width={w} height={h} fill="#90A4AE" rx={2} />
      <rect x={x} y={y} width={w} height={h * 0.12} fill="#607D8B" rx={2} />
      {/* Windows */}
      {[0.2, 0.5, 0.78].map((wx, i) => (
        <rect key={i} x={x + w * wx - w * 0.08} y={y + h * 0.25} width={w * 0.16} height={h * 0.18} fill="#FFE082" rx={2} />
      ))}
    </g>
  )
}
