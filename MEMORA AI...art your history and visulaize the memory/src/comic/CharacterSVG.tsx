import type { Character } from '../types'
import { getCharColor } from './generator'

export type Expression = 'happy' | 'sad' | 'surprised' | 'angry' | 'thinking' | 'neutral' | 'laughing' | 'crying' | 'blushing' | 'scared'
export type Pose = 'standing' | 'talking' | 'surprised' | 'sad' | 'sitting'
export type Facing = 'left' | 'right'

interface Props {
  character: Character
  expression?: Expression
  pose?: Pose
  facing?: Facing
  scale?: number
  x?: number
  y?: number
}

// Map emotion strings to Expression
export function emotionToExpression(emotion: string): Expression {
  const map: Record<string, Expression> = {
    happy: 'happy', happy2: 'happy',
    sad: 'sad', nostalgic: 'sad',
    funny: 'laughing', laughing: 'laughing',
    surprised: 'surprised', excited: 'surprised',
    angry: 'angry',
    thinking: 'thinking', mysterious: 'thinking',
    romantic: 'blushing', blushing: 'blushing',
    scared: 'scared', horror: 'scared',
    crying: 'crying',
    neutral: 'neutral', peaceful: 'neutral',
  }
  return map[emotion?.toLowerCase()] ?? 'happy'
}

export default function CharacterSVG({ character, expression = 'happy', pose = 'standing', facing = 'right', scale = 1, x = 0, y = 0 }: Props) {
  const { skin, hair, clothing } = getCharColor(character)
  const isFemale = character.gender?.toLowerCase().startsWith('f') ?? false
  const flip = facing === 'left' ? -1 : 1

  // Base character size 80×160
  const W = 80, H = 160

  return (
    <g transform={`translate(${x},${y}) scale(${flip * scale}, ${scale}) translate(${flip < 0 ? -W : 0}, 0)`}>
      {isFemale
        ? <FemaleBody skin={skin} hair={hair} clothing={clothing} expression={expression} pose={pose} />
        : <MaleBody skin={skin} hair={hair} clothing={clothing} expression={expression} pose={pose} />
      }
    </g>
  )
}

/* ─── Female body ─── */
function FemaleBody({ skin, hair, clothing, expression, pose }: { skin: string; hair: string; clothing: string; expression: Expression; pose: Pose }) {
  const armAngle = pose === 'talking' ? -15 : pose === 'surprised' ? -40 : 0
  const legSpread = pose === 'sad' ? 4 : 0

  return (
    <g>
      {/* Hair back */}
      <ellipse cx="40" cy="28" rx="24" ry="28" fill={hair} />
      {/* Long hair sides */}
      <rect x="16" y="40" width="10" height="40" rx="5" fill={hair} />
      <rect x="54" y="40" width="10" height="40" rx="5" fill={hair} />

      {/* Neck */}
      <rect x="34" y="54" width="12" height="12" rx="3" fill={skin} />

      {/* Body / dress */}
      <path d="M20,64 Q40,58 60,64 L68,110 Q40,118 12,110 Z" fill={clothing} stroke={darken(clothing)} strokeWidth="1.5" />
      {/* Dress skirt flare */}
      <ellipse cx="40" cy="110" rx="30" ry="8" fill={lighten(clothing)} stroke={darken(clothing)} strokeWidth="1.5" />
      {/* Belt / waist detail */}
      <rect x="22" y="80" width="36" height="6" rx="3" fill={darken(clothing)} opacity="0.4" />

      {/* Arms */}
      <ArmFemale side="left" skin={skin} angle={armAngle} />
      <ArmFemale side="right" skin={skin} angle={-armAngle} />

      {/* Head */}
      <ellipse cx="40" cy="34" rx="20" ry="22" fill={skin} stroke={darken(skin)} strokeWidth="1.5" />
      {/* Hair top / bangs */}
      <path d="M20,28 Q30,12 40,14 Q50,12 60,28 Q52,24 40,24 Q28,24 20,28 Z" fill={hair} />

      {/* Face */}
      <Face expression={expression} skin={skin} cx={40} cy={34} isFemale />

      {/* Legs */}
      <rect x={26 - legSpread} y="114" width="12" height="30" rx="6" fill={skin} stroke={darken(skin)} strokeWidth="1" />
      <rect x={42 + legSpread} y="114" width="12" height="30" rx="6" fill={skin} stroke={darken(skin)} strokeWidth="1" />
      {/* Shoes */}
      <ellipse cx={32 - legSpread} cy="144" rx="9" ry="5" fill={darken(clothing)} />
      <ellipse cx={48 + legSpread} cy="144" rx="9" ry="5" fill={darken(clothing)} />
    </g>
  )
}

function ArmFemale({ side, skin, angle }: { side: 'left' | 'right'; skin: string; angle: number }) {
  const x = side === 'left' ? 18 : 62
  const dir = side === 'left' ? 1 : -1
  const ax = x + Math.sin((angle * Math.PI) / 180) * 18 * dir
  const ay = 80 + Math.cos((angle * Math.PI) / 180) * 18
  return (
    <line x1={x} y1="66" x2={ax} y2={ay} stroke={skin} strokeWidth="9" strokeLinecap="round" />
  )
}

/* ─── Male body ─── */
function MaleBody({ skin, hair, clothing, expression, pose }: { skin: string; hair: string; clothing: string; expression: Expression; pose: Pose }) {
  const armAngle = pose === 'talking' ? -20 : pose === 'surprised' ? -50 : 5
  const legSpread = pose === 'sad' ? 3 : 0

  const shirtColor = clothing
  const pantsColor = darken(clothing)

  return (
    <g>
      {/* Neck */}
      <rect x="34" y="52" width="12" height="12" rx="3" fill={skin} />

      {/* Shirt (torso) */}
      <path d="M18,62 Q40,56 62,62 L66,95 Q40,98 14,95 Z" fill={shirtColor} stroke={darken(shirtColor)} strokeWidth="1.5" />
      {/* Collar */}
      <path d="M30,62 L40,68 L50,62" fill="none" stroke={darken(shirtColor)} strokeWidth="2" />
      {/* Pants */}
      <rect x="16" y="93" width="48" height="26" rx="4" fill={pantsColor} stroke={darken(pantsColor)} strokeWidth="1.5" />
      {/* Belt */}
      <rect x="16" y="93" width="48" height="7" rx="3" fill={darken(pantsColor)} />
      <rect x="35" y="93" width="10" height="7" rx="2" fill="#d4a017" />

      {/* Arms */}
      <ArmMale side="left" skin={skin} shirt={shirtColor} angle={armAngle} />
      <ArmMale side="right" skin={skin} shirt={shirtColor} angle={-armAngle} />

      {/* Head */}
      <ellipse cx="40" cy="34" rx="19" ry="21" fill={skin} stroke={darken(skin)} strokeWidth="1.5" />
      {/* Hair */}
      <path d="M21,26 Q30,10 40,12 Q50,10 59,26 Q50,18 40,19 Q30,18 21,26 Z" fill={hair} />

      {/* Face */}
      <Face expression={expression} skin={skin} cx={40} cy={34} isFemale={false} />

      {/* Legs / pants */}
      <rect x={16 - legSpread} y="117" width="20" height="26" rx="6" fill={pantsColor} stroke={darken(pantsColor)} strokeWidth="1" />
      <rect x={44 + legSpread} y="117" width="20" height="26" rx="6" fill={pantsColor} stroke={darken(pantsColor)} strokeWidth="1" />
      {/* Shoes */}
      <ellipse cx={26 - legSpread} cy="143" rx="12" ry="5" fill="#333" />
      <ellipse cx={54 + legSpread} cy="143" rx="12" ry="5" fill="#333" />
    </g>
  )
}

function ArmMale({ side, skin, shirt, angle }: { side: 'left' | 'right'; skin: string; shirt: string; angle: number }) {
  const x = side === 'left' ? 16 : 64
  const dir = side === 'left' ? 1 : -1
  const midX = x + Math.sin((angle * Math.PI) / 180) * 12 * dir
  const midY = 76 + Math.cos((angle * Math.PI) / 180) * 12
  const endX = midX + Math.sin((angle * Math.PI) / 180) * 12 * dir
  const endY = midY + Math.cos((angle * Math.PI) / 180) * 12
  return (
    <>
      <line x1={x} y1="65" x2={midX} y2={midY} stroke={shirt} strokeWidth="11" strokeLinecap="round" />
      <line x1={midX} y1={midY} x2={endX} y2={endY} stroke={skin} strokeWidth="9" strokeLinecap="round" />
    </>
  )
}

/* ─── Face renderer ─── */
function Face({ expression, cx, cy, isFemale }: { expression: Expression; skin: string; cx: number; cy: number; isFemale: boolean }) {
  const eyeY = cy + 2
  const eyeOffX = 8
  const mouthY = cy + 12

  // Eye shapes per expression
  const eyeH = expression === 'surprised' || expression === 'scared' ? 6 : expression === 'happy' || expression === 'laughing' ? 3.5 : 4
  const eyeW = expression === 'surprised' || expression === 'scared' ? 5 : 4.5

  // Mouth paths
  const mouth = getMouth(expression, cx, mouthY)

  // Eyebrows
  const browY = cy - 10
  const browAngle = expression === 'angry' ? 5 : expression === 'sad' || expression === 'crying' ? -4 : 0

  return (
    <g>
      {/* Eyes whites */}
      <ellipse cx={cx - eyeOffX} cy={eyeY} rx={eyeW} ry={eyeH} fill="white" stroke="#333" strokeWidth="1.2" />
      <ellipse cx={cx + eyeOffX} cy={eyeY} rx={eyeW} ry={eyeH} fill="white" stroke="#333" strokeWidth="1.2" />

      {/* Pupils */}
      <circle cx={cx - eyeOffX + 0.8} cy={eyeY + 0.5} r={expression === 'surprised' || expression === 'scared' ? 3 : 2.2} fill="#333" />
      <circle cx={cx + eyeOffX + 0.8} cy={eyeY + 0.5} r={expression === 'surprised' || expression === 'scared' ? 3 : 2.2} fill="#333" />
      {/* Eye shine */}
      <circle cx={cx - eyeOffX + 2} cy={eyeY - 1} r={0.9} fill="white" />
      <circle cx={cx + eyeOffX + 2} cy={eyeY - 1} r={0.9} fill="white" />

      {/* Closed eyes for laughing */}
      {(expression === 'laughing') && (
        <>
          <path d={`M${cx - eyeOffX - 4},${eyeY} Q${cx - eyeOffX},${eyeY - 5} ${cx - eyeOffX + 4},${eyeY}`} fill="none" stroke="#333" strokeWidth="2" />
          <path d={`M${cx + eyeOffX - 4},${eyeY} Q${cx + eyeOffX},${eyeY - 5} ${cx + eyeOffX + 4},${eyeY}`} fill="none" stroke="#333" strokeWidth="2" />
        </>
      )}

      {/* Eyebrows */}
      <path
        d={`M${cx - eyeOffX - 5},${browY - browAngle} Q${cx - eyeOffX},${browY - 3 + browAngle} ${cx - eyeOffX + 5},${browY + browAngle}`}
        fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"
      />
      <path
        d={`M${cx + eyeOffX - 5},${browY + browAngle} Q${cx + eyeOffX},${browY - 3 - browAngle} ${cx + eyeOffX + 5},${browY - browAngle}`}
        fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"
      />

      {/* Female eyelashes */}
      {isFemale && (
        <>
          <line x1={cx - eyeOffX - 4} y1={eyeY - eyeH} x2={cx - eyeOffX - 5} y2={eyeY - eyeH - 3} stroke="#333" strokeWidth="1.2" />
          <line x1={cx - eyeOffX} y1={eyeY - eyeH} x2={cx - eyeOffX} y2={eyeY - eyeH - 3.5} stroke="#333" strokeWidth="1.2" />
          <line x1={cx + eyeOffX - 1} y1={eyeY - eyeH} x2={cx + eyeOffX - 1} y2={eyeY - eyeH - 3.5} stroke="#333" strokeWidth="1.2" />
          <line x1={cx + eyeOffX + 3} y1={eyeY - eyeH} x2={cx + eyeOffX + 4} y2={eyeY - eyeH - 3} stroke="#333" strokeWidth="1.2" />
        </>
      )}

      {/* Nose */}
      <ellipse cx={cx} cy={cy + 7} rx={2} ry={1.5} fill="rgba(0,0,0,0.12)" />

      {/* Mouth */}
      {mouth}

      {/* Blush marks */}
      {(expression === 'blushing' || expression === 'happy') && (
        <>
          <ellipse cx={cx - eyeOffX - 3} cy={cy + 8} rx={5} ry={3} fill="rgba(255,100,100,0.2)" />
          <ellipse cx={cx + eyeOffX + 3} cy={cy + 8} rx={5} ry={3} fill="rgba(255,100,100,0.2)" />
        </>
      )}

      {/* Tears for crying/sad */}
      {(expression === 'crying') && (
        <>
          <path d={`M${cx - eyeOffX + 1},${eyeY + 4} Q${cx - eyeOffX},${eyeY + 10} ${cx - eyeOffX - 1},${eyeY + 14}`} fill="none" stroke="#6eb5ff" strokeWidth="2" />
          <path d={`M${cx + eyeOffX + 1},${eyeY + 4} Q${cx + eyeOffX},${eyeY + 10} ${cx + eyeOffX - 1},${eyeY + 14}`} fill="none" stroke="#6eb5ff" strokeWidth="2" />
        </>
      )}

      {/* Sweat drop for scared */}
      {expression === 'scared' && (
        <path d={`M${cx + 17},${cy - 8} Q${cx + 20},${cy - 4} ${cx + 17},${cy} Q${cx + 14},${cy - 4} ${cx + 17},${cy - 8}`} fill="#6eb5ff" />
      )}

      {/* Thought bubble for thinking */}
      {expression === 'thinking' && (
        <>
          <circle cx={cx + 14} cy={cy - 14} r={2} fill="#fff" stroke="#333" strokeWidth="1" />
          <circle cx={cx + 18} cy={cy - 19} r={3} fill="#fff" stroke="#333" strokeWidth="1" />
        </>
      )}
    </g>
  )
}

function getMouth(expression: Expression, cx: number, my: number) {
  switch (expression) {
    case 'happy':
    case 'blushing':
      return <path d={`M${cx - 7},${my} Q${cx},${my + 6} ${cx + 7},${my}`} fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    case 'laughing':
      return <ellipse cx={cx} cy={my + 2} rx={8} ry={5} fill="#333" />
    case 'sad':
    case 'crying':
      return <path d={`M${cx - 7},${my + 4} Q${cx},${my} ${cx + 7},${my + 4}`} fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    case 'surprised':
    case 'scared':
      return <ellipse cx={cx} cy={my + 2} rx={5} ry={6} fill="#333" />
    case 'angry':
      return <path d={`M${cx - 6},${my + 3} Q${cx},${my} ${cx + 6},${my + 3}`} fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
    case 'thinking':
      return <path d={`M${cx - 4},${my + 1} Q${cx},${my + 3} ${cx + 5},${my}`} fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    default:
      return <line x1={cx - 5} y1={my + 2} x2={cx + 5} y2={my + 2} stroke="#333" strokeWidth="2" strokeLinecap="round" />
  }
}

/* ─── Color utilities ─── */
function darken(hex: string, amt = 40): string {
  try {
    const n = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, (n >> 16) - amt)
    const g = Math.max(0, ((n >> 8) & 0xff) - amt)
    const b = Math.max(0, (n & 0xff) - amt)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  } catch { return hex }
}

function lighten(hex: string, amt = 40): string {
  try {
    const n = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, (n >> 16) + amt)
    const g = Math.min(255, ((n >> 8) & 0xff) + amt)
    const b = Math.min(255, (n & 0xff) + amt)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  } catch { return hex }
}
