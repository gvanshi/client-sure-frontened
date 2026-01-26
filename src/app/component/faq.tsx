"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is this a scam? How do I know this is real?",
      a: "We are a verified business with 2,400+ active users. You get instant access to verified data. No hidden fees, no fake promises. Our detailed transparency report is open for everyone.",
    },
    {
      q: "How do I actually get clients from this?",
      a: "You get direct email, phone, and LinkedIn details of decision-makers. Use our AI tools to send personalized messages. This cuts out the bidding war and puts you directly in their inbox.",
    },
    {
      q: "What if I don't get any results?",
      a: "Success depends on your outreach consistency. We provide the data and the system. If you contact 10-15 people daily using our templates, results are highly likely. However, we cannot guarantee income as it depends on your skill and effort.",
    },
    {
      q: "Are the business contacts really verified?",
      a: "Yes, we use a 3-step verification process. Emails are ping-tested daily to ensure deliverability. We focus on quality data over quantity.",
    },
    {
      q: "Why is this so cheap compared to other lead services?",
      a: "We are priced for the Indian market. Our goal is volume and accessibility for freelancers, not high-ticket enterprise sales.",
    },
    {
      q: "What happens when my subscription ends?",
      a: "Your access pauses. Your unused wallet tokens freeze and are waiting for you when you renew. You never lose what you paid for.",
    },
    {
      q: "Can I use this for any industry or just specific ones?",
      a: "We cover all major industries including Tech, Marketing, Design, Writing, and Virtual Assistance.",
    },
    {
      q: "How many devices can I use?",
      a: "For security, you can be logged in on maximum 2 devices simultaneously.",
    },
    {
      q: "Is this useful for beginners or only experienced freelancers?",
      a: "It's built for both. Beginners get templates and guides to start right. Experts get volume data to scale faster.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section className="bg-white py-20 lg:py-32 px-6">
      <div className="max-w-3xl lg:max-w-4xl mx-auto">
        <div className="text-center mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-2 bg-[#FFF8E7] px-4 py-2 rounded-full mb-6 border border-[#FFE8B9]">
            <HelpCircle className="w-4 h-4 text-[#B4822D]" />
            <span className="text-[#B4822D] font-bold text-xs uppercase tracking-wide">
              Common Questions
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Honest Answers
          </h2>
          <p className="text-gray-500 text-lg lg:text-xl">
            We know you have questions. Here are straight answers.
            <br />
            No marketing speak. Just truth.
          </p>
        </div>

        <motion.div
          className="space-y-4 lg:space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border border-gray-100 rounded-xl bg-white overflow-hidden transition-all hover:shadow-md"
            >
              <button
                className="w-full flex items-center justify-between p-6 lg:p-8 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-sm lg:text-lg font-bold text-gray-900 pr-8">
                  {faq.q}
                </span>
                {openIndex === index ? (
                  <Minus className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 lg:px-8 pb-6 lg:pb-8 text-sm lg:text-base text-gray-500 leading-relaxed border-t border-gray-50 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 lg:p-12 mt-12 lg:mt-20 text-center shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2 text-lg lg:text-xl">
            Still have questions?
          </h3>
          <p className="text-xs lg:text-base text-gray-500 mb-6">
            Join our community. Ask real users. Get honest feedback.
          </p>
          <a
            href="#"
            className="text-[#1C9988] font-bold text-sm lg:text-base hover:underline"
          >
            Email us
          </a>
        </div>
      </div>
    </section>
  );
}
