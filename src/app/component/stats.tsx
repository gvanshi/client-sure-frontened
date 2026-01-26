"use client";

import { Users, Globe, Lock, TrendingUp } from "lucide-react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString(),
  );

  useEffect(() => {
    if (inView) {
      spring.set(value);
    }
  }, [inView, spring, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

export default function Stats() {
  const stats = [
    {
      icon: <Users className="w-6 h-6 lg:w-8 lg:h-8 text-[#1C9988]" />,
      value: 2400,
      suffix: "+",
      label: "Active Users",
    },
    {
      icon: <Globe className="w-6 h-6 lg:w-8 lg:h-8 text-[#1C9988]" />,
      value: 15,
      suffix: "+",
      label: "Countries Covered",
    },
    {
      icon: <Lock className="w-6 h-6 lg:w-8 lg:h-8 text-[#1C9988]" />,
      value: 500,
      suffix: "k+",
      label: "Clients Unlocked",
    },
    {
      icon: <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-[#1C9988]" />,
      value: 98,
      suffix: "%",
      label: "Satisfaction Rate",
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
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="text-center mb-16 lg:mb-24">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Freelancers
          </h2>
          <p className="text-gray-500 text-lg lg:text-xl">
            Numbers that speak for themselves
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white border border-gray-100 rounded-2xl p-8 lg:p-10 text-center shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-[#E8F5F3] p-3 lg:p-4 rounded-full">
                  {stat.icon}
                </div>
              </div>

              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 flex justify-center items-center">
                <Counter value={stat.value} />
                <span>{stat.suffix}</span>
              </div>

              <p className="text-gray-500 text-sm lg:text-base font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
