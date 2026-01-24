import {
  UserPlus,
  Search,
  Unlock,
  MessageSquare,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <UserPlus className="w-5 h-5 text-[#1C9988]" />,
      title: "Create Your Account",
      desc: "Sign up in 2 minutes. Choose any plan below to proceed. Get 100 tokens instantly.",
    },
    {
      number: "02",
      icon: <Search className="w-5 h-5 text-[#1C9988]" />,
      title: "Find Your Ideal Clients",
      desc: "Browse by country, city, or industry. See company names and categories before unlocking.",
    },
    {
      number: "03",
      icon: <Unlock className="w-5 h-5 text-[#1C9988]" />,
      title: "Unlock Full Details",
      desc: "Use 1 token to reveal complete contact info. Email, phone, social profiles — all yours forever.",
    },
    {
      number: "04",
      icon: <MessageSquare className="w-5 h-5 text-[#1C9988]" />,
      title: "Reach Out Directly",
      desc: "Use our AI tools to craft personalized messages. Email, WhatsApp, or LinkedIn — your choice.",
    },
  ];

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#1C9988] font-bold tracking-wider text-xs uppercase mb-4 block">
            HOW IT WORKS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            From Signup to First Client
          </h2>
          <p className="text-gray-500">
            Four simple steps. No complicated setup.
            <br />
            Start reaching global clients in minutes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-full hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-3xl font-bold text-gray-200">
                    {step.number}
                  </span>
                  <div className="bg-[#E8F5F3] p-2.5 rounded-lg">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Arrow Connector (Desktop Only) - Not shown for last item */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 bg-white p-1 rounded-full border border-gray-100 transform -translate-y-1/2 text-gray-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 bg-[#E8F5F3] px-6 py-3 rounded-full">
            <Zap className="w-4 h-4 text-yellow-500 fill-current" />
            <p className="text-sm text-gray-700">
              Average time from signup to first outreach:{" "}
              <span className="font-bold text-[#1C9988]">Under 10 minutes</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
