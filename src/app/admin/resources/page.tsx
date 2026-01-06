"use client"

import dynamic from "next/dynamic"
import AdminLayout from "../components/AdminLayout"

// Dynamically import ResourcesContent with SSR disabled
const ResourcesContent = dynamic(() => import("../components/ResourcesContent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Resources...</p>
      </div>
    </div>
  )
})

export default function ResourcesPage() {
  return (
    <AdminLayout>
      <ResourcesContent />
    </AdminLayout>
  )
}
