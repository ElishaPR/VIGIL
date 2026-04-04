import { useState } from 'react'
import FileUploader from './components/FileUploader'

export default function App() {
  const [fileData, setFileData] = useState(null)

  const handleFileChange = (data) => {
    setFileData(data)
    // data is { file: File, title: string } or null when removed
    console.log('FileUploader output:', data)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">

        <h1 className="text-base font-semibold text-slate-800 mb-1">Upload Document</h1>
        <p className="text-xs text-slate-400 mb-5">
          Attach a file and confirm the document title before saving.
        </p>

        <FileUploader onChange={handleFileChange} />

        {/* Example: show what the parent receives */}
        {fileData && (
          <div className="mt-5 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Component output
            </p>
            <p className="text-xs text-slate-600">
              <span className="font-medium text-slate-700">Title: </span>
              {fileData.title}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              <span className="font-medium text-slate-700">File: </span>
              {fileData.file.name}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              <span className="font-medium text-slate-700">Type: </span>
              {fileData.file.type}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
