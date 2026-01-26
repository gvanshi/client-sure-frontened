"use client";

import { Mail, MessageSquare, Clock } from "lucide-react";

export default function ContactModalContent() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h3>
        <p className="text-gray-600 max-w-xl mx-auto">
          Have questions? We're here to help. Reach out to us and we'll get back
          to you as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Email Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#1C9988]" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
          <a
            href="mailto:snoowballmedia@gmail.com"
            className="text-[#1C9988] hover:underline block break-all"
          >
            snoowballmedia@gmail.com
          </a>
        </div>

        {/* Live Support Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-[#1C9988]" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Live Support</h4>
          <p className="text-gray-600 text-sm">Available for premium members</p>
        </div>

        {/* Response Time Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-[#1C9988]" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Response Time</h4>
          <p className="text-gray-600 text-sm">Within 24-48 hours</p>
        </div>
      </div>
    </div>
  );
}
