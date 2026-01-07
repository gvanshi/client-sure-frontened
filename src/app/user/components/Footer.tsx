export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              ClientSure™️
            </h3>
            <p className="text-gray-300 mb-4">
              Operated Under Snoowball Media Pvt Ltd.
            </p>
            <p className="text-gray-300 text-sm">
              Empowering your business with AI-driven lead generation and comprehensive resources to accelerate your growth.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal & Support</h4>
            <ul className="space-y-2">
              <li><a href="/privacy-policy" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
              <li><a href="/refund-policy" className="text-gray-300 hover:text-white">Refund Policy</a></li>
              <li><a href="/terms-and-conditions" className="text-gray-300 hover:text-white">Terms and Conditions</a></li>
              <li><a href="/contact-us" className="text-gray-300 hover:text-white">Contact Us</a></li>
              <li><a href="/about-us" className="text-gray-300 hover:text-white">About Us</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <span className="text-sm font-semibold">Support Email:</span>
                <br />
                <a href="mailto:snoowballmedia@gmail.com" className="hover:text-white">
                  snoowballmedia@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h5 className="text-sm font-semibold text-gray-200 mb-2">Disclaimer:</h5>
            <p className="text-xs text-gray-400 leading-relaxed">
              Our platform provides tools, systems, resources, and access to verified leads to help freelancers and agencies connect with potential clients; however, we do not guarantee results, revenue, or client acquisition, as outcomes depend on individual effort and external factors. The information provided is for general purposes only and does not constitute business, legal, or financial advice. We are not affiliated with, endorsed by, or associated with Meta (Facebook, Instagram), Google, LinkedIn, or any other third-party platforms or trademarks mentioned, which belong to their respective owners. Use of the platform and engagement with leads is solely at your own risk.
            </p>
          </div>
          
          {/* Copyright */}
          <p className="text-gray-400 text-center text-sm">
            &copy; {new Date().getFullYear()} ClientSure™️ - Operated Under Snoowball Media Pvt Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}