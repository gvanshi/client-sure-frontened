"use client";
import { Shield, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import LoginModal from "./LoginModal";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for user data in localStorage
    const storedUser =
      localStorage.getItem("userData") || localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100"
      >
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-[#1C9988] p-1.5 rounded-lg"
            >
              <Shield className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-[#1C9988] transition-colors">
              ClientSure
            </span>
          </Link>

          {/* Navigation Links - Hidden on mobile, can add mobile menu later if requested */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm scroll-smooth relative group"
            >
              How It Works
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[#1C9988] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
            <Link
              href="#features"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm scroll-smooth relative group"
            >
              Features
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[#1C9988] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
            <Link
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm scroll-smooth relative group"
            >
              Pricing
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[#1C9988] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/user/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-[#1C9988]/10 text-[#1C9988] px-5 py-2.5 rounded-lg hover:bg-[#1C9988]/20 font-medium text-sm transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user.name || "Dashboard"}
                </motion.button>
              </Link>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-[#F85E2E] text-white px-5 py-2.5 rounded-lg hover:bg-[#e0552a] font-medium text-sm transition-colors shadow-sm"
              >
                Get Started
              </motion.button>
            )}
          </div>
        </nav>
      </motion.header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
