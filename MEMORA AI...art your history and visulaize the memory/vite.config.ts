import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs'
import PDFDocument from 'pdfkit'
import { generateComic } from './src/comic/generator'

const LANG_MAP: Record<string, string> = {
  'english': 'en',
  'tamil': 'ta',
  'hindi': 'hi',
  'japanese': 'ja',
  'chinese': 'zh-CN',
  'french': 'fr',
  'spanish': 'es',
  'german': 'de',
  'arabic': 'ar',
  'korean': 'ko',
  'italian': 'it',
  'russian': 'ru',
  'portuguese': 'pt',
  'malayalam': 'ml',
  'telugu': 'te',
  'kannada': 'kn',
  'bengali': 'bn',
  'urdu': 'ur',
  'swahili': 'sw',
  'dutch': 'nl',
  'greek': 'el',
  'polish': 'pl',
  'swedish': 'sv',
  'norwegian': 'no',
  'danish': 'da',
  'finnish': 'fi'
}

async function translateText(text: string, targetLangName: string): Promise<string> {
  if (!text || !text.trim()) return text
  const langCode = LANG_MAP[targetLangName.toLowerCase()]
  if (!langCode || langCode === 'en') return text // skip if English or unsupported
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    })
    if (!response.ok) {
      throw new Error(`Translation status: ${response.statusText}`)
    }
    const json = await response.json()
    if (json && json[0]) {
      return json[0].map((s: any) => s[0] || '').join('')
    }
    return text
  } catch (err) {
    console.error(`Failed to translate text to ${targetLangName}:`, err)
    return text
  }
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err) {
    console.error(`Failed to fetch image from ${url}:`, err)
    return null
  }
}

interface Slot { x: number; y: number; w: number; h: number }

function getLayoutSlots(layout: string, panelCount: number, pw: number, ph: number): Slot[] {
  const GAP = 6
  const pad = 12
  const x0 = pad, y0 = pad
  const W = pw - pad * 2
  const H = ph - pad * 2

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
    const lW = Math.round(W * 0.55)
    const rW = W - lW - GAP
    const rH = Math.round((H - GAP) / 2)
    return [
      { x: x0, y: y0, w: lW, h: H },
      { x: x0 + lW + GAP, y: y0, w: rW, h: rH },
      { x: x0 + lW + GAP, y: y0 + rH + GAP, w: rW, h: H - rH - GAP },
    ]
  }

  const hw = Math.round((W - GAP) / 2)
  const hh = Math.round((H - GAP) / 2)
  return [
    { x: x0, y: y0, w: hw, h: hh },
    { x: x0 + hw + GAP, y: y0, w: W - hw - GAP, h: hh },
    { x: x0, y: y0 + hh + GAP, w: hw, h: H - hh - GAP },
    { x: x0 + hw + GAP, y: y0 + hh + GAP, w: W - hw - GAP, h: H - hh - GAP },
  ]
}

function slotsForLayout(layout: string): number {
  const map: Record<string, number> = {
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

async function generateComicPdf(project: any, script: any, frontCover: any, backCover: any): Promise<string> {
  const sanitizedTitle = (project.title || 'Untitled_Comic').replace(/[^a-zA-Z0-9_-]/g, '_')
  const workspaceDir = process.cwd()
  const pdfPath = path.join(workspaceDir, `${sanitizedTitle}.pdf`)

  const doc = new PDFDocument({ size: [600, 850], autoFirstPage: false })
  const stream = fs.createWriteStream(pdfPath)
  doc.pipe(stream)

  // 1. FRONT COVER
  doc.addPage()
  const bg = frontCover.backgroundColor || '#1a0f2e'
  doc.rect(0, 0, 600, 850).fill(bg)
  
  // Title
  doc.fillColor('#ffffff')
     .fontSize(36)
     .font('Helvetica-Bold')
     .text(frontCover.title || project.title || 'Untitled Comic', 50, 80, { align: 'center', width: 500 })

  // Author
  if (frontCover.authorName) {
    doc.fillColor('rgba(255,255,255,0.7)')
       .fontSize(16)
       .font('Helvetica')
       .text(`by ${frontCover.authorName}`, 50, 150, { align: 'center', width: 500 })
  }

  // Cover Image
  if (frontCover.characterImageUrl) {
    const coverBuf = await fetchImageBuffer(frontCover.characterImageUrl)
    if (coverBuf) {
      try {
        doc.image(coverBuf, 100, 220, { width: 400, height: 450, fit: [400, 450] })
      } catch (e) {
        console.error('Failed to draw cover image:', e)
      }
    }
  } else {
    doc.rect(150, 250, 300, 300)
       .stroke('rgba(255,255,255,0.2)')
  }

  // Cover Tags
  const tags = [frontCover.comicStyle, frontCover.coverTheme].filter(Boolean)
  if (tags.length > 0) {
    doc.fillColor('rgba(255,255,255,0.5)')
       .fontSize(12)
       .font('Helvetica')
       .text(tags.join('  ·  '), 50, 750, { align: 'center', width: 500 })
  }

  // 2. COMIC PAGES
  for (const page of script.pages) {
    doc.addPage()
    doc.rect(0, 0, 600, 850).fill('white')
    doc.rect(10, 10, 580, 830).stroke('#1a1a1a')

    const slots = getLayoutSlots(page.layout, page.panels.length, 600, 850)
    
    for (let i = 0; i < slots.length; i++) {
      const panel = page.panels[i]
      const slot = slots[i]
      if (!panel || !slot) continue

      if (panel.imageUrl) {
        const pBuf = await fetchImageBuffer(panel.imageUrl)
        if (pBuf) {
          try {
            doc.image(pBuf, slot.x, slot.y, {
              width: slot.w,
              height: slot.h,
              fit: [slot.w, slot.h]
            })
          } catch (e) {
            console.error(`Failed to draw panel ${panel.id} image:`, e)
            doc.rect(slot.x, slot.y, slot.w, slot.h).fill('#f5f5f5')
          }
        } else {
          doc.rect(slot.x, slot.y, slot.w, slot.h).fill('#f5f5f5')
        }
      } else {
        doc.rect(slot.x, slot.y, slot.w, slot.h).fill('#f5f5f5')
      }

      doc.rect(slot.x, slot.y, slot.w, slot.h).stroke('#1a1a1a')

      if (panel.narratorText) {
        const boxH = 22
        doc.rect(slot.x, slot.y, slot.w, boxH)
           .fill('white')
           .stroke('#1a1a1a')
        doc.fillColor('#1a1a1a')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text(panel.narratorText, slot.x + 6, slot.y + 6, { width: slot.w - 12, height: boxH - 6, ellipsis: true })
      }

      if (panel.dialogue && panel.dialogue.text) {
        const name = panel.speaker?.name || 'Speaker'
        const dialText = `${name}: "${panel.dialogue.text}"`
        const bubbleW = Math.min(slot.w * 0.85, 200)
        const bubbleH = 36
        const bubbleX = slot.x + (slot.w - bubbleW) / 2
        const bubbleY = slot.y + slot.h - bubbleH - 8

        doc.rect(bubbleX, bubbleY, bubbleW, bubbleH)
           .fill('white')
           .stroke('#1a1a1a')

        doc.fillColor('#1a1a1a')
           .fontSize(8)
           .font('Helvetica')
           .text(dialText, bubbleX + 6, bubbleY + 6, { width: bubbleW - 12, height: bubbleH - 12 })
      }
    }

    doc.fillColor('#1a1a1a')
       .fontSize(10)
       .font('Helvetica')
       .text(page.number.toString(), page.number % 2 === 0 ? 25 : 550, 825, { width: 25 })
  }

  // 3. BACK COVER
  doc.addPage()
  doc.rect(0, 0, 600, 850).fill('#111827')

  doc.fillColor('#a78bfa')
     .fontSize(28)
     .font('Helvetica-Bold')
     .text('ABOUT THE AUTHOR', 50, 100, { align: 'center', width: 500 })

  if (backCover.authorName) {
    doc.fillColor('#ffffff')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(backCover.authorName, 50, 160, { align: 'center', width: 500 })
  }

  if (backCover.authorDescription) {
    doc.fillColor('#d1d5db')
       .fontSize(13)
       .font('Helvetica')
       .text(backCover.authorDescription, 80, 220, { align: 'center', width: 440, lineGap: 6 })
  }

  if (backCover.signatureDataUrl) {
    try {
      const sigData = backCover.signatureDataUrl.split(',')[1]
      if (sigData) {
        const sigBuf = Buffer.from(sigData, 'base64')
        doc.fillColor('#ffffff')
           .fontSize(11)
           .font('Helvetica-Oblique')
           .text('Author Signature', 50, 620, { align: 'center', width: 500 })
        doc.image(sigBuf, 200, 640, { width: 200, height: 80, fit: [200, 80] })
      }
    } catch (e) {
      console.error('Failed to draw signature:', e)
    }
  }

  doc.end()
  await new Promise((resolve) => stream.on('finish', resolve))

  return pdfPath
}

function readRequestBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: any) => { body += chunk })
    req.on('end', () => resolve(body))
    req.on('error', (err: any) => reject(err))
  })
}

function backendGenerateComicPlugin() {
  const handler = async (req: any, res: any, next: any) => {
    if (req.url === '/api/generate-comic' && req.method === 'POST') {
      try {
        const body = await readRequestBody(req)
        const project = JSON.parse(body)
        const script = generateComic(project)
        
        // Translate all panels' dialogues and narration texts to the selected language
        const targetLanguage = project.language || 'English'
        if (targetLanguage.toLowerCase() !== 'english') {
          const promises: Promise<any>[] = []
          for (const page of script.pages) {
            for (const panel of page.panels) {
              if (panel.narratorText) {
                const currentPanel = panel
                promises.push(
                  translateText(panel.narratorText, targetLanguage).then(resText => {
                    currentPanel.narratorText = resText
                  })
                )
              }
              if (panel.dialogue && panel.dialogue.text) {
                const currentDialogue = panel.dialogue
                promises.push(
                  translateText(panel.dialogue.text, targetLanguage).then(resText => {
                    currentDialogue.text = resText
                  })
                )
              }
            }
          }
          await Promise.all(promises)
        }
        
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        })
        res.end(JSON.stringify(script))
      } catch (err: any) {
        console.error('API generate-comic error:', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message || 'Generation failed' }))
      }
      return
    }
    if (req.url === '/api/export-pdf' && req.method === 'POST') {
      try {
        const body = await readRequestBody(req)
        const data = JSON.parse(body)
        
        const pdfPath = await generateComicPdf(data.project, data.script, data.frontCover, data.backCover)
        const pdfBuffer = fs.readFileSync(pdfPath)
        
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        })
        res.end(JSON.stringify({
          success: true,
          pdfPath: pdfPath,
          pdfBase64: pdfBuffer.toString('base64'),
          fileName: path.basename(pdfPath)
        }))
      } catch (err: any) {
        console.error('API export-pdf error:', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message || 'PDF export failed' }))
      }
      return
    }
    next()
  }

  return {
    name: 'backend-generate-comic-api',
    configureServer(server: any) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(handler)
    }
  }
}

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    backendGenerateComicPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
  },
})
