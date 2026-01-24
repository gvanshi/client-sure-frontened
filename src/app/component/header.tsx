import { Shield } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50  border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-[#1C9988] p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">ClientSure</span>
        </Link>

        {/* Navigation Links - Hidden on mobile, can add mobile menu later if requested */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#how-it-works"
            className="text-gray-600 hover:text-gray-900 font-medium text-sm scroll-smooth"
          >
            How It Works
          </Link>
          <Link
            href="#features"
            className="text-gray-600 hover:text-gray-900 font-medium text-sm scroll-smooth"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-gray-600 hover:text-gray-900 font-medium text-sm scroll-smooth"
          >
            Pricing
          </Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <button className="bg-[#F85E2E] text-white px-5 py-2.5 rounded-lg hover:bg-[#e0552a] font-medium text-sm transition-colors shadow-sm">
              Get Started
            </button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
