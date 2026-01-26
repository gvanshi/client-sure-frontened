"use client";

import { Globe, ShieldCheck, Users, Zap } from "lucide-react";

export default function AboutModalContent() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3">
          About ClientSure
        </h3>
        <p className="text-gray-600 leading-relaxed text-lg">
          Empowering freelancers and agencies to connect with global clients
          through verified leads and powerful tools.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h4 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h4>
        <p className="text-gray-600 leading-relaxed">
          At ClientSure, we believe that talented freelancers and agencies
          deserve access to quality clients from around the world. Our platform
          bridges the gap between skilled professionals and businesses seeking
          their services, providing verified leads and the tools needed to
          succeed in the global marketplace.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-[#1C9988]" />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Global Reach</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            Connect with clients from US, UK, UAE, Australia, and more. Our
            platform opens doors to international opportunities.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-[#1C9988]" />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Verified Leads</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            Every lead is verified and vetted to ensure you're connecting with
            genuine business opportunities.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-[#1C9988]" />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Community First</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            We're building a community of successful freelancers and agencies
            who support each other's growth.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-[#1C9988]" />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">AI-Powered Tools</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            Leverage cutting-edge AI tools to streamline your outreach and
            maximize your conversion rates.
          </p>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        <h4 className="text-xl font-bold text-gray-900 mb-4">
          Company Information
        </h4>
        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Operated by:</span> Snoowball Media
            Pvt Ltd
          </p>
          <p>
            <span className="font-semibold">Contact:</span>{" "}
            <a
              href="mailto:snoowballmedia@gmail.com"
              className="text-[#1C9988] hover:underline"
            >
              snoowballmedia@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
