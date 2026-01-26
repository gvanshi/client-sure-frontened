"use client"
import { Zap, Check, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function FinalCTA() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="bg-white py-24 lg:py-40 px-6 text-center">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 lg:mb-8"
        >
          Ready to Get Global Clients?
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          className="text-gray-500 mb-8 lg:mb-12 max-w-xl mx-auto text-lg lg:text-xl leading-relaxed"
        >
          Stop bidding. Stop competing on price. Stop waiting.
          <br />
          Start reaching clients directly. Start today.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap justify-center gap-6 text-xs lg:text-sm font-bold text-gray-400 mb-10 lg:mb-16"
        >
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#1C9988]" /> US,
            UK, UAE, AU & more
          </span>
          <span className="flex items-center gap-1.5">
            <Zap
              className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#1C9988]"
              fill="currentColor"
            />{" "}
            100 tokens daily
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#1C9988]" /> No
            hidden fees
          </span>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="bg-white border border-gray-100 rounded-2xl p-8 lg:p-10 max-w-lg mx-auto shadow-sm mb-10 lg:mb-16"
        >
          <div className="space-y-1 text-sm lg:text-base font-medium text-gray-600">
            <p>
              If you want{" "}
              <span className="text-[#1C9988] font-bold">global clients</span>,
            </p>
            <p>
              if you want{" "}
              <span className="text-[#1C9988] font-bold">better money</span>,
            </p>
            <p>
              if you want a{" "}
              <span className="text-[#1C9988] font-bold">real system</span> that
              works...
            </p>
          </div>
          <p className="mt-4 text-gray-900 font-bold text-lg lg:text-xl">
            ClientSure is where you start.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0px 0px 0px rgba(248, 94, 46, 0)",
                "0px 0px 20px rgba(248, 94, 46, 0.4)",
                "0px 0px 0px rgba(248, 94, 46, 0)",
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="bg-[#F85E2E] hover:bg-[#E04D1F] text-white font-bold py-4 px-10 lg:px-12 lg:py-5 rounded-full text-sm lg:text-lg transition-colors shadow-lg shadow-orange-500/20"
          >
            Get Access Now (100 Tokens Today) →
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
