import React, { useState, useRef, useCallback, useEffect } from "react";
import { Cropper } from "react-cropper";
import { jsPDF } from "jspdf";
import "react-cropper/node_modules/cropperjs/dist/cropper.css";
import { validateFile } from "../utils/fileValidation.js";
import {
  MAX_FILE_SIZE_MB,
  ACCEPT_FILE_EXTENSIONS,
  ACCEPT_IMAGE_TYPES,
} from "../utils/fileConfig.js";

/**
 * MultiFileScanner Component
 * Supports multi-page document scanning with crop/rotate and auto-PDF conversion
 */
export function MultiFileScanner({
  onFilesChange,
  onPDFGenerated,
  maxTotalSizeMB = 10,
  className = "",
}) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const cropperRef = useRef(null);

  // Pages array - each page has: { id, file, preview, croppedBlob, rotation }
  const [pages, setPages] = useState([]);
  
  // Store cropped blob URLs to prevent memory leaks
  const [croppedUrls, setCroppedUrls] = useState({});
  
  // Total size tracking
  const [totalSize, setTotalSize] = useState(0);
  
  // Crop modal state
  const [cropState, setCropState] = useState({
    isOpen: false,
    pageId: null,
    imageSrc: null,
    rotation: 0,
  });

  // Error state
  const [error, setError] = useState(null);

  // Store all created URLs for cleanup
  const allUrlsRef = useRef(new Set());

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      allUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Generate unique ID
  const generateId = () => `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Calculate total size
  const calculateTotalSize = (pageList) => {
    return pageList.reduce((sum, page) => sum + (page.file?.size || 0), 0);
  };

  // Add new page
  const addPage = async (file) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Check total size limit
    const newSize = totalSize + file.size;
    const maxBytes = maxTotalSizeMB * 1024 * 1024;
    if (newSize > maxBytes) {
      setError(`Total file size would exceed ${maxTotalSizeMB}MB limit`);
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    allUrlsRef.current.add(preview);
    
    const newPage = {
      id: generateId(),
      file,
      preview,
      croppedBlob: null,
      rotation: 0,
    };

    const newPages = [...pages, newPage];
    setPages(newPages);
    setTotalSize(calculateTotalSize(newPages));
    setError(null);

    // Notify parent
    onFilesChange?.(newPages);
  };

  // Remove page
  const removePage = (pageId) => {
    const page = pages.find((p) => p.id === pageId);
    if (page) {
      URL.revokeObjectURL(page.preview);
      allUrlsRef.current.delete(page.preview);
    }
    // Cleanup cropped URL if exists
    if (croppedUrls[pageId]) {
      URL.revokeObjectURL(croppedUrls[pageId]);
      allUrlsRef.current.delete(croppedUrls[pageId]);
      setCroppedUrls((prev) => {
        const newUrls = { ...prev };
        delete newUrls[pageId];
        return newUrls;
      });
    }
    const newPages = pages.filter((p) => p.id !== pageId);
    setPages(newPages);
    setTotalSize(calculateTotalSize(newPages));
    onFilesChange?.(newPages);
  };

  // Reorder pages
  const movePage = (pageId, direction) => {
    const index = pages.findIndex((p) => p.id === pageId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pages.length) return;

    const newPages = [...pages];
    [newPages[index], newPages[newIndex]] = [newPages[newIndex], newPages[index]];
    setPages(newPages);
    onFilesChange?.(newPages);
  };

  // Open crop modal
  const openCropModal = (pageId) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;

    setCropState({
      isOpen: true,
      pageId,
      imageSrc: page.preview,
      rotation: page.rotation,
    });
  };

  // Close crop modal
  const closeCropModal = () => {
    setCropState({
      isOpen: false,
      pageId: null,
      imageSrc: null,
      rotation: 0,
    });
  };

  // Apply crop
  const applyCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || !cropState.pageId) return;

    // Get cropped canvas
    const canvas = cropper.getCroppedCanvas({
      width: 1200,
      height: 1600,
      fillColor: "#fff",
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    if (!canvas) return;

    // Convert to blob
    canvas.toBlob((blob) => {
      if (!blob) return;

      // Revoke old cropped URL if exists
      if (croppedUrls[cropState.pageId]) {
        URL.revokeObjectURL(croppedUrls[cropState.pageId]);
        allUrlsRef.current.delete(croppedUrls[cropState.pageId]);
      }

      // Create new URL and store it
      const newUrl = URL.createObjectURL(blob);
      allUrlsRef.current.add(newUrl);
      setCroppedUrls((prev) => ({ ...prev, [cropState.pageId]: newUrl }));

      const newPages = pages.map((p) =>
        p.id === cropState.pageId
          ? { ...p, croppedBlob: blob, rotation: cropState.rotation }
          : p
      );
      setPages(newPages);
      closeCropModal();
    }, "image/jpeg", 0.9);
  };

  // Rotate in crop modal
  const rotate = (degrees) => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    cropper.rotate(degrees);
    setCropState((prev) => ({ ...prev, rotation: prev.rotation + degrees }));
  };

  // Reset crop
  const resetCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    cropper.reset();
    setCropState((prev) => ({ ...prev, rotation: 0 }));
  };

  // Generate PDF from all pages
  const generatePDF = async () => {
    if (pages.length === 0) {
      setError("No pages to convert");
      return;
    }

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        // Use cropped blob if available, otherwise original file
        const blob = page.croppedBlob || page.file;
        const imageData = await blobToDataURL(blob);

        // Add new page for all pages except first
        if (i > 0) {
          pdf.addPage();
        }

        // Calculate dimensions to fit A4
        const img = await loadImage(imageData);
        const imgRatio = img.width / img.height;
        const pageRatio = pageWidth / pageHeight;

        let finalWidth, finalHeight, x, y;
        if (imgRatio > pageRatio) {
          finalWidth = pageWidth;
          finalHeight = pageWidth / imgRatio;
          x = 0;
          y = (pageHeight - finalHeight) / 2;
        } else {
          finalHeight = pageHeight;
          finalWidth = pageHeight * imgRatio;
          x = (pageWidth - finalWidth) / 2;
          y = 0;
        }

        pdf.addImage(imageData, "JPEG", x, y, finalWidth, finalHeight);
      }

      const pdfBlob = pdf.output("blob");
      onPDFGenerated?.(pdfBlob, `scanned_document_${Date.now()}.pdf`);
      
      return pdfBlob;
    } catch (err) {
      setError("Failed to generate PDF: " + err.message);
      return null;
    }
  };

  // Helper: Blob to Data URL
  const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Helper: Load image
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Handle file select
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      addPage(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle camera capture
  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      addPage(file);
    }
    // Reset input
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_FILE_EXTENSIONS}
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept={ACCEPT_IMAGE_TYPES}
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Upload buttons - only show if under limit */}
      {totalSize < maxTotalSizeMB * 1024 * 1024 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-950 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Choose File
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-navy-900 text-navy-900 rounded-lg font-medium hover:bg-navy-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Open Camera
          </button>
        </div>
      )}

      {/* Size indicator */}
      <div className="text-sm text-gray-600">
        Total size: {(totalSize / 1024 / 1024).toFixed(2)} MB / {maxTotalSizeMB} MB
        <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
          <div
            className="h-full bg-navy-600 rounded-full transition-all"
            style={{
              width: `${Math.min((totalSize / (maxTotalSizeMB * 1024 * 1024)) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Pages list */}
      {pages.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Scanned Pages ({pages.length})</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className="relative group bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Page number badge */}
                <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-navy-900 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Image preview */}
                <div className="aspect-[3/4] bg-gray-100">
                  <img
                    src={croppedUrls[page.id] || page.preview}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* Crop button */}
                  <button
                    onClick={() => openCropModal(page.id)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    title="Crop/Rotate"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 10h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>

                  {/* Move up */}
                  {index > 0 && (
                    <button
                      onClick={() => movePage(page.id, "up")}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100"
                      title="Move up"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Move down */}
                  {index < pages.length - 1 && (
                    <button
                      onClick={() => movePage(page.id, "down")}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100"
                      title="Move down"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => removePage(page.id)}
                    className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                    title="Remove"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Generate PDF button */}
          <button
            type="button"
            onClick={generatePDF}
            className="w-full py-3 bg-amber-100 text-amber-800 rounded-xl font-semibold hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Convert to PDF ({pages.length} page{pages.length !== 1 ? "s" : ""})
          </button>
        </div>
      )}

      {/* Crop Modal */}
      {cropState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Crop & Rotate</h3>
              <button
                onClick={closeCropModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cropper */}
            <div className="flex-1 p-4 bg-gray-100 overflow-auto">
              <Cropper
                ref={cropperRef}
                src={cropState.imageSrc}
                style={{ height: 400, width: "100%" }}
                aspectRatio={3 / 4}
                guides={true}
                viewMode={1}
                dragMode="crop"
                scalable={true}
                zoomable={true}
                rotatable={true}
              />
            </div>

            {/* Toolbar */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => rotate(-90)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                >
                  ↺ Rotate Left
                </button>
                <button
                  type="button"
                  onClick={() => rotate(90)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                >
                  ↻ Rotate Right
                </button>
                <button
                  type="button"
                  onClick={resetCrop}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={closeCropModal}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="flex-1 px-4 py-3 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-950"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiFileScanner;
