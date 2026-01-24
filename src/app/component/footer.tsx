import { Mail, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white pt-20 pb-12 px-6 border-t border-gray-50 text-center font-sans relative z-10 w-full">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 select-none">
          <div className="w-8 h-8 bg-[#1C9988] rounded-full flex items-center justify-center text-white font-bold text-lg">
            <Globe className="w-5 h-5 stroke-2" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            ClientSure
          </span>
        </div>

        {/* Copyright */}
        <p className="text-[12px] text-gray-500 mb-8 uppercase tracking-wide font-medium">
          Copyright ClientSure™ Operated Under Snowball Media Pvt Ltd.
        </p>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-[13px] text-gray-500 font-medium mb-10 w-full px-4">
          <a href="#" className="hover:text-gray-900 transition-colors">
            Privacy Policy
          </a>
          <span className="text-gray-300 w-px h-4 bg-gray-200"></span>
          <a href="#" className="hover:text-gray-900 transition-colors">
            Refund Policy
          </a>
          <span className="text-gray-300 w-px h-4 bg-gray-200"></span>
          <a href="#" className="hover:text-gray-900 transition-colors">
            Terms and Conditions
          </a>
          <span className="text-gray-300 w-px h-4 bg-gray-200"></span>
          <a href="#" className="hover:text-gray-900 transition-colors">
            Contact Us
          </a>
          <span className="text-gray-300 w-px h-4 bg-gray-200"></span>
          <a href="#" className="hover:text-gray-900 transition-colors">
            About Us
          </a>
        </div>

        {/* Support Email */}
        <div className="flex items-center justify-center gap-2 text-[13px] text-gray-500 mb-12">
          <Mail className="w-4 h-4 text-gray-400" />
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
        <div className="max-w-[900px] mx-auto text-[10px] text-gray-300 leading-relaxed text-center px-4">
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
    </footer>
  );
}
