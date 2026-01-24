import { Heart } from "lucide-react";

export default function OurPromise() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-[#FFF8E7] px-4 py-2 rounded-full mb-6 border border-[#FFE8B9]">
          <Heart className="w-4 h-4 text-[#B4822D]" />
          <span className="text-[#B4822D] font-bold text-xs uppercase tracking-wide">
            Our Promise
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
          Built with One Goal:
        </h2>

        <div className="bg-white border border-gray-100 rounded-3xl p-10 md:p-16 shadow-lg shadow-gray-100/50">
          <p className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed mb-8">
            "Give Indian freelancers direct access to global clients — without
            middlemen, commissions, or fake promises."
          </p>

          <div className="space-y-2">
            <p className="font-bold text-gray-900">We don't sell dreams.</p>
            <p className="font-bold text-gray-900">We give systems.</p>
            <p className="text-gray-400 text-sm">
              Results depend on your effort.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
