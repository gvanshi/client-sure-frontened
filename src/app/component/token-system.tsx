"use client"
import {
  Zap,
  RotateCw,
  Gift,
  RefreshCw,
  Lock,
  Clock,
  Check,
  Infinity,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TokenSystem() {
  const features = [
    {
      icon: <RefreshCw className="w-5 h-5 text-[#1C9988]" />,
      title: "100 Tokens Daily",
      desc: "Every day, you get 100 tokens. Use them to unlock client profiles.",
    },
    {
      icon: <RotateCw className="w-5 h-5 text-[#1C9988]" />,
      title: "Daily Reset (IST)",
      desc: "Tokens refresh every day at midnight IST. New day, new opportunities.",
    },
    {
      icon: <Gift className="w-5 h-5 text-[#1C9988]" />,
      title: "Bonus Tokens on Plans",
      desc: "Higher plans come with extra bonus tokens. More value, more clients.",
    },
    {
      icon: <Infinity className="w-5 h-5 text-[#1C9988]" />,
      title: "Wallet Tokens Never Expire",
      desc: "Bonus tokens in your wallet stay forever. Use them whenever you want.",
    },
    {
      icon: <Lock className="w-5 h-5 text-[#1C9988]" />,
      title: "Permanent Access",
      desc: "Once you unlock a client, that profile is yours forever. No re-unlocking needed.",
    },
    {
      icon: <Clock className="w-5 h-5 text-[#1C9988]" />,
      title: "Tokens Pause, Not Lost",
      desc: "If subscription ends, your tokens freeze. They're waiting when you return.",
    },
  ];

  const textVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <section className="bg-white py-20 lg:py-32 px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-6xl mx-auto text-center"
      >
        {/* Header */}
        <motion.div variants={textVariant} className="mb-16 lg:mb-24">
          <span className="text-[#1C9988] font-bold tracking-wider text-xs lg:text-sm uppercase mb-4 block">
            SIMPLE TOKEN SYSTEM
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            1 Token = 1 Client Unlock
          </h2>
          <p className="text-gray-500 text-lg lg:text-xl max-w-2xl mx-auto">
            A fair, transparent system. You control how you use your tokens.
            <br />
            No hidden fees. No surprises.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20 lg:mb-28"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={textVariant}
              whileHover={{ y: -8 }}
              className="bg-white border border-gray-100 rounded-xl p-8 text-left hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-[#E8F5F3] w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-sm lg:text-base text-gray-500 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Explainer Card */}
        <motion.div
          variants={textVariant}
          className="bg-white border border-gray-100 rounded-3xl p-8 lg:p-12 max-w-4xl mx-auto shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="font-bold text-gray-900 mb-8 lg:mb-12 text-lg lg:text-2xl">
            How Token Unlocking Works
          </h3>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Before Unlock */}
            <div className="bg-gray-50 rounded-xl p-6 lg:p-8 text-left border border-gray-200">
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                <span className="text-sm lg:text-base font-bold text-gray-600">
                  Before Unlock
                </span>
              </div>
              <ul className="space-y-3 text-sm lg:text-base text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  Company Name:{" "}
                  <span className="font-medium text-gray-900">Visible</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  City:{" "}
                  <span className="font-medium text-gray-900">Visible</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  Category:{" "}
                  <span className="font-medium text-gray-900">Visible</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                  Contact Details: Hidden
                </li>
              </ul>
            </div>

            {/* After 1 Token */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-[#E8F5F3] rounded-xl p-6 lg:p-8 text-left border border-[#CDE8E3]"
            >
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <div className="bg-[#1C9988] text-white text-[10px] lg:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 lg:w-4 lg:h-4 fill-current" />
                  After 1 Token
                </div>
              </div>
              <ul className="space-y-3 text-sm lg:text-base text-[#1C9988]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#1C9988] rounded-full"></span>
                  <span className="font-medium">Full Company Details</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#1C9988] rounded-full"></span>
                  <span className="font-medium">Email + Phone</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#1C9988] rounded-full"></span>
                  <span className="font-medium">All Social Profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#1C9988] rounded-full"></span>
                  <span className="font-medium">Permanent Access</span>
                  <Check className="w-4 h-4 lg:w-5 lg:h-5" />
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
