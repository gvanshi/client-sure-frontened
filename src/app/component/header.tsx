import { Shield } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          
          <span className="text-2xl font-bold text-blue-600">ClientSure</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">
            Home
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">
            Features
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">
            Pricing
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">
            About
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">
            Contact
          </a>
          <Link href="/auth/login">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
              Login
            </button>
          </Link>
        </div>
      </nav>
    </header>
  )
}
