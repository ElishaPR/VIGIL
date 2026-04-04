import { useState, useRef, useCallback } from 'react'

const ALLOWED_TYPES = {
  'image/jpeg': { label: 'JPEG', icon: 'image' },
  'image/png': { label: 'PNG', icon: 'image' },
  'image/webp': { label: 'WebP', icon: 'image' },
  'image/heic': { label: 'HEIC', icon: 'image' },
  'application/pdf': { label: 'PDF', icon: 'pdf' },
  'text/plain': { label: 'TXT', icon: 'text' },
  'application/msword': { label: 'DOC', icon: 'doc' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'DOCX', icon: 'doc' },
  'application/vnd.ms-excel': { label: 'XLS', icon: 'sheet' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { label: 'XLSX', icon: 'sheet' },
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function extractTitle(filename) {
  return filename.replace(/\.[^/.]+$/, '')
}

// Icons as inline SVG components
function IconUpload() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function IconPdf() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function IconDoc() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  )
}

function IconSheet() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m13.5-7.5h-7.5" />
    </svg>
  )
}

function IconText() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function IconRefresh() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}

function IconPencil() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function DocTypeIcon({ iconType }) {
  const map = {
    pdf: { Icon: IconPdf, bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100' },
    doc: { Icon: IconDoc, bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100' },
    sheet: { Icon: IconSheet, bg: 'bg-green-50', text: 'text-green-500', border: 'border-green-100' },
    text: { Icon: IconText, bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100' },
    image: { Icon: null, bg: 'bg-violet-50', text: 'text-violet-500', border: 'border-violet-100' },
  }
  const config = map[iconType] || map.text
  return config
}

// ── The main component ──────────────────────────────────────────────────────

export default function FileUploader({ onChange, className = '' }) {
  const [file, setFile] = useState(null)       // raw File object
  const [title, setTitle] = useState('')        // editable doc title
  const [preview, setPreview] = useState(null)  // object URL for images
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState('')

  const inputRef = useRef(null)

  const processFile = useCallback((rawFile) => {
    setError('')

    if (!ALLOWED_TYPES[rawFile.type]) {
      setError(`File type not allowed. Please upload: JPEG, PNG, WebP, HEIC, PDF, TXT, DOC, DOCX, XLS, or XLSX.`)
      return
    }

    if (rawFile.size > MAX_SIZE_BYTES) {
      setError(`File is too large. Maximum allowed size is 10 MB.`)
      return
    }

    // Revoke previous preview URL if any
    if (preview) URL.revokeObjectURL(preview)

    const isImage = ALLOWED_TYPES[rawFile.type]?.icon === 'image'
    const newPreview = isImage ? URL.createObjectURL(rawFile) : null
    const newTitle = extractTitle(rawFile.name)

    setFile(rawFile)
    setPreview(newPreview)
    setTitle(newTitle)
    setTitleInput(newTitle)
    setIsEditingTitle(false)

    onChange?.({ file: rawFile, title: newTitle })
  }, [preview, onChange])

  const handleInputChange = (e) => {
    if (e.target.files?.[0]) processFile(e.target.files[0])
    // reset so same file can be re-selected
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0])
  }

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setTitle('')
    setError('')
    setIsEditingTitle(false)
    onChange?.(null)
  }

  const handleReplace = () => {
    inputRef.current?.click()
  }

  const startEditing = () => {
    setTitleInput(title)
    setIsEditingTitle(true)
  }

  const commitTitle = () => {
    const trimmed = titleInput.trim()
    const newTitle = trimmed || title
    setTitle(newTitle)
    setIsEditingTitle(false)
    onChange?.({ file, title: newTitle })
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') commitTitle()
    if (e.key === 'Escape') setIsEditingTitle(false)
  }

  const typeInfo = file ? ALLOWED_TYPES[file.type] : null
  const docTypeConfig = typeInfo ? DocTypeIcon({ iconType: typeInfo.icon }) : null

  return (
    <div className={`w-full font-sans ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={Object.keys(ALLOWED_TYPES).join(',')}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* ── Empty state / Drop zone ── */}
      {!file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3
            w-full min-h-48 rounded-xl border-2 border-dashed cursor-pointer
            transition-all duration-200 select-none
            ${isDragging
              ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
              : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
            }
          `}
        >
          <div className={`p-3 rounded-full transition-colors duration-200 ${isDragging ? 'bg-indigo-100 text-indigo-500' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
            <IconUpload />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-medium text-slate-700">
              Drop your file here, or{' '}
              <span className="text-indigo-600 hover:text-indigo-700">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              JPEG, PNG, WebP, HEIC, PDF, TXT, DOC, DOCX, XLS, XLSX · Max 10 MB
            </p>
          </div>
        </div>
      )}

      {/* ── Error message ── */}
      {error && (
        <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">
          <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-xs text-red-600 leading-relaxed">{error}</p>
        </div>
      )}

      {/* ── File preview card ── */}
      {file && typeInfo && (
        <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

          {/* Image preview strip */}
          {preview && (
            <div className="w-full h-44 bg-slate-100 overflow-hidden">
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Non-image: icon banner */}
          {!preview && (
            <div className={`w-full h-24 flex items-center justify-center ${docTypeConfig.bg}`}>
              <div className={`p-4 rounded-2xl border ${docTypeConfig.border} bg-white/80 ${docTypeConfig.text}`}>
                <docTypeConfig.Icon />
              </div>
            </div>
          )}

          {/* Info section */}
          <div className="px-4 pt-3 pb-4">

            {/* Editable title */}
            <div className="flex items-center gap-1.5 mb-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <input
                    autoFocus
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    onBlur={commitTitle}
                    className="flex-1 min-w-0 text-sm font-semibold text-slate-800 bg-slate-50 border border-indigo-300 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <button
                    onMouseDown={(e) => { e.preventDefault(); commitTitle() }}
                    className="shrink-0 p-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <IconCheck />
                  </button>
                </div>
              ) : (
                <>
                  <p
                    className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate cursor-text"
                    title={title}
                  >
                    {title}
                  </p>
                  <button
                    onClick={startEditing}
                    className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Edit title"
                  >
                    <IconPencil />
                  </button>
                </>
              )}
            </div>

            {/* File meta */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${docTypeConfig.bg} ${docTypeConfig.text}`}>
                {typeInfo.label}
              </span>
              <span className="text-xs text-slate-400">{formatBytes(file.size)}</span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-400 truncate max-w-[160px]" title={file.name}>
                {file.name}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReplace}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
              >
                <IconRefresh />
                Replace file
              </button>
              <button
                onClick={handleRemove}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-100 text-xs font-medium text-red-500 bg-white hover:bg-red-50 hover:border-red-200 transition-all duration-150"
              >
                <IconTrash />
                Remove file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
