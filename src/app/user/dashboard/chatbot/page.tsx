"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import { Sidebar } from "./components";
import {
  EmailsScreen,
  WhatsAppScreen,
  LinkedInScreen,
  ContractsScreen,
} from "./screens";

type Tool = "emails" | "whatsapp" | "linkedin" | "contracts" | null;

export default function ChatbotPage() {
  const [activeTool, setActiveTool] = useState<Tool>("emails");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function openTool(t: Tool) {
    setActiveTool(t);
    if (typeof window !== "undefined" && window.innerWidth < 1024)
      setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navbar />

      <div className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <aside className="hidden lg:block">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-blue-200 shadow-lg sticky top-24">
                <Sidebar activeTool={activeTool} openTool={openTool} />
              </div>
            </aside>

            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-45"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.aside
                    className="fixed top-0 left-0 bottom-0 w-80 z-46 p-4 bg-white/95 backdrop-blur-sm border-r border-blue-200 shadow-xl overflow-y-auto"
                    initial={{ x: -320 }}
                    animate={{ x: 0 }}
                    exit={{ x: -320 }}
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                  >
                    <Sidebar activeTool={activeTool} openTool={openTool} />
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            <main className="min-h-[70vh]">
              {activeTool === "emails" && <EmailsScreen />}
              {activeTool === "whatsapp" && <WhatsAppScreen />}
              {activeTool === "linkedin" && <LinkedInScreen />}
              {activeTool === "contracts" && <ContractsScreen />}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
