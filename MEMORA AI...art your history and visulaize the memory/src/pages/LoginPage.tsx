import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../store/UserContext'
import type { Gender } from '../types'

const LANGUAGES = ['English','Tamil','Hindi','Japanese','Chinese','French','Spanish','German','Arabic','Korean','Italian','Russian','Portuguese','Malayalam','Telugu','Kannada']

export default function LoginPage() {
  const { login } = useUser()
  const [form, setForm] = useState({ name: '', email: '', dob: '', gender: '' as Gender | '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState<'form' | 'welcome'>('form')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Your name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email needed'
    if (!form.dob) e.dob = 'Date of birth needed'
    if (!form.gender) e.gender = 'Select your gender'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setStep('welcome')
    setTimeout(() => login({ name: form.name, email: form.email, dob: form.dob, gender: form.gender as Gender }), 1800)
  }

  const isFemale = form.gender === 'female'
  const isMale = form.gender === 'male'
  const accentColor = isFemale ? '#D97A9B' : isMale ? '#5878A8' : '#a78bfa'
  const glowColor = isFemale ? 'rgba(217,122,155,0.3)' : isMale ? 'rgba(88,120,168,0.3)' : 'rgba(167,139,250,0.25)'

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0c0c0e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Ambient blobs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: 500, height: 500,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], x: [0, -25, 0], y: [0, 20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '-15%', right: '-10%',
          width: 600, height: 600,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
        }}
      />

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'rgba(20,20,28,0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid rgba(255,255,255,0.07)`,
              borderRadius: 28,
              padding: '44px 40px',
              width: '100%',
              maxWidth: 440,
              boxShadow: `0 0 60px ${glowColor}, 0 32px 64px rgba(0,0,0,0.5)`,
              transition: 'box-shadow 0.4s ease',
              zIndex: 10,
              position: 'relative',
            }}
          >
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: 48, marginBottom: 8 }}
              >
                📖
              </motion.div>
              <h1
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: 36,
                  fontWeight: 700,
                  margin: 0,
                  color: accentColor,
                  letterSpacing: '0.01em',
                  transition: 'color 0.4s ease',
                  textShadow: `0 0 24px ${glowColor}`,
                }}
              >
                MemoraAI
              </h1>
              <p style={{ margin: '6px 0 0', color: '#a1a1aa', fontSize: 14, fontStyle: 'italic' }}>
                Every Memory Deserves a Story.
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Full Name" error={errors.name}>
                <input
                  className="memo-input"
                  placeholder="What's your name?"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  className="memo-input"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
              </Field>
              <Field label="Date of Birth" error={errors.dob}>
                <input
                  className="memo-input"
                  type="date"
                  value={form.dob}
                  onChange={e => setForm(p => ({ ...p, dob: e.target.value }))}
                />
              </Field>
              <Field label="Gender" error={errors.gender}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['female', 'male'] as Gender[]).map(g => (
                    <GenderPill
                      key={g}
                      gender={g}
                      selected={form.gender === g}
                      onClick={() => setForm(p => ({ ...p, gender: g }))}
                    />
                  ))}
                </div>
              </Field>
            </div>

            <motion.button
              className="btn-primary"
              style={{ width: '100%', marginTop: 28, background: accentColor, transition: 'background 0.4s ease' }}
              onClick={handleSubmit}
              whileTap={{ scale: 0.97 }}
            >
              ✨ Begin Journey
            </motion.button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#555', fontFamily: "'DM Mono', monospace" }}>
              Your memories stay private · Stored locally
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', zIndex: 10 }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 72, marginBottom: 16 }}
            >
              ✨
            </motion.div>
            <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 32, color: accentColor, margin: 0 }}>
              Welcome, {form.name}!
            </h2>
            <p style={{ color: '#a1a1aa', marginTop: 8 }}>Crafting your story space…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="memo-label">{label}</label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginBottom: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

function GenderPill({ gender, selected, onClick }: { gender: 'female' | 'male'; selected: boolean; onClick: () => void }) {
  const emoji = gender === 'female' ? '🌸' : '🌊'
  const label = gender === 'female' ? 'Female' : 'Male'
  const color = gender === 'female' ? '#D97A9B' : '#5878A8'
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px 0',
        borderRadius: 14,
        border: `1px solid ${selected ? color : 'rgba(255,255,255,0.08)'}`,
        background: selected ? `${color}22` : 'rgba(255,255,255,0.03)',
        color: selected ? color : '#666',
        fontFamily: "'Fredoka', sans-serif",
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      {emoji} {label}
    </motion.button>
  )
}
