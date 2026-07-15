import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Download, Maximize2, Loader2, CheckCircle2, FileImage, Layers } from 'lucide-react'
import Layout from '../components/Layout'

const GENERATION_STAGES = [
  'Preparing Story Graph',
  'Initializing Stable Diffusion Model',
  'Generating Prompts',
  'Rendering Panel 1/3',
  'Rendering Panel 2/3',
  'Rendering Panel 3/3',
  'Verifying Consistency',
  'Building Pages'
]

export default function GenerationPreview() {
  const [stage, setStage] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  
  // Fake progress simulation
  useEffect(() => {
    if (stage < GENERATION_STAGES.length) {
      const timer = setTimeout(() => {
        setStage(prev => prev + 1)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setIsComplete(true)
    }
  }, [stage])

  const intelligencePanel = (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Rendering Engine</h3>
      
      <div className="bg-[#131318] border border-[#2a2a30] rounded-lg p-4 mb-4">
        <div className="space-y-3">
          {GENERATION_STAGES.map((s, idx) => {
            const isPast = idx < stage
            const isCurrent = idx === stage
            return (
              <div key={idx} className="flex items-center gap-3">
                {isPast ? (
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 size={16} className="text-indigo-500 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[#2a2a30] shrink-0" />
                )}
                <span className={`text-sm ${isPast ? 'text-gray-300' : isCurrent ? 'text-white font-medium' : 'text-gray-600'}`}>
                  {s}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <Layout title="Comic Preview" rightPanel={intelligencePanel}>
      <div className="max-w-5xl mx-auto py-6 h-full flex flex-col">
        
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-bold font-['Fredoka',sans-serif] text-white">Preview</h1>
            <p className="text-gray-400 mt-1">Review your generated comic pages.</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              disabled={!isComplete}
              className="flex items-center gap-2 bg-[#131318] border border-[#2a2a30] hover:bg-[#1a1a20] text-gray-300 py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <FileImage size={18} /> Export PNG
            </button>
            <button 
              disabled={!isComplete}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Download size={18} /> Export PDF
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#131318] border border-[#2a2a30] rounded-xl overflow-hidden relative flex flex-col items-center justify-center min-h-[500px]">
          
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div 
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={32} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">Generating Art...</h3>
                  <p className="text-gray-400">{GENERATION_STAGES[Math.min(stage, GENERATION_STAGES.length - 1)]}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full p-8 flex gap-8 overflow-x-auto items-start"
              >
                {/* Mock Page 1 */}
                <div className="bg-white p-4 shrink-0 shadow-2xl relative group w-[400px] h-[600px] flex flex-col gap-2">
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20 backdrop-blur-sm">
                    <button className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform">
                      <Maximize2 size={24} />
                    </button>
                    <button className="bg-indigo-600 text-white p-3 rounded-full hover:scale-110 transition-transform">
                      <RefreshCw size={24} />
                    </button>
                  </div>
                  
                  {/* Mock Panels */}
                  <div className="bg-gray-200 h-1/3 w-full border-2 border-black flex items-center justify-center overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80" className="object-cover w-full h-full grayscale" alt="panel 1" />
                  </div>
                  <div className="flex h-1/3 w-full gap-2">
                    <div className="bg-gray-200 w-1/2 h-full border-2 border-black overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80" className="object-cover w-full h-full grayscale" alt="panel 2" />
                    </div>
                    <div className="bg-gray-200 w-1/2 h-full border-2 border-black overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80" className="object-cover w-full h-full grayscale" alt="panel 3" />
                    </div>
                  </div>
                  <div className="bg-gray-200 h-1/3 w-full border-2 border-black overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" className="object-cover w-full h-full grayscale" alt="panel 4" />
                    {/* Mock Dialogue bubble */}
                    <div className="absolute top-4 left-4 bg-white border-2 border-black p-3 text-black font-['Comic_Sans_MS',sans-serif] text-xs max-w-[150px] rounded-2xl rounded-bl-none">
                      I shouldn't have come back here.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </Layout>
  )
}
