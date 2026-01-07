"use client"

import { useState, useEffect } from "react"
import { Search, Filter, FileText, Play, Download, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { toast } from "sonner"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import PDFViewer from "@/components/PDFViewer"
import Axios from "@/utils/Axios"

interface Resource {
  _id: string
  title: string
  description: string
  type: 'pdf' | 'video'
  url: string
  thumbnailUrl?: string
  isActive: boolean
  createdAt: string
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'video'>('all')
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadResources = async () => {
    setLoading(true)
    try {
      const response = await Axios.get(`/resources?page=${page}&limit=10`)
      // Backend now returns object with resources and pagination
      if (response.data.pagination) {
        setResources(response.data.resources)
        setTotalPages(response.data.pagination.totalPages)
      } else {
        // Fallback for backward compatibility if backend not yet deployed
        setResources(response.data.resources || response.data)
      }
    } catch (error: any) {
      console.error('Error loading resources:', error)
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        toast.error('Backend server is not running. Please start the server.')
      } else {
        toast.error('Failed to load resources')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [page]) // Reload when page changes

  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchTerm || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || resource.type === filterType
    
    return matchesSearch && matchesType
  })

  const handleDownload = (resource: Resource) => {
    const link = document.createElement('a')
    link.href = resource.url
    link.download = `${resource.title}.${resource.type === 'pdf' ? 'pdf' : 'mp4'}`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Downloading ${resource.title}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading resources...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="bg-white border-l-4 border-blue-600 shadow-sm p-4 md:p-6 mb-4 md:mb-8">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Learning Resources</h1>
              <p className="text-sm md:text-base text-gray-600">Access study materials, PDFs, and video content</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative order-2 md:order-1">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2 order-1 md:order-2 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 md:hidden" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full md:w-auto pl-9 md:pl-3 pr-8 md:pr-8 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 appearance-none bg-white"
                  style={{ backgroundImage: 'none' }} 
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDFs</option>
                  <option value="video">Videos</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="bg-white rounded-lg border shadow-sm">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No resources found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter' 
                  : 'Resources will appear here when available'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Changed grid-cols-1 to grid-cols-2 for mobile */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-4 md:p-6">
                {filteredResources.map((resource) => (
                  <div key={resource._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative h-32 md:h-48 bg-gray-100 flex-shrink-0">
                      {resource.thumbnailUrl ? (
                        <img 
                          src={resource.thumbnailUrl} 
                          alt={resource.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      
                      <div 
                        className="absolute inset-0 bg-gray-50 flex items-center justify-center"
                        style={{ display: resource.thumbnailUrl ? 'none' : 'flex' }}
                      >
                        <div className="text-center">
                          {resource.type === 'pdf' ? (
                            <FileText className="w-8 h-8 md:w-12 md:h-12 text-red-600 mx-auto mb-1 md:mb-2" />
                          ) : (
                            <Play className="w-8 h-8 md:w-12 md:h-12 text-blue-600 mx-auto mb-1 md:mb-2" />
                          )}
                          <p className="text-xs md:text-sm text-gray-600 mb-1 hidden md:block">
                            {resource.type === 'pdf' ? 'PDF Document' : 'Video Content'}
                          </p>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                          resource.type === 'pdf' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {resource.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-2 md:p-4 flex flex-col flex-grow">
                      <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1 line-clamp-2 md:min-h-[2.5rem] leading-tight">{resource.title}</h3>
                      <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2 flex-grow hidden md:block">{resource.description}</p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] md:text-xs text-gray-500">
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 mt-auto">
                        <button 
                          onClick={() => setSelectedResource(resource)}
                          className="flex-1 bg-blue-600 text-white text-xs md:text-sm font-medium py-1.5 px-2 md:py-2 md:px-3 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 h-8 md:h-10"
                        >
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden md:inline">View</span>
                        </button>
                        <button 
                          onClick={() => handleDownload(resource)}
                          className="flex-1 text-gray-600 hover:text-gray-800 text-xs md:text-sm font-medium py-1.5 px-2 md:py-2 md:px-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 h-8 md:h-10"
                        >
                          <Download className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden md:inline">Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="p-2 md:px-3 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center min-w-[32px] md:min-w-[40px]"
                    title="First Page"
                  >
                    <span className="hidden md:inline">First</span>
                    <span className="md:hidden"><ChevronsLeft className="w-4 h-4" /></span>
                  </button>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 md:px-3 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center min-w-[32px] md:min-w-[40px]"
                    title="Previous Page"
                  >
                    <span className="hidden md:inline">Previous</span>
                    <span className="md:hidden"><ChevronLeft className="w-4 h-4" /></span>
                  </button>
                  
                  <span className="text-sm text-gray-700 px-2 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 md:px-3 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center min-w-[32px] md:min-w-[40px]"
                    title="Next Page"
                  >
                    <span className="hidden md:inline">Next</span>
                    <span className="md:hidden"><ChevronRight className="w-4 h-4" /></span>
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="p-2 md:px-3 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center min-w-[32px] md:min-w-[40px]"
                    title="Last Page"
                  >
                    <span className="hidden md:inline">Last</span>
                    <span className="md:hidden"><ChevronsRight className="w-4 h-4" /></span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 md:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg w-full md:max-w-6xl h-[90vh] md:h-5/6 flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 bg-white">
              <div className="pr-4">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 line-clamp-1">{selectedResource.title}</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">{selectedResource.type.toUpperCase()} Resource</p>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 relative bg-gray-100 overflow-hidden">
              {selectedResource.type === 'pdf' ? (
                <PDFViewer 
                  url={selectedResource.url}
                  title={selectedResource.title}
                  showDownload={true}
                  showExternal={true}
                  className="h-full w-full"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-black">
                  <video 
                    controls 
                    className="max-w-full max-h-full w-full"
                    src={selectedResource.url}
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                  <p className="text-sm text-gray-700 line-clamp-2 md:line-clamp-none">{selectedResource.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Added on {new Date(selectedResource.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => handleDownload(selectedResource)}
                    className="w-full md:w-auto bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}