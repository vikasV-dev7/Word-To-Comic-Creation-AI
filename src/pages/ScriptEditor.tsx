import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Type, MessageSquare, Plus, CheckCircle2, Play, ChevronRight, PenTool } from 'lucide-react'
import Layout from '../components/Layout'
import { motion } from 'framer-motion'

export default function ScriptEditor() {
  const navigate = useNavigate()
  const [panels] = useState([
    {
      id: 1,
      type: 'narration',
      content: 'The sun set over the floating city, casting long shadows across the lower districts.',
      artDirection: 'Wide establishing shot. Oranges and deep purples. A sense of scale and isolation.',
    },
    {
      id: 2,
      type: 'dialogue',
      character: 'Elias',
      content: 'I shouldn\'t have come back here.',
      artDirection: 'Close up on Elias. Exhausted, conflicted expression. Low lighting.',
    },
    {
      id: 3,
      type: 'action',
      content: 'He pulls his hood over his head and steps into the crowded market alley.',
      artDirection: 'Over the shoulder shot, looking into the bustling, neon-lit market.',
    }
  ])

  const intelligencePanel = (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Art Direction Engine</h3>
      
      <div className="bg-[#131318] border border-[#2a2a30] rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-300">Style Consistency</span>
          <span className="text-sm font-bold text-emerald-400">High</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          The Art Direction layer has automatically generated camera angles and lighting notes for these panels based on the scene's "Dusk" mood.
        </p>
      </div>

      <button className="w-full flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 py-2.5 rounded-lg font-medium transition-colors text-sm">
        <PenTool size={16} /> Auto-Revise Prompts
      </button>
    </div>
  )

  const getIcon = (type: string) => {
    switch (type) {
      case 'dialogue': return <MessageSquare size={16} className="text-blue-400" />
      case 'narration': return <Type size={16} className="text-purple-400" />
      default: return <Camera size={16} className="text-emerald-400" />
    }
  }

  return (
    <Layout title="Script Editor" rightPanel={intelligencePanel}>
      <div className="max-w-4xl mx-auto py-6">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-1">
              <span>Scene 1</span> <ChevronRight size={14} /> <span>The Floating City</span>
            </div>
            <h1 className="text-3xl font-bold font-['Fredoka',sans-serif] text-white">Panel Script</h1>
          </div>
          
          <button 
            onClick={() => navigate('/generation-preview')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            <Play size={18} fill="currentColor" /> Generate Comic
          </button>
        </div>

        <div className="space-y-6 pb-20">
          {panels.map((panel, idx) => (
            <motion.div 
              key={panel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#131318] border border-[#2a2a30] rounded-xl overflow-hidden focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all"
            >
              <div className="bg-[#1a1a20] border-b border-[#2a2a30] px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-500">#{idx + 1}</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0d0d12] rounded text-xs font-medium capitalize text-gray-300">
                    {getIcon(panel.type)} {panel.type}
                  </div>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Content Side */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {panel.type === 'dialogue' ? `Dialogue: ${panel.character}` : 'Content'}
                  </label>
                  <textarea 
                    className="w-full bg-[#0d0d12] border border-[#2a2a30] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 resize-none"
                    rows={3}
                    defaultValue={panel.content}
                  />
                </div>
                
                {/* Art Direction Side */}
                <div>
                  <label className="block text-xs font-semibold text-indigo-500/80 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Camera size={12} /> Art Direction (Prompt)
                  </label>
                  <textarea 
                    className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3 text-sm text-indigo-100 focus:outline-none focus:border-indigo-500 resize-none"
                    rows={3}
                    defaultValue={panel.artDirection}
                  />
                </div>
              </div>
            </motion.div>
          ))}

          <button className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#2a2a30] hover:border-gray-500 hover:bg-[#1a1a20] text-gray-400 py-6 rounded-xl font-medium transition-all">
            <Plus size={20} /> Add Panel
          </button>
        </div>
      </div>
    </Layout>
  )
}
