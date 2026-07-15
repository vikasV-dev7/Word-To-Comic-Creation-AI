import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, Plus, User, Tag, Combine } from 'lucide-react'
import Layout from '../components/Layout'

export default function Characters() {
  const [characters] = useState([
    { id: '1', name: 'Elias', gender: 'male', role: 'Protagonist', description: 'A weary traveler looking for answers.', confidence: 95 },
    { id: '2', name: 'Lyra', gender: 'female', role: 'Antagonist', description: 'The mysterious ruler of the floating city.', confidence: 88 },
    { id: '3', name: 'The Wanderer', gender: 'unknown', role: 'Alias', description: 'Could be Elias?', confidence: 45 },
  ])

  const [selectedChars, setSelectedChars] = useState<string[]>([])

  const intelligencePanel = (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Canon Intelligence</h3>
      
      <div className="bg-[#131318] border border-yellow-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Combine size={16} className="text-yellow-500" />
          <span className="text-sm font-bold text-yellow-400">Merge Suggestion</span>
        </div>
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
          The Canon Engine detected high similarity between <strong>Elias</strong> and <strong>The Wanderer</strong>. 
          Should they be merged into a single entity?
        </p>
        <div className="flex gap-2">
          <button className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 py-1.5 rounded text-xs font-medium transition-colors">
            Merge Characters
          </button>
          <button className="flex-1 bg-[#1a1a20] hover:bg-[#2a2a30] text-gray-300 py-1.5 rounded text-xs font-medium transition-colors">
            Ignore
          </button>
        </div>
      </div>
    </div>
  )

  const toggleSelect = (id: string) => {
    setSelectedChars(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    )
  }

  return (
    <Layout title="Character Roster" rightPanel={intelligencePanel}>
      <div className="max-w-5xl mx-auto py-6">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-['Fredoka',sans-serif] text-white">Characters</h1>
            <p className="text-gray-400 mt-1">Manage the cast of your story.</p>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[#131318] border border-[#2a2a30] hover:bg-[#1a1a20] text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors text-sm">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm">
              <Plus size={16} /> Add Character
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#131318] border rounded-xl overflow-hidden transition-all ${selectedChars.includes(char.id) ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-[#2a2a30] hover:border-gray-600'}`}
            >
              <div className="p-5 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <input 
                    type="checkbox" 
                    checked={selectedChars.includes(char.id)}
                    onChange={() => toggleSelect(char.id)}
                    className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-[#1a1a20]"
                  />
                </div>
                
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                  <User size={28} />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  {char.name}
                  {char.confidence < 60 && <span className="w-2 h-2 rounded-full bg-yellow-500" title="Low Confidence" />}
                </h3>
                
                <div className="flex gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#1a1a20] text-gray-400">
                    <Tag size={10} /> {char.role}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#1a1a20] text-gray-400 capitalize">
                    {char.gender}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                  {char.description}
                </p>
                
                <button className="w-full py-2 bg-[#1a1a20] hover:bg-[#2a2a30] rounded-lg text-sm font-medium text-gray-300 transition-colors">
                  Edit Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
