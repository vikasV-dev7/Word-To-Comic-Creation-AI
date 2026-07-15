import type { ComicProject, Character, Situation, Dialogue } from '../types'

/* ─── Comic script data types ─── */

export type LayoutType =
  | 'single'
  | 'two-equal'
  | 'wide-narrow'
  | 'narrow-wide'
  | 'three'
  | 'big-top-two'
  | 'two-big-bottom'
  | 'tall-left-two-right'

export type PanelRole = 'full' | 'half' | 'wide' | 'narrow' | 'third'

export interface PanelScript {
  id: string
  type: 'scene-intro' | 'dialogue' | 'reaction' | 'narration-only'
  situation: Situation
  situationIndex: number
  characters: Character[]          // all chars visible in panel
  focusLeft?: Character            // left-positioned character
  focusRight?: Character           // right-positioned character
  speaker?: Character              // who has the speech bubble
  dialogue?: Dialogue
  narratorText?: string            // caption bar text
  emotion: string
  role: PanelRole
  isFirstInSituation: boolean
  isLastInSituation: boolean
  imageUrl?: string
}

export interface PageScript {
  number: number
  layout: LayoutType
  panels: PanelScript[]
}

export interface ComicScript {
  projectId: string
  title: string
  tikTikLabel: string
  language: string
  pages: PageScript[]
}

/* ─── Layout definitions ─── */

// How many panel slots each layout has and their roles
const LAYOUTS: Record<LayoutType, PanelRole[]> = {
  'single':              ['full'],
  'two-equal':           ['half', 'half'],
  'wide-narrow':         ['wide', 'narrow'],
  'narrow-wide':         ['narrow', 'wide'],
  'three':               ['third', 'third', 'third'],
  'big-top-two':         ['full', 'half', 'half'],
  'two-big-bottom':      ['half', 'half', 'full'],
  'tall-left-two-right': ['half', 'half', 'half'],
}

const LAYOUT_SEQUENCE: LayoutType[] = [
  'big-top-two',
  'two-equal',
  'wide-narrow',
  'two-big-bottom',
  'narrow-wide',
  'three',
  'tall-left-two-right',
  'big-top-two',
]

/* ─── Main generator ─── */

export function generateComic(project: ComicProject): ComicScript {
  const panels = buildPanels(project)
  const pages = distributeToPages(panels, project.pages)

  const tikTikParts = [
    project.tikTik.date && fmtDate(project.tikTik.date),
    project.tikTik.time,
    project.tikTik.year,
  ].filter(Boolean)

  return {
    projectId: project.id,
    title: project.title || 'Untitled Story',
    tikTikLabel: tikTikParts.join('  ·  '),
    language: project.language,
    pages,
  }
}

function buildPanelImageUrl(panel: Omit<PanelScript, 'imageUrl'>, characters: Character[]): string {
  const situation = panel.situation
  const location = situation.location || 'classroom'
  const weather = situation.weather || 'clear'
  const time = situation.time || 'day'
  const emotion = panel.emotion || 'Happy'

  const charDetails = panel.characters.map(c => {
    let desc = `${c.name} (${c.age ? c.age + ' years old ' : ''}${c.gender || 'person'}`
    if (c.height) desc += `, ${c.height} tall`
    if (c.dress) desc += `, wearing ${c.dressColor || ''} ${c.dress}`
    if (c.description) desc += `, ${c.description}`
    desc += `)`
    return desc
  }).join(', ')

  const dialoguesStr = panel.dialogue ? `Dialogue: ${panel.speaker?.name || 'speaker'} says "${panel.dialogue.text}"` : ''
  const styleTags = "High-quality anime illustration, beautiful detailed digital manga art, cinematic lighting, expressive features, masterpiece, webtoon style, clean lineart, soft shading."

  let prompt = `${styleTags} Place: ${location}. Weather: ${weather}. Time: ${time}. `
  if (charDetails) {
    prompt += `Featuring: ${charDetails}. `
  }
  prompt += `Action: ${situation.description}. `
  if (dialoguesStr) {
    prompt += `Scene mood: ${emotion}. ${dialoguesStr}.`
  } else {
    prompt += `Scene mood: ${emotion}.`
  }

  prompt = prompt.replace(/\s+/g, ' ').trim()
  if (prompt.length > 800) {
    prompt = prompt.substring(0, 800)
  }

  let seed = 0
  const idStr = panel.id || ''
  for (let i = 0; i < idStr.length; i++) {
    seed = ((seed << 5) - seed + idStr.charCodeAt(i)) | 0
  }
  seed = Math.abs(seed) % 1000000

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=1000&seed=${seed}&nologo=true&private=true`
}

function buildPanels(project: ComicProject): PanelScript[] {
  const panels: PanelScript[] = []

  project.situations.forEach((sit, sitIdx) => {
    const sitChars = resolveSituationChars(sit, project.characters)

    // Scene intro panel (always first in each situation)
    const introNarration = buildIntroCaption(sit, project.tikTik, sitIdx)
    const introPanel: PanelScript = {
      id: `panel-${sit.id}-intro`,
      type: 'scene-intro',
      situation: sit,
      situationIndex: sitIdx,
      characters: sitChars,
      focusLeft: sitChars[0],
      focusRight: sitChars[1],
      narratorText: introNarration,
      emotion: sit.emotion || 'Happy',
      role: 'full',
      isFirstInSituation: true,
      isLastInSituation: sit.dialogues.length === 0,
    }
    introPanel.imageUrl = buildPanelImageUrl(introPanel, project.characters)
    panels.push(introPanel)

    // One panel per dialogue
    sit.dialogues.forEach((dial, dialIdx) => {
      const speaker = project.characters.find(c => c.id === dial.characterId)
      const others = sitChars.filter(c => c.id !== speaker?.id)
      const [left, right] = assignPositions(speaker, others)

      const dialPanel: PanelScript = {
        id: `panel-${sit.id}-dial-${dial.id}`,
        type: 'dialogue',
        situation: sit,
        situationIndex: sitIdx,
        characters: sitChars,
        focusLeft: left,
        focusRight: right,
        speaker,
        dialogue: dial,
        emotion: dial.emotion || sit.emotion || 'Happy',
        role: 'half',
        isFirstInSituation: false,
        isLastInSituation: dialIdx === sit.dialogues.length - 1,
      }
      dialPanel.imageUrl = buildPanelImageUrl(dialPanel, project.characters)
      panels.push(dialPanel)
    })
  })

  return panels
}

function distributeToPages(panels: PanelScript[], targetPages: number): PageScript[] {
  // Spread panels across pages, fitting to layout slot counts
  const pages: PageScript[] = []
  let panelIdx = 0
  let layoutIdx = 0

  while (panelIdx < panels.length) {
    const layout = LAYOUT_SEQUENCE[layoutIdx % LAYOUT_SEQUENCE.length]
    const slots = LAYOUTS[layout]
    const pagePanels: PanelScript[] = []

    slots.forEach((role, slotIdx) => {
      if (panelIdx >= panels.length) return
      const panel = { ...panels[panelIdx], role }

      // Force scene-intro panels to full/wide role when possible
      if (panel.isFirstInSituation && slotIdx === 0) {
        panel.role = 'full'
      }

      pagePanels.push(panel)
      panelIdx++
    })

    if (pagePanels.length > 0) {
      // Choose actual layout based on how many panels fit
      const actualLayout = chooseLayout(pagePanels, layout)
      pages.push({ number: pages.length + 1, layout: actualLayout, panels: pagePanels })
    }
    layoutIdx++
  }

  return pages
}

function chooseLayout(panels: PanelScript[], suggested: LayoutType): LayoutType {
  if (panels.length === 1) return 'single'
  if (panels.length === 2) {
    // If first panel is scene-intro, make it wide
    if (panels[0].isFirstInSituation) return 'wide-narrow'
    return 'two-equal'
  }
  if (panels.length === 3) {
    if (panels[0].isFirstInSituation) return 'big-top-two'
    return 'two-big-bottom'
  }
  return suggested
}

/* ─── Helpers ─── */

function resolveSituationChars(sit: Situation, allChars: Character[]): Character[] {
  const charIds = new Set(sit.dialogues.map(d => d.characterId))
  const mentioned = allChars.filter(c => charIds.has(c.id))
  // Always include at least 1-2 characters
  if (mentioned.length === 0) return allChars.slice(0, 2)
  if (mentioned.length === 1 && allChars.length > 1) {
    const other = allChars.find(c => c.id !== mentioned[0].id)
    return other ? [mentioned[0], other] : mentioned
  }
  return mentioned.slice(0, 3) // max 3 in a panel
}

function assignPositions(speaker: Character | undefined, others: Character[]): [Character | undefined, Character | undefined] {
  if (!speaker) return [others[0], others[1]]
  // Speaker on the side their text bubble should come from
  // Alternate: if index is even, speaker goes right (bubble on right)
  return [others[0] ?? undefined, speaker]
}

function buildIntroCaption(sit: Situation, tikTik: { date: string; time: string; year: string }, idx: number): string {
  const parts: string[] = []
  if (sit.location) parts.push(`📍 ${sit.location}`)
  if (sit.time) parts.push(sit.time)
  if (sit.weather) parts.push(sit.weather)
  if (idx === 0 && tikTik.year) parts.push(tikTik.year)
  return parts.join('  |  ')
}

function fmtDate(d: string): string {
  try {
    return new Date(d + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch { return d }
}

/* ─── Background palette lookup ─── */

export function getPanelPalette(sit: Situation): { bg: string; sky: string; ground: string; accent: string } {
  const loc = (sit.location || '').toLowerCase()
  const weather = (sit.weather || '').toLowerCase()
  const time = (sit.time || '').toLowerCase()

  // Time-based sky
  let sky = '#87CEEB'
  if (time.includes('night') || time.includes('midnight')) sky = '#0d1b3e'
  else if (time.includes('evening') || time.includes('dusk') || time.includes('sunset')) sky = '#ff7043'
  else if (time.includes('dawn') || time.includes('morning')) sky = '#ffb74d'
  else if (weather.includes('rain') || weather.includes('storm')) sky = '#546e7a'
  else if (weather.includes('cloud')) sky = '#b0bec5'
  else if (weather.includes('snow')) sky = '#e3f2fd'

  // Location-based bg
  if (loc.includes('school') || loc.includes('class')) return { bg: '#fff8e1', sky, ground: '#c8e6c9', accent: '#ffca28' }
  if (loc.includes('beach') || loc.includes('ocean') || loc.includes('sea')) return { bg: '#e0f7fa', sky: '#29b6f6', ground: '#ffe082', accent: '#00bcd4' }
  if (loc.includes('park') || loc.includes('garden') || loc.includes('forest') || loc.includes('outside') || loc.includes('outdoor')) return { bg: '#e8f5e9', sky, ground: '#a5d6a7', accent: '#66bb6a' }
  if (loc.includes('home') || loc.includes('house') || loc.includes('room') || loc.includes('bedroom') || loc.includes('kitchen')) return { bg: '#fff3e0', sky: '#ffcc80', ground: '#8d6e63', accent: '#ff8a65' }
  if (loc.includes('office') || loc.includes('work') || loc.includes('meeting')) return { bg: '#e8eaf6', sky: '#9fa8da', ground: '#78909c', accent: '#5c6bc0' }
  if (loc.includes('restaurant') || loc.includes('cafe') || loc.includes('coffee')) return { bg: '#fbe9e7', sky: '#ffcc80', ground: '#bcaaa4', accent: '#ff7043' }
  if (loc.includes('hospital') || loc.includes('clinic') || loc.includes('doctor')) return { bg: '#e1f5fe', sky: '#b3e5fc', ground: '#b2dfdb', accent: '#4fc3f7' }
  if (loc.includes('market') || loc.includes('shop') || loc.includes('store') || loc.includes('mall')) return { bg: '#fce4ec', sky: '#f8bbd9', ground: '#ce93d8', accent: '#e91e63' }
  if (loc.includes('street') || loc.includes('road') || loc.includes('city')) return { bg: '#eceff1', sky, ground: '#90a4ae', accent: '#607d8b' }

  // Weather override
  if (weather.includes('rain')) return { bg: '#e3f2fd', sky: '#546e7a', ground: '#78909c', accent: '#42a5f5' }
  if (weather.includes('snow')) return { bg: '#e3f2fd', sky: '#b0bec5', ground: '#eceff1', accent: '#90caf9' }
  if (weather.includes('night')) return { bg: '#0d1b3e', sky: '#0d1b3e', ground: '#1a237e', accent: '#ffd54f' }

  // Default: warm afternoon
  return { bg: '#fff9c4', sky, ground: '#c8e6c9', accent: '#ffca28' }
}

/* ─── Character color helpers ─── */

const SKIN_TONES = ['#FDBCB4', '#F1A97C', '#D98B4A', '#C67E4A', '#8D5524']
const HAIR_COLORS = ['#2C1810', '#8B4513', '#D4A017', '#C0C0C0', '#1a1a2e', '#8B0000']

export function getCharColor(char: Character): { skin: string; hair: string; clothing: string } {
  // Hash name for consistent colors
  const hash = hashStr(char.name || 'x')
  const skin = SKIN_TONES[hash % SKIN_TONES.length]
  const hair = HAIR_COLORS[(hash >> 2) % HAIR_COLORS.length]
  const clothing = char.dressColor && isValidHex(char.dressColor)
    ? char.dressColor
    : ['#e53935', '#1565c0', '#2e7d32', '#6a1b9a', '#e65100', '#00838f'][(hash >> 4) % 6]
  return { skin, hair, clothing }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function isValidHex(c: string): boolean {
  return /^#[0-9A-Fa-f]{3,6}$/.test(c)
}
