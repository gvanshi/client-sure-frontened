import { Check, X, Minus, Scale } from "lucide-react";

export default function Comparison() {
  const features = [
    {
      name: "Direct client access",
      clientsure: true,
      upwork: false,
      fiverr: false,
    },
    {
      name: "No platform commissions",
      clientsure: true,
      upwork: false,
      fiverr: false,
    },
    {
      name: "No bidding required",
      clientsure: true,
      upwork: false,
      fiverr: false,
    },
    {
      name: "Verified business contacts",
      clientsure: true,
      upwork: "partial",
      fiverr: "partial",
    },
    {
      name: "Set your own rates",
      clientsure: true,
      upwork: "partial",
      fiverr: false,
    },
    {
      name: "Built-in AI outreach tools",
      clientsure: true,
      upwork: false,
      fiverr: false,
    },
    {
      name: "Global client database",
      clientsure: true,
      upwork: true,
      fiverr: true,
    },
    {
      name: "Daily token access",
      clientsure: true,
      upwork: false,
      fiverr: false,
    },
  ];

  const renderIcon = (status: boolean | string) => {
    if (status === true)
      return (
        <Check className="w-5 h-5 text-green-500 mx-auto" strokeWidth={3} />
      );
    if (status === false) return <X className="w-5 h-5 text-red-400 mx-auto" />;
    return <Minus className="w-5 h-5 text-yellow-500 mx-auto" />;
  };

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FFF8E7] px-4 py-2 rounded-full mb-6 border border-[#FFE8B9]">
            <Scale className="w-4 h-4 text-[#B4822D]" />
            <span className="text-[#B4822D] font-bold text-xs uppercase tracking-wide">
              Platform Comparison
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose ClientSure?
          </h2>
          <p className="text-gray-500">
            See how ClientSure compares to traditional freelance platforms.
          </p>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Table Header */}
            <div className="grid grid-cols-4 pb-6 border-b border-gray-100 mb-6">
              <div className="text-left font-medium text-gray-400 text-sm">
                Feature
              </div>
              <div className="text-center font-bold text-[#1C9988] text-lg">
                ClientSure
              </div>
              <div className="text-center font-medium text-gray-400">
                Upwork
              </div>
              <div className="text-center font-medium text-gray-400">
                Fiverr
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 items-center py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {feature.name}
                  </div>
                  <div className="text-center">
                    {renderIcon(feature.clientsure)}
                  </div>
                  <div className="text-center">
                    {renderIcon(feature.upwork)}
                  </div>
                  <div className="text-center">
                    {renderIcon(feature.fiverr)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">
            Traditional platforms take 10-20% commission. With ClientSure, you
            keep 100% of what you earn.
          </p>
        </div>
      </div>
    </section>
  );
}
