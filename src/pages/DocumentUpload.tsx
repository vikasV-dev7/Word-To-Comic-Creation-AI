import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import Layout from '../components/Layout'

export default function DocumentUpload() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project')
  
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'extracting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const validateAndSetFile = (f: File) => {
    const validExtensions = ['.pdf', '.txt', '.docx']
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase()
    
    if (validExtensions.includes(ext)) {
      setFile(f)
      setErrorMsg('')
    } else {
      setErrorMsg('Unsupported file type. Please upload PDF, TXT, or DOCX.')
    }
  }

  const handleProcessFile = async () => {
    if (!file) return
    setUploadState('uploading')

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Fake delay for UI polish (uploading phase)
      await new Promise(r => setTimeout(r, 800))
      setUploadState('extracting')

      const response = await fetch('http://localhost:8000/api/documents/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      
      setUploadState('success')
      
      // Auto-navigate after a brief success message
      setTimeout(() => {
        navigate('/story-review', { state: { 
          filename: file.name, 
          extractedText: data.extracted_text,
          projectId
        }})
      }, 1000)

    } catch (err) {
      console.error(err)
      setUploadState('error')
      setErrorMsg('Failed to process document. Make sure the backend is running.')
    }
  }

  const uploadPanel = (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Ingestion Workflow</h3>
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#2a2a30] before:to-transparent">
        
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-indigo-500 bg-indigo-500/20 text-indigo-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>
          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded-lg border border-[#2a2a30] bg-[#131318]">
            <p className="text-sm font-medium text-white">Upload Document</p>
          </div>
        </div>

        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full border shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${uploadState === 'extracting' || uploadState === 'success' ? 'border-indigo-500 bg-indigo-500/20' : 'border-[#2a2a30] bg-[#0d0d12]'}`}>
            <span className={`w-2 h-2 rounded-full ${uploadState === 'extracting' || uploadState === 'success' ? 'bg-indigo-500' : 'bg-gray-600'}`}></span>
          </div>
          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded-lg border border-[#2a2a30] bg-[#131318] opacity-60">
            <p className="text-sm font-medium text-gray-300">Extract Text & OCR</p>
          </div>
        </div>

        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#2a2a30] bg-[#0d0d12] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <span className="w-2 h-2 rounded-full bg-gray-600"></span>
          </div>
          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded-lg border border-[#2a2a30] bg-[#131318] opacity-60">
            <p className="text-sm font-medium text-gray-300">Intelligent Parse</p>
          </div>
        </div>

      </div>
    </div>
  )

  return (
    <Layout title="Upload Story" rightPanel={uploadPanel}>
      <div className="max-w-3xl mx-auto py-10">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-['Fredoka',sans-serif] mb-3">Upload your Story</h2>
          <p className="text-gray-400">Supported formats: PDF, DOCX, TXT (Max 50MB)</p>
        </div>

        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => uploadState === 'idle' || uploadState === 'error' ? fileInputRef.current?.click() : null}
          className={`
            border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer relative overflow-hidden
            ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-[#2a2a30] bg-[#131318] hover:border-gray-600 hover:bg-[#1a1a20]'}
            ${(uploadState === 'uploading' || uploadState === 'extracting') ? 'pointer-events-none' : ''}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files?.length && validateAndSetFile(e.target.files[0])} 
            style={{ display: 'none' }} 
            accept=".pdf,.txt,.docx"
          />
          
          <AnimatePresence mode="wait">
            {uploadState === 'idle' || uploadState === 'error' ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mb-2">
                  <UploadCloud size={40} />
                </div>
                {file ? (
                  <>
                    <h3 className="text-xl font-semibold text-white">{file.name}</h3>
                    <p className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-200">Drag & drop your file here</h3>
                    <p className="text-gray-500">or click to browse from your computer</p>
                  </>
                )}
              </motion.div>
            ) : uploadState === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-4 text-emerald-400"
              >
                <CheckCircle2 size={64} />
                <h3 className="text-xl font-semibold text-white">Upload Complete</h3>
                <p className="text-emerald-500">Redirecting to analysis...</p>
              </motion.div>
            ) : (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-6"
              >
                <Loader2 size={48} className="animate-spin text-indigo-500" />
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white">
                    {uploadState === 'uploading' ? 'Uploading...' : 'Extracting Text...'}
                  </h3>
                  <p className="text-gray-400 mt-2 text-sm max-w-sm">
                    {uploadState === 'extracting' ? 'Running OCR and extracting content structures...' : 'Sending securely to Story Engine...'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {errorMsg && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button 
            disabled={!file || uploadState !== 'idle'}
            onClick={handleProcessFile}
            className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 py-3 px-8 rounded-lg font-semibold transition-all disabled:opacity-30"
          >
            {uploadState === 'idle' ? 'Start Processing' : 'Processing...'}
          </button>
        </div>

      </div>
    </Layout>
  )
}
