"use client"
import { Globe2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ValueProposition() {
  return (
    <section className="bg-white py-12 lg:py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm lg:shadow-md p-8 lg:p-12 text-center transition-all"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-[#E8F5F3] p-4 rounded-full">
              <Globe2 className="w-6 h-6 lg:w-8 lg:h-8 text-[#1C9988]" />
            </div>
          </div>

          <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-4">
            Built for Global Markets. Priced for India.
          </h2>

          <p className="text-gray-500 text-sm lg:text-base leading-relaxed">
            International client data that usually costs ₹10,000–₹18,000/month.
            <br />
            We made it accessible. Starting at just{" "}
            <span className="font-bold text-gray-900 text-lg">₹33/day</span>.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
