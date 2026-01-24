import { Globe2 } from "lucide-react";

export default function ValueProposition() {
  return (
    <section className="bg-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <Globe2 className="w-6 h-6 text-[#1C9988]" />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Built for Global Markets. Priced for India.
          </h2>

          <p className="text-gray-500 text-sm leading-relaxed">
            International client data that usually costs ₹10,000–₹18,000/month.
            <br />
            We made it accessible. Starting at just{" "}
            <span className="font-bold text-gray-900">₹33/day</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
