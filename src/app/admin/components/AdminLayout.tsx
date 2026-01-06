"use client"

import { useState, ReactNode } from "react"
import { Menu } from "lucide-react"
import AdminSidebar from "./AdminSidebar"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#BDDDFC] flex">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex items-center justify-between z-30 shadow-lg">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">ClientSure Admin</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Sidebar */}
      <AdminSidebar 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 w-full md:w-auto pt-16 md:pt-0">
        {children}
      </div>
    </div>
  )
}
