"use client"
import {
  ShieldCheck,
  Smartphone,
  Clock,
  Star,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Trust() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section className="bg-white py-20 lg:py-32 px-6 border-t border-gray-50 overflow-hidden">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Security */}
          <motion.div variants={fadeInUp}>
            <span className="text-[#1C9988] font-bold tracking-wider text-[10px] uppercase mb-4 block">
              SECURITY & CONTROL
            </span>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Your Account. Your Control.
            </h3>
            <p className="text-sm lg:text-base text-gray-500 mb-8">
              We take security seriously. Your data and access are protected.
            </p>

            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-gray-100 p-4 lg:p-6 rounded-xl flex items-start gap-4 transition-all hover:shadow-md"
              >
                <div className="bg-[#E8F5F3] p-2 rounded-lg shrink-0">
                  <Smartphone className="w-5 h-5 text-[#1C9988]" />
                </div>
                <div>
                  <h4 className="text-sm lg:text-base font-bold text-gray-900">
                    Maximum 2 Device Login
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">
                    Your account is protected. Only 2 devices can be logged in
                    at once.
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-gray-100 p-4 lg:p-6 rounded-xl flex items-start gap-4 transition-all hover:shadow-md"
              >
                <div className="bg-[#E8F5F3] p-2 rounded-lg shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#1C9988]" />
                </div>
                <div>
                  <h4 className="text-sm lg:text-base font-bold text-gray-900">
                    Full Session Control
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">
                    See all active sessions. Log out any device instantly.
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-gray-100 p-4 lg:p-6 rounded-xl flex items-start gap-4 transition-all hover:shadow-md"
              >
                <div className="bg-[#E8F5F3] p-2 rounded-lg shrink-0">
                  <Clock className="w-5 h-5 text-[#1C9988]" />
                </div>
                <div>
                  <h4 className="text-sm lg:text-base font-bold text-gray-900">
                    Subscription Expiry = Pause
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">
                    If subscription ends, access pauses. Tokens freeze, not
                    lost.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Trust/Disclaimer */}
          <motion.div variants={fadeInUp}>
            <span className="text-[#1C9988] font-bold tracking-wider text-[10px] uppercase mb-4 block">
              TRUST & TRANSPARENCY
            </span>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Real Talk. No Fake Promises.
            </h3>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white border border-gray-100 p-6 lg:p-8 rounded-xl mb-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
                <span className="ml-2 font-bold text-gray-900">4.8/5</span>
              </div>
              <p className="text-xs lg:text-sm text-gray-400">
                Average rating from 2,400+ active users across India.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#F9FAFB] border border-gray-100 p-6 lg:p-8 rounded-xl transition-all"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm lg:text-base font-bold text-gray-900 mb-2">
                    Honest Disclaimer
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-500 leading-relaxed mb-4">
                    ClientSure provides access to verified client data and
                    tools. We do not guarantee income or client acquisition.{" "}
                    <span className="font-bold text-gray-700">
                      Results depend on your effort, skills, and approach.
                    </span>
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500">
                    We focus on giving you the best system. You focus on doing
                    the work.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
