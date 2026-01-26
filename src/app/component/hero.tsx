"use client";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
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
    <section className="bg-white pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto text-center"
      >
        {/* Trusted Badge */}
        <motion.div variants={fadeInUp} className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#FFF8E7] border border-[#FFE8B9] rounded-full px-4 py-1.5 hover:shadow-md transition-shadow cursor-default">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[#B4822D] font-medium text-sm">
              Trusted by 2,400+ freelancers across India
            </span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={fadeInUp}
          className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold leading-[1.1] mb-8 tracking-tight text-gray-900"
        >
          Get <span className="text-[#1C9988]">Global Clients</span>.
          <br />
          Without Bidding. Without
          <br />
          Middlemen.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeInUp}
          className="text-lg md:text-xl lg:text-2xl text-gray-500 mb-10 leading-relaxed max-w-4xl mx-auto"
        >
          Access verified business contacts from US, UK, UAE, Australia & more.
          <br className="hidden md:block" />
          Reach them directly. Close deals on your terms.
        </motion.p>

        {/* Quote */}
        <motion.div variants={fadeInUp} className="mb-12 max-w-3xl mx-auto">
          <p className="text-sm md:text-base text-gray-400 italic">
            "ClientSure was built by freelancers who were tired of bidding,
            commissions, and waiting months for replies."
          </p>
        </motion.div>

        {/* Audience */}
        <motion.p variants={fadeInUp} className="text-sm text-gray-400 mb-8">
          Works for freelancers, agencies, and consultants.
        </motion.p>

        {/* Flags */}
        <motion.div
          variants={fadeInUp}
          className="flex justify-center items-center gap-3 mb-14 opacity-80"
        >
          <motion.span
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="text-3xl cursor-default"
          >
            🇺🇸
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.2, rotate: -10 }}
            className="text-3xl cursor-default"
          >
            🇬🇧
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="text-3xl cursor-default"
          >
            🇦🇪
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.2, rotate: -10 }}
            className="text-3xl cursor-default"
          >
            🇦🇺
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="text-3xl cursor-default"
          >
            🇨🇦
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.2, rotate: -10 }}
            className="text-3xl cursor-default"
          >
            🇸🇬
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="text-3xl cursor-default"
          >
            🇩🇪
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.2, rotate: -10 }}
            className="text-3xl cursor-default"
          >
            🇫🇷
          </motion.span>
          <span className="text-sm text-gray-400 font-medium ml-2">
            +12 more
          </span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById("pricing")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="bg-[#F85E2E] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#e0552a] transition shadow-lg shadow-orange-100 flex items-center justify-center gap-2 text-lg"
          >
            Get Instant Access <span aria-hidden="true">→</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-gray-800 font-semibold px-8 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center shadow-sm text-lg"
          >
            See How It Works
          </motion.button>
        </motion.div>

        {/* Feature Checkmarks */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm md:text-base text-gray-500"
        >
          <div className="flex items-center gap-2 hover:text-[#1C9988] transition-colors cursor-default">
            <CheckCircle2 className="w-5 h-5 text-[#1C9988]" />
            <span>100 Tokens Daily</span>
          </div>
          <div className="flex items-center gap-2 hover:text-[#1C9988] transition-colors cursor-default">
            <CheckCircle2 className="w-5 h-5 text-[#1C9988]" />
            <span>No Commissions</span>
          </div>
          <div className="flex items-center gap-2 hover:text-[#1C9988] transition-colors cursor-default">
            <CheckCircle2 className="w-5 h-5 text-[#1C9988]" />
            <span>Built-in AI Tools</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
