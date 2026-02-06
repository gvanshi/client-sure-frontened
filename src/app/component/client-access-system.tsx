import {
  Building2,
  Mail,
  Phone,
  Facebook,
  Linkedin,
  MapPin,
  Globe,
  Users,
  Send,
  MessageSquare,
  Share2,
} from "lucide-react";

export default function ClientAccessSystem() {
  const clientData = [
    {
      icon: <Building2 className="w-5 h-5 text-[#1C9988]" />,
      label: "Company Name",
      value: "Apex Digital Solutions",
    },
    {
      icon: <Mail className="w-5 h-5 text-[#1C9988]" />,
      label: "Business Email",
      value: "hello@apexdigital.com",
    },
    {
      icon: <Phone className="w-5 h-5 text-[#1C9988]" />,
      label: "Phone Number",
      value: "+1 (555) 123-4567",
    },
    {
      icon: <Facebook className="w-5 h-5 text-[#1C9988]" />,
      label: "Facebook Page",
      value: "fb.com/apexdigital",
    },
    {
      icon: <Users className="w-5 h-5 text-[#1C9988]" />, // Using Users as proxy for Instagram if generic, or could import Instagram
      label: "Instagram Profile",
      value: "@apexdigitalhq",
    },
    {
      icon: <Linkedin className="w-5 h-5 text-[#1C9988]" />,
      label: "LinkedIn Profile",
      value: "linkedin.com/company/apex",
    },
    {
      icon: <MapPin className="w-5 h-5 text-[#1C9988]" />,
      label: "City / Location",
      value: "Austin, Texas",
    },
    {
      icon: <Globe className="w-5 h-5 text-[#1C9988]" />,
      label: "Country",
      value: "United States",
    },
    {
      icon: <Share2 className="w-5 h-5 text-[#1C9988]" />,
      label: "Industry",
      value: "Digital Marketing",
    },
  ];

  const outreachBenefits = [
    {
      icon: <Mail className="w-5 h-5 text-[#1C9988]" />,
      text: "Send personalized cold emails",
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-[#1C9988]" />,
      text: "Connect via WhatsApp",
    },
    {
      icon: <Linkedin className="w-5 h-5 text-[#1C9988]" />,
      text: "Reach out on LinkedIn",
    },
    {
      icon: <Share2 className="w-5 h-5 text-[#1C9988]" />,
      text: "Engage on social media",
    },
  ];

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[#1C9988] font-bold tracking-wider text-sm uppercase mb-4 block">
            What is ClientSure?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            A Global Client Access System
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Not just leads. Not just a database.
            <br />
            Verified business profiles from multiple countries. Full contact
            details. Direct access.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Data Points */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Every Unlocked Client Includes:
            </h3>
            <p className="text-gray-500 mb-8">
              Complete business information. Ready for direct outreach via
              Email, WhatsApp, LinkedIn, or Social Media.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {clientData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
                >
                  <div className="bg-[#E8F5F3] p-2.5 rounded-lg shrink-0">
                    {item.icon}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-gray-900 mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Outreach Benefits */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-[#E8F5F3] p-3 rounded-full">
                <Globe className="w-6 h-6 text-[#1C9988]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  Direct Outreach Made Simple
                </h4>
                <p className="text-sm text-gray-500">
                  No middlemen. No bidding.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {outreachBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl"
                >
                  {benefit.icon}
                  <span className="text-gray-600 font-medium text-sm">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[#F2F9F8] p-4 rounded-xl text-center">
              <p className="text-sm font-medium text-[#1C9988]">
                No commissions.{" "}
                <span className="text-gray-600">
                  Keep 100% of what you earn.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
