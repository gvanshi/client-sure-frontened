"use client"

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Download, ExternalLink, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF.js worker using unpkg CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`


interface BasicPDFViewerProps {
  url: string
  title: string
  resourceId?: string
  showDownload?: boolean
  showExternal?: boolean
  className?: string
}

export default function BasicPDFViewer({
  url,
  title,
  resourceId,
  showDownload = true,
  showExternal = true,
  className = ""
}: BasicPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Check if URL is valid
  const isValidUrl = url && url !== 'null' && url.trim() !== ''

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(false)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error)
    setLoading(false)
    setError(true)
  }

  const downloadPDF = async () => {
    try {
      if (resourceId) {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:5000/api/resources/${resourceId}/download`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`Download failed: ${response.status}`)
        }

        const blob = await response.blob()
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${title}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
      } else {
        // Direct download from URL
        window.open(url, '_blank')
      }
    } catch (error) {
      console.error('Download failed:', error)
      window.open(url, '_blank')
    }
  }

  const openExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1))
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-red-600" />
          <div>
            <span className="text-sm font-medium text-gray-700">PDF Document</span>
            <div className="text-xs text-gray-500">{title}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {numPages && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border rounded">
                {pageNumber} / {numPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="p-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {showExternal && (
            <button
              onClick={openExternal}
              className="p-2 rounded-lg bg-white border hover:bg-gray-50"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          {showDownload && (
            <button
              onClick={downloadPDF}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className="p-4 bg-gray-100 min-h-[600px] flex items-center justify-center overflow-auto">
        {!isValidUrl ? (
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">PDF Not Available</h3>
            <p className="text-gray-600 mb-6">PDF URL is not available. Please contact support.</p>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Failed to Load PDF</h3>
            <p className="text-gray-600 mb-6">Unable to display this PDF. Try downloading or opening in a new tab.</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left max-w-md mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Common Issues:</strong><br />
                • PDF may be password protected<br />
                • File might be corrupted or invalid<br />
                • Browser security blocking content<br />
                • Cloudinary URL access restrictions<br />
                <strong>Solution:</strong> Try downloading the file or opening in a new tab
              </p>
            </div>
            <div className="space-y-3 max-w-md mx-auto">
              {showExternal && (
                <button
                  onClick={openExternal}
                  className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Open PDF in New Tab
                </button>
              )}
              {showDownload && (
                <button
                  onClick={downloadPDF}
                  className="block w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Download PDF
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-inner">
            {loading && (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading PDF...</p>
                </div>
              </div>
            )}
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <Page
                pageNumber={pageNumber}
                width={800}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  )
}