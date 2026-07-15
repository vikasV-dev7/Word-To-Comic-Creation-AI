import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { FileText, Wand2, Globe2, AlertTriangle, Users, Map as MapIcon, ArrowRight, Sparkles } from 'lucide-react'
import Layout from '../components/Layout'

export default function StoryReview() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project')
  
  const { filename, extractedText } = location.state || {}

  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  
  useEffect(() => {
    if (!extractedText) {
      navigate('/upload')
      return
    }

    const analyzeText = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/story/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: extractedText })
        })
        const data = await response.json()
        setAnalysisResult(data.analysis_result)
      } catch (err) {
        console.error("Failed to analyze story", err)
      } finally {
        setIsAnalyzing(false)
      }
    }

    analyzeText()
  }, [extractedText, navigate])

  const intelligencePanel = (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Confidence Scores</h3>
      
      {isAnalyzing ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-[#1a1a20] rounded-lg animate-pulse" />)}
        </div>
      ) : analysisResult ? (
        <div className="space-y-4">
          <div className="bg-[#131318] border border-[#2a2a30] rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Narrative Coherence</span>
              <span className="text-sm font-bold text-emerald-400">94%</span>
            </div>
            <div className="w-full bg-[#0d0d12] rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full w-[94%]"></div>
            </div>
          </div>
          
          <div className="bg-[#131318] border border-[#2a2a30] rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Character Extraction</span>
              <span className="text-sm font-bold text-emerald-400">88%</span>
            </div>
            <div className="w-full bg-[#0d0d12] rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full w-[88%]"></div>
            </div>
          </div>
          
          <div className="bg-[#131318] border border-[#2a2a30] rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Scene Boundaries</span>
              <span className="text-sm font-bold text-yellow-400">72%</span>
            </div>
            <div className="w-full bg-[#0d0d12] rounded-full h-1.5">
              <div className="bg-yellow-500 h-1.5 rounded-full w-[72%]"></div>
            </div>
            <div className="flex items-start gap-2 mt-3 text-xs text-yellow-500/80">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>Some scene transitions are ambiguous. Manual review recommended.</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )

  if (isAnalyzing) {
    return (
      <Layout title="Story Review" rightPanel={intelligencePanel}>
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={32} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold font-['Fredoka',sans-serif] text-white">Analyzing Intelligence</h2>
            <p className="text-gray-400 mt-2">Extracting canon, characters, and scenes from {filename}...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!analysisResult) {
    return (
      <Layout title="Story Review">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white">Analysis Failed</h2>
          <p className="text-gray-400 mb-6">We couldn't extract the story elements. Please try again.</p>
          <button onClick={() => navigate('/upload')} className="bg-indigo-600 px-6 py-2 rounded-lg text-white font-medium hover:bg-indigo-700">
            Back to Upload
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Story Review" rightPanel={intelligencePanel}>
      <div className="max-w-4xl mx-auto pb-20">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-['Fredoka',sans-serif] mb-2 text-white">Story Structure</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
              <span className="flex items-center gap-1.5"><FileText size={16} /> {filename}</span>
              <span className="flex items-center gap-1.5"><Globe2 size={16} /> {analysisResult.detected_language || 'English'}</span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate(`/scenes?project=${projectId}`)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-lg font-medium transition-colors"
          >
            Confirm & Continue <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          
          {/* Summary Card */}
          <div className="bg-[#131318] border border-[#2a2a30] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a30] bg-[#1a1a20] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 size={18} className="text-indigo-400" />
                <h3 className="font-semibold text-white">Synopsis</h3>
              </div>
              <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-full transition-colors">
                <Sparkles size={12} /> Auto-Revise
              </button>
            </div>
            <div className="p-6">
              <textarea 
                className="w-full bg-transparent border-none outline-none text-gray-300 resize-none leading-relaxed"
                rows={4}
                value={analysisResult.summary}
                onChange={(e) => setAnalysisResult({...analysisResult, summary: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Characters Overview */}
            <div className="bg-[#131318] border border-[#2a2a30] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a30] bg-[#1a1a20] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-emerald-400" />
                  <h3 className="font-semibold text-white">Extracted Characters</h3>
                </div>
                <span className="text-xs bg-[#2a2a30] text-gray-300 px-2 py-1 rounded-full">{analysisResult.characters?.length || 0} Found</span>
              </div>
              <div className="p-2 divide-y divide-[#2a2a30]">
                {analysisResult.characters?.map((c: any, i: number) => (
                  <div key={i} className="p-3 hover:bg-[#1a1a20] rounded-lg transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-200">{c.name}</h4>
                      <span className="text-xs text-gray-500 capitalize">{c.gender}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenes Overview */}
            <div className="bg-[#131318] border border-[#2a2a30] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a30] bg-[#1a1a20] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapIcon size={18} className="text-purple-400" />
                  <h3 className="font-semibold text-white">Discovered Scenes</h3>
                </div>
                <span className="text-xs bg-[#2a2a30] text-gray-300 px-2 py-1 rounded-full">{analysisResult.scenes?.length || 0} Found</span>
              </div>
              <div className="p-2 divide-y divide-[#2a2a30]">
                {analysisResult.scenes?.map((s: any, i: number) => (
                  <div key={i} className="p-3 hover:bg-[#1a1a20] rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">{i+1}</span>
                        {s.location}
                      </h4>
                      <span className="text-xs text-gray-500">{s.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  )
}
