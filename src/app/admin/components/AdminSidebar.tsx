"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Home,
  Users,
  BarChart3,
  FolderOpen,
  FileText,
  Play,
  Trophy,
  User,
  LogOut,
  Search,
  MessageCircle,
  Award,
  UserPlus,
  Mail,
  Menu,
  X
} from "lucide-react"

interface AdminSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export default function AdminSidebar({ isMobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Leads', icon: BarChart3, path: '/admin/leads' },
    { name: 'Emails', icon: Mail, path: '/admin/emails' },
    { name: 'Resources', icon: FolderOpen, path: '/admin/resources' },
    { name: 'User Community', icon: MessageCircle, path: '/admin/community' },
    { name: 'Leaderboard', icon: Award, path: '/admin/leaderboard' },
    { name: 'Referrals Management', icon: UserPlus, path: '/admin/referrals' }
  ]

  const filteredItems = sidebarItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLogout = () => {
    // Clear all stored tokens and user data
    localStorage.removeItem('userToken')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    if (onMobileClose) {
      onMobileClose()
    }
  }

  const sidebarContent = (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">ClientSure</h1>
            <p className="text-slate-400 text-sm mt-1">Admin Dashboard</p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onMobileClose}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-2">
          {filteredItems.map((item) => (
            <div key={item.name}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-8 pt-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200 hover:transform hover:scale-105 hover:shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar - Always visible on md and up */}
      <div className="hidden md:block w-64 min-h-screen shadow-2xl">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar - Drawer */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onMobileClose}
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-64 z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}