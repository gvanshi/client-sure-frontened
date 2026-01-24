import { Check, X, Zap, Crown, Flame, Lock } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      name: "Basic",
      desc: "Starter Access",
      duration: "30 Days",
      oldPrice: "₹1,500",
      price: "₹999",
      perDay: "₹33/day",
      subtitle: "Perfect to test the system risk-free",
      tokens: "100 daily tokens",
      features: [
        { text: "100 daily tokens", included: true },
        { text: "Full client details on unlock", included: true },
        { text: "All AI tools included", included: true },
        { text: "Community access", included: true },
        { text: "Bonus wallet tokens", included: false },
        { text: "Priority support", included: false },
        { text: "Exclusive resources", included: false },
        { text: "VIP community access", included: false },
        { text: "Early feature access", included: false },
      ],
      highlight: false,
      color: "green",
    },
    {
      name: "Standard",
      desc: "Global Starter",
      duration: "90 Days",
      oldPrice: "₹3,500",
      price: "₹2,499",
      perDay: "₹27/day",
      subtitle: "Recommended to get your first global client",
      tokens: "Best for First International Client",
      bonus: "+500 Bonus Tokens",
      features: [
        { text: "100 daily tokens", included: true },
        { text: "Full client details on unlock", included: true },
        { text: "All AI tools included", included: true },
        { text: "Community access", included: true },
        { text: "Bonus wallet tokens", included: true },
        { text: "Priority support", included: true },
        { text: "Exclusive resources", included: false },
        { text: "VIP community access", included: false },
        { text: "Early feature access", included: false },
      ],
      highlight: true,
      color: "orange",
    },
    {
      name: "Premium",
      desc: "Growth Pro",
      duration: "180 Days",
      oldPrice: "₹6,500",
      price: "₹4,499",
      perDay: "₹24/day",
      subtitle: "For serious freelancers scaling up",
      bonus: "+1,200 Bonus Tokens",
      features: [
        { text: "100 daily tokens", included: true },
        { text: "Full client details on unlock", included: true },
        { text: "All AI tools included", included: true },
        { text: "Community access", included: true },
        { text: "Bonus wallet tokens", included: true },
        { text: "Priority support", included: true },
        { text: "Exclusive resources", included: true },
        { text: "VIP community access", included: false },
        { text: "Early feature access", included: false },
      ],
      highlight: false,
      color: "green",
    },
    {
      name: "Pro",
      desc: "Scale Unlimited",
      duration: "365 Days",
      oldPrice: "₹15,000",
      price: "₹7,999",
      perDay: "₹21/day",
      subtitle: "Built for agencies & full-time freelancers",
      bonus: "+12,200 Bonus Tokens",
      features: [
        { text: "100 daily tokens", included: true },
        { text: "Full client details on unlock", included: true },
        { text: "All AI tools included", included: true },
        { text: "Community access", included: true },
        { text: "Bonus wallet tokens", included: true },
        { text: "Priority support", included: true },
        { text: "Exclusive resources", included: true },
        { text: "VIP community access", included: true },
        { text: "Early feature access", included: true },
      ],
      highlight: false,
      color: "primary",
    },
  ];

  return (
    <section className="bg-white py-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#1C9988] font-bold tracking-wider text-xs uppercase mb-4 block">
            SIMPLE PRICING
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h2>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            No hidden fees. No surprises. Cancel anytime.
            <br />
            One international client can recover your entire investment.
          </p>

          <div className="inline-flex items-center gap-2 bg-[#E8F5F3] px-6 py-3 rounded-lg border border-[#CDE8E3]">
            <Flame className="w-4 h-4 text-orange-500 fill-current" />
            <p className="text-sm text-[#1C9988] font-medium">
              <span className="font-bold text-orange-500">
                Introductory Pricing:
              </span>{" "}
              These prices are for early users only. Once we cross 5,000 active
              users, prices will increase.
            </p>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 items-start">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white border ${plan.highlight ? "border-orange-200 shadow-md ring-1 ring-orange-100" : "border-gray-100"} rounded-2xl p-6 hover:shadow-lg transition-shadow`}
            >
              {/* Most Popular Badge */}
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#1C9988] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                {plan.name === "Basic" && (
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                )}
                {plan.name === "Standard" && (
                  <Flame className="w-4 h-4 text-orange-500 fill-current" />
                )}
                {plan.name === "Premium" && (
                  <Crown className="w-4 h-4 text-[#B4822D] fill-current" />
                )}
                {plan.name === "Pro" && (
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                )}

                <h3 className="font-bold text-gray-900">{plan.name}</h3>
              </div>

              <p className="text-xs text-gray-500 mb-1">{plan.desc}</p>
              <p className="text-xs font-bold text-gray-400 mb-4">
                {plan.duration}
              </p>

              <div className="mb-1">
                <span className="text-gray-400 line-through text-sm mr-2">
                  {plan.oldPrice}
                </span>
                <span
                  className={`text-3xl font-bold ${plan.highlight ? "text-[#1C9988]" : "text-[#1C9988]"}`}
                >
                  {plan.price}
                </span>
              </div>
              <p
                className={`text-xs font-bold mb-4 ${plan.highlight ? "text-orange-500" : "text-[#1C9988]"}`}
              >
                {plan.perDay}
              </p>

              <p className="text-xs text-gray-500 mb-4 leading-relaxed h-[32px]">
                {plan.subtitle}
              </p>

              {/* Highlight/Bonus Badge */}
              {plan.highlight && (
                <div className="mb-4">
                  <span className="bg-[#FFF8E7] text-[#B4822D] text-[10px] font-bold px-2 py-1 rounded border border-[#FFE8B9] block text-center mb-2">
                    Best for First International Client
                  </span>
                </div>
              )}

              {plan.bonus && (
                <div className="bg-[#FFF4EC] text-[#F85E2E] text-xs font-bold px-3 py-1.5 rounded-lg text-center mb-6 border border-[#FFDCC3]">
                  {plan.bonus}
                </div>
              )}
              {!plan.bonus && !plan.highlight && (
                <div className="h-[34px] mb-6"></div>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-xs ${feature.included ? "text-gray-700" : "text-gray-300"}`}
                  >
                    {feature.included ? (
                      <Check
                        className="w-3.5 h-3.5 text-[#1C9988] shrink-0 mt-0.5"
                        strokeWidth={3}
                      />
                    ) : (
                      <X className="w-3.5 h-3.5 text-gray-200 shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? "font-medium" : ""}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-[#F85E2E] text-white hover:bg-[#E04D1F]"
                    : "bg-white border border-[#1C9988] text-[#1C9988] hover:bg-[#E8F5F3]"
                }`}
              >
                Get Started {plan.highlight ? "+" : "+"}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mb-12">
          <p className="text-xs text-gray-400">
            No contracts. Cancel anytime. Your unlocked clients stay yours.
          </p>
          <div className="flex justify-center gap-4 mt-3 text-[10px] text-gray-400 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Secure Payments
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" /> Priced for India. Built for Global
              Markets.
            </span>
          </div>
          <p className="text-[10px] text-gray-300 mt-3 max-w-xl mx-auto">
            Used by freelancers across India to reach global clients without
            platforms.
          </p>
        </div>

        {/* Comparison Box */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-3xl mx-auto text-center shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">
            Why This Is Underpriced
          </h3>
          <div className="space-y-2 text-sm text-gray-500 mb-8">
            <p>
              ₹18,000-₹20,000/month — Similar International client databases
            </p>
            <p>₹5,000+/month — AI outreach tools alone</p>
          </div>

          <div className="bg-[#E8F5F3] p-4 rounded-xl mb-4">
            <p className="text-sm font-bold text-[#1C9988]">
              ClientSure combines both and starts at just{" "}
              <span className="text-[#F85E2E]">₹33/day</span>.
            </p>
          </div>
          <p className="text-xs text-gray-900 font-bold">
            One global client can recover your entire yearly cost.
          </p>
        </div>
      </div>
    </section>
  );
}
