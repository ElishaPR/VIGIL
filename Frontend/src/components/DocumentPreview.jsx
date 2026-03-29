import React, { useState, useEffect } from 'react';

const DocumentPreview = ({ documentUuid, onRemove, showExpiry = false }) => {
  const [documentInfo, setDocumentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocumentInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/documents/${documentUuid}/preview`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setDocumentInfo(data);
        } else {
          setError('Failed to load document info');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    if (documentUuid) {
      fetchDocumentInfo();
    }
  }, [documentUuid]);

  const getFileIcon = (fileIcon) => {
    const icons = {
      pdf: (
        <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,12L12,14L17,9"/>
        </svg>
      ),
      docx: (
        <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12H16V14H8V12M8,16H13V18H8V16Z"/>
        </svg>
      ),
      xlsx: (
        <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12H16V14H8V12M8,16H10V18H8V16M12,16H14V18H12V16M16,16H18V18H16V16Z"/>
        </svg>
      ),
      txt: (
        <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12H16V14H8V12M8,16H13V18H8V16Z"/>
        </svg>
      ),
      image: (
        <svg className="w-12 h-12 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12L10,14L14,10L16,12V16H8V12M9,4A1,1 0 0,1 10,5A1,1 0 0,1 9,6A1,1 0 0,1 8,5A1,1 0 0,1 9,4Z"/>
        </svg>
      ),
      file: (
        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      )
    };

    return icons[fileIcon] || icons.file;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
          </svg>
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* File Icon */}
        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-300 flex-shrink-0 shadow-md bg-white flex items-center justify-center">
          {getFileIcon(documentInfo.file_icon)}
        </div>

        {/* File Info & Actions */}
        <div className="flex-1 min-w-0 w-full">
          <h3 className="font-semibold text-gray-900 truncate text-lg">
            {documentInfo.doc_title}
          </h3>
          
          <div className="mt-1 space-y-1">
            <p className="text-sm text-gray-600">
              {documentInfo.display_name}
            </p>
            
            <p className="text-xs text-gray-500">
              {formatFileSize(documentInfo.doc_size)} • {documentInfo.file_extension?.toUpperCase()}
            </p>
            
            {documentInfo.expiry_date && showExpiry && (
              <p className="text-xs text-amber-600">
                Expires: {new Date(documentInfo.expiry_date).toLocaleDateString()}
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`http://localhost:8000/documents/${documentUuid}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
            
            {onRemove && (
              <button
                onClick={onRemove}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
