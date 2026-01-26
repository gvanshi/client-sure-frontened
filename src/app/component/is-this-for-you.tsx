"use client"
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

export default function IsThisForYou() {
  const notForYou = [
    "You want instant money without effort",
    "You don't want to reach out to clients",
    "You are looking for shortcuts or scams",
  ];

  const isForYou = [
    "You want direct global clients",
    "You are tired of bidding platforms",
    "You want control over your income",
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="bg-white py-20 lg:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Is This For You?
          </h2>
          <p className="text-gray-500 text-lg lg:text-xl">
            Let's be honest. ClientSure isn't for everyone.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* NOT For You - Red Card */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -5 }}
            className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl p-8 md:p-10 lg:p-12 transition-all shadow-sm hover:shadow-md"
          >
            <h3 className="flex items-center gap-2 text-[#F85E2E] font-bold text-lg lg:text-xl mb-6 lg:mb-8">
              <X className="w-5 h-5 lg:w-6 lg:h-6 stroke-[3]" />
              ClientSure is NOT for you if:
            </h3>
            <ul className="space-y-4">
              {notForYou.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-4 h-4 lg:w-5 lg:h-5 text-[#F85E2E] mt-1 shrink-0" />
                  <span className="text-gray-600 font-medium text-sm lg:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* IS For You - Green Card */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -5 }}
            className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-8 md:p-10 lg:p-12 transition-all shadow-sm hover:shadow-md"
          >
            <h3 className="flex items-center gap-2 text-[#1C9988] font-bold text-lg lg:text-xl mb-6 lg:mb-8">
              <Check className="w-5 h-5 lg:w-6 lg:h-6 stroke-[3]" />
              ClientSure IS for you if:
            </h3>
            <ul className="space-y-4">
              {isForYou.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-4 h-4 lg:w-5 lg:h-5 text-[#1C9988] mt-1 shrink-0" />
                  <span className="text-gray-800 font-bold text-sm lg:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
