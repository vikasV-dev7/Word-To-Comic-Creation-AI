import { useState } from 'react'
import { motion } from 'framer-motion'
import { GripVertical, Clock, MapPin, Plus, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

export default function Scenes() {
  const navigate = useNavigate()
  const [scenes, setScenes] = useState([
    { id: '1', location: 'The Floating City', time: 'Dusk', description: 'Elias arrives at the gates, exhausted.', panels: 4 },
    { id: '2', location: 'Throne Room', time: 'Night', description: 'A tense confrontation with Lyra.', panels: 6 },
    { id: '3', location: 'City Streets', time: 'Midnight', description: 'Elias escapes through the lower levels.', panels: 5 },
  ])

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  const intelligencePanel = (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Pacing Analysis</h3>
      
      <div className="bg-[#131318] border border-[#2a2a30] rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Total Scenes</span>
          <span className="text-sm font-bold text-white">{scenes.length}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Est. Panels</span>
          <span className="text-sm font-bold text-indigo-400">
            {scenes.reduce((acc, s) => acc + s.panels, 0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Est. Pages</span>
          <span className="text-sm font-bold text-emerald-400">
            {Math.ceil(scenes.reduce((acc, s) => acc + s.panels, 0) / 5)}
          </span>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 leading-relaxed">
        The Scene Segmentation AI broke the narrative into {scenes.length} logical locations.
        Drag and drop scenes to reorder the timeline.
      </p>
    </div>
  )

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (index: number) => {
    if (draggedIdx === null || draggedIdx === index) return
    const items = [...scenes]
    const draggedItem = items[draggedIdx]
    items.splice(draggedIdx, 1)
    items.splice(index, 0, draggedItem)
    setDraggedIdx(index)
    setScenes(items)
  }

  return (
    <Layout title="Scene Timeline" rightPanel={intelligencePanel}>
      <div className="max-w-4xl mx-auto py-6">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-['Fredoka',sans-serif] text-white">Timeline</h1>
            <p className="text-gray-400 mt-1">Reorder or edit the sequence of events.</p>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[#131318] border border-[#2a2a30] hover:bg-[#1a1a20] text-gray-300 py-2.5 px-4 rounded-lg font-medium transition-colors">
              <Plus size={18} /> New Scene
            </button>
            <button 
              onClick={() => navigate('/script-editor')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-lg font-medium transition-colors"
            >
              Continue to Script <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[28px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-indigo-500/10 before:to-transparent">
          {scenes.map((scene, idx) => (
            <motion.div
              key={scene.id}
              layout
              draggable
              onDragStart={(e: any) => handleDragStart(e, idx)}
              onDragOver={(e: any) => { e.preventDefault(); handleDragOver(idx) }}
              onDragEnd={() => setDraggedIdx(null)}
              className={`flex gap-4 relative z-10 ${draggedIdx === idx ? 'opacity-50' : 'opacity-100'}`}
            >
              <div className="w-14 h-14 rounded-full bg-[#131318] border-2 border-[#2a2a30] flex flex-col items-center justify-center shrink-0 shadow-lg">
                <span className="text-xs font-bold text-gray-500">SCENE</span>
                <span className="text-sm font-black text-white">{idx + 1}</span>
              </div>
              
              <div className="flex-1 bg-[#131318] border border-[#2a2a30] hover:border-gray-600 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-colors flex items-center gap-4">
                <GripVertical className="text-gray-600 shrink-0" size={20} />
                
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-bold text-lg text-white flex items-center gap-1.5">
                      <MapPin size={16} className="text-purple-400" /> {scene.location}
                    </h3>
                    <span className="text-sm text-gray-400 flex items-center gap-1.5">
                      <Clock size={14} className="text-blue-400" /> {scene.time}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{scene.description}</p>
                </div>

                <div className="shrink-0 text-center px-4 border-l border-[#2a2a30]">
                  <span className="block text-2xl font-bold text-indigo-400">{scene.panels}</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Panels</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
