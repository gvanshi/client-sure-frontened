"use client";

import { Mail, Globe } from "lucide-react";
import { useState } from "react";
import FooterModal from "./FooterModal";
import { legalContent } from "../data/legalContent";
import ContactModalContent from "./footer-modals/ContactModalContent";
import AboutModalContent from "./footer-modals/AboutModalContent";

export default function Footer() {
  const [activeModal, setActiveModal] = useState<
    "privacy" | "refund" | "terms" | "contact" | "about" | null
  >(null);

  const getModalContent = () => {
    switch (activeModal) {
      case "contact":
        return <ContactModalContent />;
      case "about":
        return <AboutModalContent />;
      case "privacy":
        return (
          <LegalContentDisplay content={legalContent.privacyPolicy} showTitle />
        );
      case "refund":
        return (
          <LegalContentDisplay content={legalContent.refundPolicy} showTitle />
        );
      case "terms":
        return (
          <LegalContentDisplay
            content={legalContent.termsAndConditions}
            showTitle
          />
        );
      default:
        return null;
    }
  };

  return (
    <footer className="bg-white pt-20 pb-32 lg:pt-32 lg:pb-40 px-6 border-t border-gray-50 text-center font-sans relative z-10 w-full">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 lg:mb-12 select-none">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#1C9988] rounded-full flex items-center justify-center text-white font-bold text-lg lg:text-xl">
            <Globe className="w-5 h-5 lg:w-6 lg:h-6 stroke-2" />
          </div>
          <span className="font-bold text-gray-900 text-lg lg:text-2xl tracking-tight">
            ClientSure
          </span>
        </div>

        {/* Copyright */}
        <p className="text-[12px] lg:text-sm text-gray-500 mb-8 lg:mb-10 uppercase tracking-wide font-medium">
          Copyright ClientSure™ Operated Under Snowball Media Pvt Ltd.
        </p>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-10 text-[13px] lg:text-base text-gray-500 font-medium mb-10 w-full px-4 items-center">
          <button
            onClick={() => setActiveModal("privacy")}
            className="hover:text-gray-900 transition-colors focus:outline-none"
          >
            Privacy Policy
          </button>
          <span className="text-gray-300 w-px h-4 bg-gray-200"></span>
          <button
            onClick={() => setActiveModal("refund")}
            className="hover:text-gray-900 transition-colors focus:outline-none"
          >
            Refund Policy
          </button>
          <span className="text-gray-300 w-px h-4 bg-gray-200"></span>
          <button
            onClick={() => setActiveModal("terms")}
            className="hover:text-gray-900 transition-colors focus:outline-none"
          >
            Terms and Conditions
          </button>
          <span className="text-gray-300 w-px h-4 bg-gray-200"></span>
          <button
            onClick={() => setActiveModal("contact")}
            className="hover:text-gray-900 transition-colors focus:outline-none"
          >
            Contact Us
          </button>
          <span className="text-gray-300 w-px h-4 bg-gray-200"></span>
          <button
            onClick={() => setActiveModal("about")}
            className="hover:text-gray-900 transition-colors focus:outline-none"
          >
            About Us
          </button>
        </div>

        {/* Support Email */}
        <div className="flex items-center justify-center gap-2 text-[13px] lg:text-base text-gray-500 mb-12">
          <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
          <span>
            Support email:{" "}
            <a
              href="mailto:snoowballmedia@gmail.com"
              className="text-[#1C9988] font-medium hover:underline"
            >
              snoowballmedia@gmail.com
            </a>
          </span>
        </div>

        {/* Disclaimer */}
        <div className="max-w-[900px] lg:max-w-4xl mx-auto text-[10px] lg:text-xs text-gray-300 leading-relaxed text-center px-4">
          <p className="mb-2">
            <span className="font-bold text-gray-400">Disclaimer:</span> Our
            platform provides tools, systems, resources, and access to verified
            leads to help freelancers and agencies connect with potential
            clients; however, we do not guarantee results, revenue, or client
            acquisition, as outcomes depend on individual effort and external
            factors. The information provided is for general purposes only and
            does not constitute business, legal, or financial advice.
          </p>
          <p>
            We are not affiliated with, endorsed by, or associated with Meta
            (Facebook, Instagram), Google, LinkedIn, or any other third-party
            platforms or trademarks mentioned, which belong to their respective
            owners. Use of the platform and engagement with leads is solely at
            your own risk.
          </p>
        </div>
      </div>

      <FooterModal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
      >
        {getModalContent()}
      </FooterModal>
    </footer>
  );
}

// Helper component to render legal text content consistently
function LegalContentDisplay({
  content,
  showTitle = false,
}: {
  content: any;
  showTitle?: boolean;
}) {
  if (!content) return null;
  return (
    <div className="space-y-8">
      {showTitle && (
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {content.lastUpdated}
          </p>
        </div>
      )}
      {content.sections.map((section: any, index: number) => (
        <div key={index} className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900">
            {section.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap text-justify">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  );
}
