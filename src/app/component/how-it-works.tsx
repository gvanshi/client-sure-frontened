"use client"
import {
  UserPlus,
  Search,
  Unlock,
  MessageSquare,
  Zap,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <UserPlus className="w-5 h-5 lg:w-6 lg:h-6 text-[#1C9988]" />,
      title: "Create Your Account",
      desc: "Sign up in 2 minutes. Choose any plan below to proceed. Get 100 tokens instantly.",
    },
    {
      number: "02",
      icon: <Search className="w-5 h-5 lg:w-6 lg:h-6 text-[#1C9988]" />,
      title: "Find Your Ideal Clients",
      desc: "Browse by country, city, or industry. See company names and categories before unlocking.",
    },
    {
      number: "03",
      icon: <Unlock className="w-5 h-5 lg:w-6 lg:h-6 text-[#1C9988]" />,
      title: "Unlock Full Details",
      desc: "Use 1 token to reveal complete contact info. Email, phone, social profiles — all yours forever.",
    },
    {
      number: "04",
      icon: <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6 text-[#1C9988]" />,
      title: "Reach Out Directly",
      desc: "Use our AI tools to craft personalized messages. Email, WhatsApp, or LinkedIn — your choice.",
    },
  ];

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
    <section className="bg-white py-20 lg:py-32 px-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-16 lg:mb-24">
          <span className="text-[#1C9988] font-bold tracking-wider text-xs lg:text-sm uppercase mb-4 block">
            HOW IT WORKS
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            From Signup to First Client
          </h2>
          <p className="text-gray-500 text-lg lg:text-xl max-w-2xl mx-auto">
            Four simple steps. No complicated setup.
            <br className="hidden md:block" />
            Start reaching global clients in minutes.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative mb-16 lg:mb-24"
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={fadeInUp} className="relative">
              <motion.div
                whileHover={{ y: -10 }}
                className="bg-white border border-gray-100 rounded-2xl p-8 lg:p-10 shadow-sm h-full hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-3xl lg:text-4xl font-bold text-gray-200">
                    {step.number}
                  </span>
                  <div className="bg-[#E8F5F3] p-2.5 lg:p-3 rounded-lg">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>

                <p className="text-gray-500 text-sm lg:text-base leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>

              {/* Arrow Connector (Desktop Only) - Not shown for last item */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-4 z-10 bg-white p-1.5 rounded-full border border-gray-100 transform -translate-y-1/2 text-gray-300 shadow-sm">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Banner */}
        <motion.div variants={fadeInUp} className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-3 bg-[#E8F5F3] px-6 lg:px-8 py-3 lg:py-4 rounded-full border border-[#CDE8E3]"
          >
            <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500 fill-current" />
            <p className="text-sm lg:text-base text-gray-700">
              Average time from signup to first outreach:{" "}
              <span className="font-bold text-[#1C9988]">Under 10 minutes</span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
