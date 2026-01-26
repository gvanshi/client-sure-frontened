"use client"
import { Quote, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Testimonials() {
  const reviews = [
    {
      q: "Sent my first email using ClientSure. Got a reply in 2 days.",
      author: "Rohit",
      role: "Web Designer, Delhi",
    },
    {
      q: "No bidding. No commissions. Direct WhatsApp works.",
      author: "Ankit",
      role: "Agency Owner, Jaipur",
    },
    {
      q: "Didn't expect this at this price. Very clean data.",
      author: "Neha",
      role: "Marketing Consultant, Pune",
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
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
    <section className="bg-white py-12 lg:py-24 px-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-5xl mx-auto"
      >
        {/* Main Highlight Card */}
        <motion.div
          variants={fadeInUp}
          whileHover={{ y: -5 }}
          className="bg-[#E8F5F3] rounded-3xl p-10 md:p-16 lg:p-20 text-center mb-12 shadow-sm border border-[#d0e8e4] transition-all duration-300"
        >
          <div className="flex justify-center mb-6 opacity-30">
            <Quote
              className="w-12 h-12 lg:w-16 lg:h-16 text-[#1C9988]"
              fill="currentColor"
            />
          </div>

          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 leading-normal">
            I sent 15 emails.
            <br />
            Got 3 replies.
            <br />
            <span className="text-[#1C9988]">
              Closed my first international client.
            </span>
          </h3>

          <p className="text-gray-500 font-medium text-sm lg:text-base">
            — Vikram S., Graphic Designer, Mumbai
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
              className="bg-white border border-gray-100 rounded-xl p-6 lg:p-8 shadow-sm flex flex-col items-start transition-all duration-300"
            >
              <Star className="w-5 h-5 text-yellow-400 mb-4 fill-current" />
              <p className="text-gray-800 font-medium text-sm lg:text-base mb-4 leading-relaxed">
                "{review.q}"
              </p>
              <div className="mt-auto pt-2">
                <p className="text-xs lg:text-sm font-bold text-gray-900">
                  {review.author}{" "}
                  <span className="text-gray-400 font-normal">
                    ({review.role})
                  </span>
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
