import { useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import NavBar from '../components/NavBar'
import { useUser } from '../store/UserContext'
import type { Character, Situation, Dialogue, TikTik, ComicProject } from '../types'
import { generateComic } from '../comic/generator'
import type { ComicScript } from '../comic/generator'
import ComicViewer from '../comic/ComicViewer'

const LANGUAGES = ['English','Tamil','Hindi','Japanese','Chinese','French','Spanish','German','Arabic','Korean','Italian','Russian','Portuguese','Malayalam','Telugu','Kannada','Bengali','Urdu','Swahili','Dutch','Greek','Polish','Swedish','Norwegian','Danish','Finnish']
const EMOTIONS = ['Happy','Sad','Nostalgic','Funny','Romantic','Adventurous','Mysterious','Angry','Peaceful','Exciting']
const EXPRESSIONS = ['Smiling','Crying','Laughing','Surprised','Confused','Thinking','Angry','Scared','Blushing','Neutral']
const WEATHERS = ['Sunny','Rainy','Cloudy','Snowy','Windy','Stormy','Foggy','Clear Night']

const uid = () => Math.random().toString(36).slice(2, 10)

const STEPS = [
  { id: 1, label: '👥 Characters', short: 'Characters' },
  { id: 2, label: '💬 Memory Prompt', short: 'Scenes' },
  { id: 3, label: '🕰️ TikTik', short: 'Timeline' },
  { id: 4, label: '📄 Pages', short: 'Pages' },
  { id: 5, label: '🌐 Language', short: 'Language' },
]

function emptyCharacter(): Character {
  return { id: uid(), name: '', gender: '', height: '', dress: '', dressColor: '', age: '', description: '' }
}
function emptySituation(): Situation {
  return { id: uid(), location: '', description: '', emotion: '', time: '', weather: '', dialogues: [] }
}
function emptyDialogue(chars: Character[]): Dialogue {
  return { id: uid(), characterId: chars[0]?.id ?? '', text: '', emotion: '', expression: '' }
}

export default function MemoryCanvas() {
  const { projects, addProject, updateProject } = useUser()
  const { id } = useParams()
  const navigate = useNavigate()

  const existing = id ? projects.find(p => p.id === id) : null

  const [step, setStep] = useState(1)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [characters, setCharacters] = useState<Character[]>(existing?.characters ?? [emptyCharacter()])
  const [situations, setSituations] = useState<Situation[]>(existing?.situations ?? [emptySituation()])
  const [tikTik, setTikTik] = useState<TikTik>(existing?.tikTik ?? { date: '', time: '', year: '' })
  const [pages, setPages] = useState(existing?.pages ?? 10)
  const [language, setLanguage] = useState(existing?.language ?? 'English')
  const [mainEmotion, setMainEmotion] = useState(existing?.emotion ?? '')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(existing?.status === 'generated')
  const [comicScript, setComicScript] = useState<ComicScript | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const save = useCallback((status: 'draft' | 'generated' = 'draft') => {
    const project: ComicProject = {
      id: existing?.id ?? uid(),
      title: title || 'Untitled Story',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      language,
      emotion: mainEmotion,
      pages,
      characters,
      situations,
      tikTik,
      status,
      frontCover: existing?.frontCover,
      backCover: existing?.backCover,
    }
    if (existing) updateProject(project)
    else addProject(project)
    return project
  }, [title, language, mainEmotion, pages, characters, situations, tikTik, existing, addProject, updateProject])

  const handleGenerate = async () => {
    setGenerating(true)
    const project = save('draft')
    
    try {
      const response = await fetch('/api/generate-comic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      })
      if (!response.ok) {
        throw new Error('Backend generation failed')
      }
      const script = await response.json()
      save('generated')
      setComicScript(script)
      setGenerating(false)
      setGenerated(true)
      setViewerOpen(true)
    } catch (err) {
      console.error('Error generating comic from backend, falling back to local:', err)
      // Fallback to client-side generation
      await new Promise(r => setTimeout(r, 1500))
      const script = await generateComic(project)
      save('generated')
      setComicScript(script)
      setGenerating(false)
      setGenerated(true)
      setViewerOpen(true)
    }
  }

  const handleViewComic = async () => {
    if (!comicScript) {
      setGenerating(true)
      const project: ComicProject = {
        id: existing?.id ?? uid(),
        title: title || 'Untitled Story',
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        language,
        emotion: mainEmotion,
        pages,
        characters,
        situations,
        tikTik,
        status: 'generated',
        frontCover: existing?.frontCover,
        backCover: existing?.backCover,
      }
      try {
        const response = await fetch('/api/generate-comic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        })
        if (!response.ok) throw new Error('API failed')
        const script = await response.json()
        setComicScript(script)
      } catch (err) {
        console.error('Failed to fetch from backend, generating locally:', err)
        const script = await generateComic(project)
        setComicScript(script)
      } finally {
        setGenerating(false)
      }
    }
    setViewerOpen(true)
  }

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh' }}>
      <NavBar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--theme-muted)', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
            <span className="memo-label" style={{ margin: 0 }}>Memory Canvas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              className="memo-input"
              placeholder="Story title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ fontSize: 20, fontFamily: "'Fredoka', sans-serif", fontWeight: 600, background: 'transparent', border: 'none', borderBottom: '1px solid var(--theme-border)', borderRadius: 0, padding: '6px 0', color: 'var(--theme-primary)' }}
            />
            <button className="btn-secondary" style={{ whiteSpace: 'nowrap', fontSize: 12 }} onClick={() => save()}>
              💾 Save Draft
            </button>
          </div>
        </motion.div>

        {/* Step tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, flexWrap: 'wrap' }}>
          {STEPS.map(s => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 50,
                border: `1px solid ${step === s.id ? 'var(--theme-primary)' : 'var(--theme-border)'}`,
                background: step === s.id ? 'var(--theme-primary)' : step > s.id ? 'var(--theme-accent)' : 'transparent',
                color: step === s.id ? 'var(--theme-bg)' : step > s.id ? 'var(--theme-primary-light)' : 'var(--theme-muted)',
                fontFamily: "'Fredoka', sans-serif",
                fontWeight: 600, fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <CharactersStep characters={characters} setCharacters={setCharacters} />
            )}
            {step === 2 && (
              <ScenesStep situations={situations} setSituations={setSituations} characters={characters} />
            )}
            {step === 3 && (
              <TikTikStep tikTik={tikTik} setTikTik={setTikTik} />
            )}
            {step === 4 && (
              <PagesStep pages={pages} setPages={setPages} emotion={mainEmotion} setEmotion={setMainEmotion} />
            )}
            {step === 5 && (
              <LanguageStep
                language={language}
                setLanguage={setLanguage}
                onGenerate={handleGenerate}
                generating={generating}
                generated={generated}
                onNavigateCover={() => navigate('/cover-canvas')}
                onViewComic={handleViewComic}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
          <button
            className="btn-secondary"
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
            onClick={() => setStep(s => s - 1)}
          >
            ← Previous
          </button>
          {step < 5 && (
            <button className="btn-primary" onClick={() => setStep(s => s + 1)}>
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Comic viewer */}
      <AnimatePresence>
        {viewerOpen && comicScript && (
          <ComicViewer comic={comicScript} onClose={() => setViewerOpen(false)} />
        )}
      </AnimatePresence>

      {/* Generating overlay */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              zIndex: 300, backdropFilter: 'blur(12px)',
            }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ fontSize: 64, marginBottom: 20 }}>🎨</motion.div>
            <h2 style={{ fontFamily: "'Fredoka', sans-serif", color: 'var(--theme-primary)', fontSize: 28 }}>Generating your comic…</h2>
            <p style={{ color: 'var(--theme-muted)' }}>Building panels, characters, and speech bubbles</p>
            <GeneratingSteps />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Step 1: Characters ─── */
function CharactersStep({ characters, setCharacters }: { characters: Character[]; setCharacters: React.Dispatch<React.SetStateAction<Character[]>> }) {
  const addChar = () => setCharacters(c => [...c, emptyCharacter()])
  const updateChar = (id: string, field: keyof Character, value: string) =>
    setCharacters(c => c.map(ch => ch.id === id ? { ...ch, [field]: value } : ch))
  const removeChar = (id: string) => setCharacters(c => c.filter(ch => ch.id !== id))

  return (
    <div>
      <SectionHeader emoji="👥" title="Characters" subtitle="Define every person who appears in your story" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {characters.map((char, i) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass"
            style={{ borderRadius: 20, padding: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 16, color: 'var(--theme-primary)', fontWeight: 600 }}>
                Character {i + 1}
              </span>
              {characters.length > 1 && (
                <button onClick={() => removeChar(char.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18 }}>✕</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Name">
                <input className="memo-input" placeholder="Character name" value={char.name} onChange={e => updateChar(char.id, 'name', e.target.value)} />
              </FormField>
              <FormField label="Gender">
                <select className="memo-input" value={char.gender} onChange={e => updateChar(char.id, 'gender', e.target.value)}>
                  <option value="">Select gender</option>
                  <option>Female</option><option>Male</option><option>Non-binary</option><option>Other</option>
                </select>
              </FormField>
              <FormField label="Height">
                <input className="memo-input" placeholder="e.g. 5'6&quot; or 168cm" value={char.height} onChange={e => updateChar(char.id, 'height', e.target.value)} />
              </FormField>
              <FormField label="Age (Optional)">
                <input className="memo-input" type="number" placeholder="Age" value={char.age} onChange={e => updateChar(char.id, 'age', e.target.value)} />
              </FormField>
              <FormField label="Dress Style">
                <input className="memo-input" placeholder="e.g. casual, saree, school uniform" value={char.dress} onChange={e => updateChar(char.id, 'dress', e.target.value)} />
              </FormField>
              <FormField label="Dress Color">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="memo-input" placeholder="e.g. navy blue" value={char.dressColor} onChange={e => updateChar(char.id, 'dressColor', e.target.value)} style={{ flex: 1 }} />
                  <input type="color" value={char.dressColor || '#ffffff'} onChange={e => updateChar(char.id, 'dressColor', e.target.value)} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--theme-border)', cursor: 'pointer', background: 'none', padding: 2 }} />
                </div>
              </FormField>
            </div>
            <FormField label="Character Description" style={{ marginTop: 14 }}>
              <textarea className="memo-input" placeholder="Personality, backstory, key traits…" value={char.description} onChange={e => updateChar(char.id, 'description', e.target.value)} style={{ minHeight: 72 }} />
            </FormField>
            {/* Image upload placeholder */}
            <div style={{ marginTop: 14 }}>
              <label className="memo-label">Character Image (Optional)</label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                border: '1px dashed var(--theme-border)', borderRadius: 12,
                cursor: 'pointer', color: 'var(--theme-muted)', fontSize: 13,
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--theme-primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--theme-border)')}
              >
                <span style={{ fontSize: 24 }}>🖼️</span>
                {char.imageUrl ? 'Image attached ✓' : 'Upload character image'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const url = URL.createObjectURL(file)
                    updateChar(char.id, 'imageUrl', url)
                  }
                }} />
              </label>
              {char.imageUrl && (
                <img src={char.imageUrl} alt="Character" style={{ marginTop: 10, width: 80, height: 80, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--theme-border)' }} />
              )}
            </div>
          </motion.div>
        ))}
      </div>
      <button className="btn-secondary" style={{ marginTop: 16, width: '100%' }} onClick={addChar}>
        + Add Another Character
      </button>
    </div>
  )
}

/* ─── Step 2: Scenes / Memory Prompt ─── */
function ScenesStep({ situations, setSituations, characters }: {
  situations: Situation[]
  setSituations: React.Dispatch<React.SetStateAction<Situation[]>>
  characters: Character[]
}) {
  const addSituation = () => setSituations(s => [...s, emptySituation()])
  const updateSituation = (id: string, field: keyof Omit<Situation, 'dialogues'>, value: string) =>
    setSituations(s => s.map(sit => sit.id === id ? { ...sit, [field]: value } : sit))
  const removeSituation = (id: string) => setSituations(s => s.filter(sit => sit.id !== id))

  const addDialogue = (sitId: string) =>
    setSituations(s => s.map(sit => sit.id === sitId ? { ...sit, dialogues: [...sit.dialogues, emptyDialogue(characters)] } : sit))
  const updateDialogue = (sitId: string, dId: string, field: keyof Dialogue, value: string) =>
    setSituations(s => s.map(sit => sit.id === sitId ? {
      ...sit,
      dialogues: sit.dialogues.map(d => d.id === dId ? { ...d, [field]: value } : d),
    } : sit))
  const removeDialogue = (sitId: string, dId: string) =>
    setSituations(s => s.map(sit => sit.id === sitId ? { ...sit, dialogues: sit.dialogues.filter(d => d.id !== dId) } : sit))

  return (
    <div>
      <SectionHeader emoji="💬" title="Memory Prompt" subtitle="Describe each scene and the conversations that happened" />
      {situations.map((sit, i) => (
        <motion.div key={sit.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ borderRadius: 20, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 17, color: 'var(--theme-primary)', fontWeight: 600 }}>
              Scene {i + 1}
            </span>
            {situations.length > 1 && (
              <button onClick={() => removeSituation(sit.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18 }}>✕</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="📍 Location">
              <input className="memo-input" placeholder="Where did this happen?" value={sit.location} onChange={e => updateSituation(sit.id, 'location', e.target.value)} />
            </FormField>
            <FormField label="⏰ Time of Day">
              <input className="memo-input" placeholder="e.g. Evening, Dawn, 3pm" value={sit.time} onChange={e => updateSituation(sit.id, 'time', e.target.value)} />
            </FormField>
            <FormField label="😊 Emotion">
              <select className="memo-input" value={sit.emotion} onChange={e => updateSituation(sit.id, 'emotion', e.target.value)}>
                <option value="">Select emotion</option>
                {EMOTIONS.map(em => <option key={em}>{em}</option>)}
              </select>
            </FormField>
            <FormField label="🌤️ Weather">
              <select className="memo-input" value={sit.weather} onChange={e => updateSituation(sit.id, 'weather', e.target.value)}>
                <option value="">Select weather</option>
                {WEATHERS.map(w => <option key={w}>{w}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="📖 What Happened" style={{ marginTop: 14 }}>
            <textarea className="memo-input" placeholder="Describe the scene in detail — what was happening, how it felt, what you remember most…" value={sit.description} onChange={e => updateSituation(sit.id, 'description', e.target.value)} style={{ minHeight: 96 }} />
          </FormField>

          {/* Dialogues */}
          <div style={{ marginTop: 20, borderTop: '1px solid var(--theme-border)', paddingTop: 20 }}>
            <label className="memo-label" style={{ marginBottom: 12, display: 'block' }}>💬 Dialogues</label>
            {sit.dialogues.map((dial) => (
              <div key={dial.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16, marginBottom: 12, border: '1px solid var(--theme-border)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: '0 0 auto', minWidth: 160 }}>
                    <label className="memo-label">Character</label>
                    <select className="memo-input" value={dial.characterId} onChange={e => updateDialogue(sit.id, dial.id, 'characterId', e.target.value)}>
                      {characters.filter(c => c.name).map(c => <option key={c.id} value={c.id}>{c.name || 'Unnamed'}</option>)}
                      {characters.filter(c => c.name).length === 0 && <option value="">Add characters first</option>}
                    </select>
                  </div>
                  <div style={{ flex: '0 0 auto', minWidth: 130 }}>
                    <label className="memo-label">Emotion</label>
                    <select className="memo-input" value={dial.emotion} onChange={e => updateDialogue(sit.id, dial.id, 'emotion', e.target.value)}>
                      <option value="">Emotion</option>
                      {EMOTIONS.map(em => <option key={em}>{em}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '0 0 auto', minWidth: 130 }}>
                    <label className="memo-label">Expression</label>
                    <select className="memo-input" value={dial.expression} onChange={e => updateDialogue(sit.id, dial.id, 'expression', e.target.value)}>
                      <option value="">Expression</option>
                      {EXPRESSIONS.map(ex => <option key={ex}>{ex}</option>)}
                    </select>
                  </div>
                  <button onClick={() => removeDialogue(sit.id, dial.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, marginTop: 20 }}>✕</button>
                </div>
                <div style={{ marginTop: 10 }}>
                  <label className="memo-label">Dialogue</label>
                  <textarea className="memo-input" placeholder={`What does ${characters.find(c => c.id === dial.characterId)?.name || 'this character'} say?`} value={dial.text} onChange={e => updateDialogue(sit.id, dial.id, 'text', e.target.value)} style={{ minHeight: 60 }} />
                </div>
              </div>
            ))}
            <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => addDialogue(sit.id)}>
              + Add Dialogue
            </button>
          </div>
        </motion.div>
      ))}
      <button className="btn-secondary" style={{ width: '100%' }} onClick={addSituation}>
        + Add Another Scene
      </button>
    </div>
  )
}

/* ─── Step 3: TikTik ─── */
function TikTikStep({ tikTik, setTikTik }: { tikTik: TikTik; setTikTik: React.Dispatch<React.SetStateAction<TikTik>> }) {
  return (
    <div>
      <SectionHeader emoji="🕰️" title="TikTik — Timeline" subtitle="When did this memory take place? Set the time stamp for your story." />
      <div className="glass" style={{ borderRadius: 20, padding: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          <FormField label="📅 Date">
            <input className="memo-input" type="date" value={tikTik.date} onChange={e => setTikTik(t => ({ ...t, date: e.target.value }))} />
          </FormField>
          <FormField label="⏰ Time">
            <input className="memo-input" type="time" value={tikTik.time} onChange={e => setTikTik(t => ({ ...t, time: e.target.value }))} />
          </FormField>
          <FormField label="📆 Year">
            <input className="memo-input" type="number" placeholder="e.g. 2019" min="1900" max="2099" value={tikTik.year} onChange={e => setTikTik(t => ({ ...t, year: e.target.value }))} />
          </FormField>
        </div>

        {/* Timeline preview */}
        {(tikTik.date || tikTik.time || tikTik.year) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 28, padding: '20px 24px',
              background: 'var(--theme-glow)',
              border: '1px solid var(--theme-border)',
              borderRadius: 16,
              display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <span style={{ fontSize: 36 }}>🕰️</span>
            <div>
              <p className="memo-label" style={{ marginBottom: 4 }}>Story Timestamp</p>
              <p style={{ margin: 0, fontFamily: "'Fredoka', sans-serif", fontSize: 20, color: 'var(--theme-primary)' }}>
                {[tikTik.date && new Date(tikTik.date + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' }), tikTik.year, tikTik.time].filter(Boolean).join(' · ')}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ─── Step 4: Pages + Emotion ─── */
function PagesStep({ pages, setPages, emotion, setEmotion }: { pages: number; setPages: (v: number) => void; emotion: string; setEmotion: (v: string) => void }) {
  return (
    <div>
      <SectionHeader emoji="📄" title="Pages & Mood" subtitle="Choose how long your comic will be and set the overall emotional tone." />
      <div className="glass" style={{ borderRadius: 20, padding: 32 }}>
        <FormField label="Number of Pages">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <select className="memo-input" value={pages} onChange={e => setPages(Number(e.target.value))} style={{ flex: 1 }}>
              {Array.from({ length: 100 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} page{n !== 1 ? 's' : ''}</option>
              ))}
            </select>
            <div style={{
              width: 64, height: 64, borderRadius: 12,
              background: 'var(--theme-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 700,
              color: 'var(--theme-bg)', flexShrink: 0,
            }}>
              {pages}
            </div>
          </div>
        </FormField>

        <FormField label="Overall Story Emotion" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOTIONS.map(em => (
              <button
                key={em}
                onClick={() => setEmotion(em)}
                style={{
                  padding: '8px 16px', borderRadius: 50,
                  border: `1px solid ${emotion === em ? 'var(--theme-primary)' : 'var(--theme-border)'}`,
                  background: emotion === em ? 'var(--theme-primary)' : 'transparent',
                  color: emotion === em ? 'var(--theme-bg)' : 'var(--theme-muted)',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {em}
              </button>
            ))}
          </div>
        </FormField>
      </div>
    </div>
  )
}

/* ─── Step 5: Language + Generate ─── */
function LanguageStep({ language, setLanguage, onGenerate, generating, generated, onNavigateCover, onViewComic }: {
  language: string; setLanguage: (v: string) => void
  onGenerate: () => void; generating: boolean; generated: boolean
  onNavigateCover: () => void; onViewComic: () => void
}) {
  return (
    <div>
      <SectionHeader emoji="🌐" title="Language" subtitle="Choose the language for your comic dialogues and narration." />
      <div className="glass" style={{ borderRadius: 20, padding: 32 }}>
        <FormField label="Comic Language">
          <select className="memo-input" value={language} onChange={e => setLanguage(e.target.value)} style={{ fontSize: 16 }}>
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
        </FormField>

        <div style={{
          marginTop: 32, padding: 24,
          background: 'var(--theme-glow)', borderRadius: 16,
          border: '1px solid var(--theme-border)',
        }}>
          {generated ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 48, margin: '0 0 12px' }}>🎉</p>
              <h3 style={{ fontFamily: "'Fredoka', sans-serif", color: 'var(--theme-primary)', margin: '0 0 8px' }}>Comic Generated!</h3>
              <p style={{ color: 'var(--theme-muted)', marginBottom: 20 }}>Your comic has been generated! View it or design the cover.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={onViewComic}>📖 Read Comic</button>
                <button className="btn-secondary" onClick={onGenerate}>🔄 Regenerate</button>
                <button className="btn-primary" onClick={onNavigateCover}>🎨 Design Cover →</button>
              </div>
            </motion.div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--theme-muted)', fontSize: 14, marginBottom: 20 }}>
                Ready? The AI will weave your characters, scenes, and dialogues into a full visual comic — panels, speech bubbles, and all.
              </p>
              <button
                className="btn-primary"
                onClick={onGenerate}
                disabled={generating}
                style={{ fontSize: 18, padding: '14px 40px', opacity: generating ? 0.6 : 1 }}
              >
                🎨 Generate Comic
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Shared UI ─── */
function SectionHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 26, color: 'var(--theme-primary)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>{emoji}</span> {title}
      </h2>
      <p style={{ color: 'var(--theme-muted)', margin: 0, fontSize: 14 }}>{subtitle}</p>
    </div>
  )
}

function FormField({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label className="memo-label">{label}</label>
      {children}
    </div>
  )
}

function GeneratingSteps() {
  const steps = ['Extracting characters & scenes…', 'Planning panel layout…', 'Drawing characters & backgrounds…', 'Adding speech bubbles…', 'Composing comic pages…']
  const [current, setCurrent] = useState(0)
  useState(() => {
    const iv = setInterval(() => setCurrent(c => (c + 1) % steps.length), 500)
    return () => clearInterval(iv)
  })
  return (
    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      {steps.map((s, i) => (
        <motion.div
          key={s}
          animate={{ opacity: i <= current ? 1 : 0.25 }}
          style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--theme-muted)' }}
        >
          {i < current ? '✓' : i === current ? '→' : '○'} {s}
        </motion.div>
      ))}
    </div>
  )
}
