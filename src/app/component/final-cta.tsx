import { Zap, Check, Lock } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="bg-white py-24 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Ready to Get Global Clients?
        </h2>

        <p className="text-gray-500 mb-8 max-w-xl mx-auto">
          Stop bidding. Stop competing on price. Stop waiting.
          <br />
          Start reaching clients directly. Start today.
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-xs font-bold text-gray-400 mb-10">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#1C9988]" /> US, UK, UAE, AU &
            more
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#1C9988]" fill="currentColor" />{" "}
            100 tokens daily
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#1C9988]" /> No hidden fees
          </span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-lg mx-auto shadow-sm mb-10">
          <div className="space-y-1 text-sm font-medium text-gray-600">
            <p>
              If you want{" "}
              <span className="text-[#1C9988] font-bold">global clients</span>,
            </p>
            <p>
              if you want{" "}
              <span className="text-[#1C9988] font-bold">better money</span>,
            </p>
            <p>
              if you want a{" "}
              <span className="text-[#1C9988] font-bold">real system</span> that
              works...
            </p>
          </div>
          <p className="mt-4 text-gray-900 font-bold text-lg">
            ClientSure is where you start.
          </p>
        </div>

        <button className="bg-[#F85E2E] hover:bg-[#E04D1F] text-white font-bold py-4 px-10 rounded-full text-sm transition-colors shadow-lg shadow-orange-500/20">
          Get Access Now (100 Tokens Today) →
        </button>
      </div>
    </section>
  );
}
