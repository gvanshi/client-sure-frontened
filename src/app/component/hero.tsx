import { CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-white pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Trusted Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#FFF8E7] border border-[#FFE8B9] rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-[#B4822D] font-medium text-sm">
              Trusted by 2,400+ freelancers across India
            </span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-bold leading-[1.1] mb-6 tracking-tight text-gray-900">
          Get <span className="text-[#1C9988]">Global Clients</span>.
          <br />
          Without Bidding. Without
          <br />
          Middlemen.
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-500 mb-8 leading-relaxed max-w-3xl mx-auto">
          Access verified business contacts from US, UK, UAE, Australia & more.
          <br className="hidden md:block" />
          Reach them directly. Close deals on your terms.
        </p>

        {/* Quote */}
        <div className="mb-10 max-w-2xl mx-auto">
          <p className="text-sm text-gray-400 italic">
            "ClientSure was built by freelancers who were tired of bidding,
            commissions, and waiting months for replies."
          </p>
        </div>

        {/* Audience */}
        <p className="text-sm text-gray-400 mb-6">
          Works for freelancers, agencies, and consultants.
        </p>

        {/* Flags */}
        <div className="flex justify-center items-center gap-3 mb-10 opacity-80">
          <span className="text-2xl">🇺🇸</span>
          <span className="text-2xl">🇬🇧</span>
          <span className="text-2xl">🇦🇪</span>
          <span className="text-2xl">🇦🇺</span>
          <span className="text-2xl">🇨🇦</span>
          <span className="text-2xl">🇸🇬</span>
          <span className="text-2xl">🇩🇪</span>
          <span className="text-2xl">🇫🇷</span>
          <span className="text-sm text-gray-400 font-medium ml-2">
            +12 more
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <button className="bg-[#F85E2E] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#e0552a] transition shadow-lg shadow-orange-100 flex items-center justify-center gap-2">
            Get Instant Access <span aria-hidden="true">→</span>
          </button>
          <button className="bg-white text-gray-800 font-semibold px-8 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center shadow-sm">
            See How It Works
          </button>
        </div>

        {/* Feature Checkmarks */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1C9988]" />
            <span>100 Tokens Daily</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1C9988]" />
            <span>No Commissions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1C9988]" />
            <span>Built-in AI Tools</span>
          </div>
        </div>
      </div>
    </section>
  );
}
