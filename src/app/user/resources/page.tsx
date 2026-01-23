"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  FileText,
  Play,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PDFViewer from "@/components/PDFViewer";
import VideoViewer from "@/components/VideoViewer";
import ResourceModal from "@/components/ResourceModal";
import Axios from "@/utils/Axios";

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: "pdf" | "video";
  url: string;
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: string;
  isAccessedByUser: boolean;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pdf" | "video">("all");
  const [accessFilter, setAccessFilter] = useState<
    "all" | "accessed" | "unaccessed"
  >("all");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadResources = async () => {
    setLoading(true);
    try {
      const response = await Axios.get(`/resources?page=${page}&limit=10`);
      // Backend now returns object with resources and pagination
      if (response.data.pagination) {
        setResources(response.data.resources);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        // Fallback for backward compatibility if backend not yet deployed
        setResources(response.data.resources || response.data);
      }
    } catch (error: any) {
      console.error("Error loading resources:", error);
      if (error.code === "ECONNABORTED" || error.message === "Network Error") {
        toast.error("Backend server is not running. Please start the server.");
      } else {
        toast.error("Failed to load resources");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [page]); // Reload when page changes

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      !searchTerm ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || resource.type === filterType;

    const matchesAccess =
      accessFilter === "all" ||
      (accessFilter === "accessed" && resource.isAccessedByUser) ||
      (accessFilter === "unaccessed" && !resource.isAccessedByUser);

    return matchesSearch && matchesType && matchesAccess;
  });

  const handleUnlock = async (resource: Resource) => {
    if (unlockingId) return;

    try {
      setUnlockingId(resource._id);
      const response = await Axios.post(`/auth/access/${resource._id}`);

      toast.success("Resource unlocked successfully!");

      // Update local state to mark as accessed
      setResources((prev) =>
        prev.map((r) =>
          r._id === resource._id
            ? { ...r, isAccessedByUser: true, url: response.data.resource.url }
            : r,
        ),
      );
    } catch (error: any) {
      console.error("Error unlocking resource:", error);
      toast.error(error.response?.data?.error || "Failed to unlock resource");
    } finally {
      setUnlockingId(null);
    }
  };

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
    );
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Learning Resources
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Access study materials, PDFs, and video content
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-black"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {/* Type Filter */}
              <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filterType === "all"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setFilterType("pdf")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filterType === "pdf"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  PDFs
                </button>
                <button
                  onClick={() => setFilterType("video")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filterType === "video"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Videos
                </button>
              </div>

              {/* Access Filter */}
              <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setAccessFilter("all")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    accessFilter === "all"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Any Status
                </button>
                <button
                  onClick={() => setAccessFilter("accessed")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    accessFilter === "accessed"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Accessed
                </button>
                <button
                  onClick={() => setAccessFilter("unaccessed")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    accessFilter === "unaccessed"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Unaccessed
                </button>
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
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filter"
                  : "Resources will appear here when available"}
              </p>
            </div>
          ) : (
            <>
              {/* Changed grid-cols-1 to grid-cols-2 for mobile */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-4 md:p-6">
                {filteredResources.map((resource) => (
                  <div
                    key={resource._id}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col relative"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-32 md:h-48 bg-gray-100 flex-shrink-0">
                      {/* Lock Overlay */}
                      {!resource.isAccessedByUser && (
                        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                          <div className="bg-white/90 p-3 rounded-full shadow-lg">
                            <span className="text-2xl">🔒</span>
                          </div>
                        </div>
                      )}

                      {resource.thumbnailUrl ? (
                        <img
                          src={resource.thumbnailUrl}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextElementSibling) {
                              (
                                e.currentTarget
                                  .nextElementSibling as HTMLElement
                              ).style.display = "flex";
                            }
                          }}
                        />
                      ) : null}

                      <div
                        className="absolute inset-0 bg-gray-50 flex items-center justify-center"
                        style={{
                          display: resource.thumbnailUrl ? "none" : "flex",
                        }}
                      >
                        <div className="text-center">
                          {resource.type === "pdf" ? (
                            <FileText className="w-8 h-8 md:w-12 md:h-12 text-red-600 mx-auto mb-1 md:mb-2" />
                          ) : (
                            <Play className="w-8 h-8 md:w-12 md:h-12 text-blue-600 mx-auto mb-1 md:mb-2" />
                          )}
                          <p className="text-xs md:text-sm text-gray-600 mb-1 hidden md:block">
                            {resource.type === "pdf"
                              ? "PDF Document"
                              : "Video Content"}
                          </p>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="absolute top-2 left-2 z-20">
                        <span
                          className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-medium shadow-sm ${
                            resource.type === "pdf"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {resource.type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2 md:p-4 flex flex-col flex-grow">
                      <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1 line-clamp-2 md:min-h-[2.5rem] leading-tight">
                        {resource.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2 flex-grow hidden md:block">
                        {resource.description}
                      </p>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] md:text-xs text-gray-500">
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        {!resource.isAccessedByUser ? (
                          <button
                            onClick={() => handleUnlock(resource)}
                            disabled={unlockingId === resource._id}
                            className="flex-1 bg-gray-900 text-white text-xs md:text-sm font-medium py-1.5 px-2 md:py-2 md:px-3 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5 h-8 md:h-10 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {unlockingId === resource._id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span className="hidden md:inline">
                                  Unlocking...
                                </span>
                              </>
                            ) : (
                              <>
                                <span>🔒</span>
                                <span className="hidden md:inline">
                                  Unlock Resource
                                </span>
                                <span className="md:hidden">Unlock</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedResource(resource)}
                            className="flex-1 bg-blue-600 text-white text-xs md:text-sm font-medium py-1.5 px-2 md:py-2 md:px-3 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 h-8 md:h-10"
                          >
                            <Eye className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden md:inline">View</span>
                          </button>
                        )}
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
                    <span className="md:hidden">
                      <ChevronsLeft className="w-4 h-4" />
                    </span>
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 md:px-3 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center min-w-[32px] md:min-w-[40px]"
                    title="Previous Page"
                  >
                    <span className="hidden md:inline">Previous</span>
                    <span className="md:hidden">
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  </button>

                  <span className="text-sm text-gray-700 px-2 font-medium">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 md:px-3 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center min-w-[32px] md:min-w-[40px]"
                    title="Next Page"
                  >
                    <span className="hidden md:inline">Next</span>
                    <span className="md:hidden">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="p-2 md:px-3 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center min-w-[32px] md:min-w-[40px]"
                    title="Last Page"
                  >
                    <span className="hidden md:inline">Last</span>
                    <span className="md:hidden">
                      <ChevronsRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <ResourceModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}

      <Footer />
    </div>
  );
}
