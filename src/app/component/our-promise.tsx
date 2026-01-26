"use client"
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function OurPromise() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="bg-white py-20 lg:py-32 px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl mx-auto text-center"
      >
        <motion.div variants={fadeInUp}>
          <div className="inline-flex items-center gap-2 bg-[#FFF8E7] px-4 py-2 rounded-full mb-6 border border-[#FFE8B9]">
            <Heart className="w-4 h-4 text-[#B4822D]" />
            <span className="text-[#B4822D] font-bold text-xs uppercase tracking-wide">
              Our Promise
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-12 lg:mb-16">
            Built with One Goal:
          </h2>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          whileHover={{ scale: 1.02 }}
          className="bg-white border border-gray-100 rounded-3xl p-10 md:p-16 lg:p-20 shadow-lg shadow-gray-100/50 transition-transform duration-500 ease-out"
        >
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-500 font-medium leading-relaxed mb-8 lg:mb-12">
            "Give Indian freelancers direct access to global clients — without
            middlemen, commissions, or fake promises."
          </p>

          <div className="space-y-2 lg:space-y-3">
            <p className="font-bold text-gray-900 text-lg lg:text-xl">
              We don't sell dreams.
            </p>
            <p className="font-bold text-gray-900 text-lg lg:text-xl">
              We give systems.
            </p>
            <p className="text-gray-400 text-sm lg:text-base">
              Results depend on your effort.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
