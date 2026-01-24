import { Check, X } from "lucide-react";

export default function IsThisForYou() {
  const notForYou = [
    "You want instant money without effort",
    "You don't want to reach out to clients",
    "You are looking for shortcuts or scams",
  ];

  const isForYou = [
    "You want direct global clients",
    "You are tired of bidding platforms",
    "You want control over your income",
  ];

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Is This For You?
          </h2>
          <p className="text-gray-500">
            Let's be honest. ClientSure isn't for everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* NOT For You - Red Card */}
          <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl p-8 md:p-10">
            <h3 className="flex items-center gap-2 text-[#F85E2E] font-bold text-lg mb-6">
              <X className="w-5 h-5 stroke-[3]" />
              ClientSure is NOT for you if:
            </h3>
            <ul className="space-y-4">
              {notForYou.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-[#F85E2E] mt-1 shrink-0" />
                  <span className="text-gray-600 font-medium text-sm">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* IS For You - Green Card */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-8 md:p-10">
            <h3 className="flex items-center gap-2 text-[#1C9988] font-bold text-lg mb-6">
              <Check className="w-5 h-5 stroke-[3]" />
              ClientSure IS for you if:
            </h3>
            <ul className="space-y-4">
              {isForYou.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#1C9988] mt-1 shrink-0" />
                  <span className="text-gray-800 font-bold text-sm">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
