import {
  Zap,
  Mail,
  MessageCircle,
  Linkedin,
  FileText,
  CheckCircle2,
  Users,
  FileCheck,
} from "lucide-react";

export default function AIAgents() {
  const agents = [
    {
      icon: <Mail className="w-6 h-6 text-[#1C9988]" />,
      title: "Email Outreach Generator",
      desc: "Create professional cold emails that get responses. Personalized for each client.",
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-[#1C9988]" />,
      title: "WhatsApp Message Creator",
      desc: "Craft friendly WhatsApp messages that start conversations naturally.",
    },
    {
      icon: <Linkedin className="w-6 h-6 text-[#1C9988]" />,
      title: "LinkedIn Message Builder",
      desc: "Write connection requests and messages that don't feel like spam.",
    },
    {
      icon: <FileText className="w-6 h-6 text-[#1C9988]" />,
      title: "Contract & Agreement Drafts",
      desc: "Generate professional contracts. Protect yourself. Look serious.",
    },
  ];

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 mb-20 items-center">
          {/* Left Header Area */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#FFF8E7] px-4 py-2 rounded-full mb-6 border border-[#FFE8B9]">
              <Zap className="w-4 h-4 text-[#B4822D]" />
              <span className="text-[#B4822D] font-bold text-xs uppercase tracking-wide">
                Included with All Plans
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              AI Agents That Would Cost You ₹5,000+/Month Elsewhere
            </h2>

            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Every ClientSure plan includes powerful AI agents. No extra
              charge. These agents help you reach out to clients faster and more
              professionally.
            </p>

            <div className="bg-[#E8F5F3] border border-[#CDE8E3] rounded-lg p-4 inline-flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#1C9988]" />
              <span className="text-gray-700 font-medium text-sm">
                Save hours every week. Close clients faster.
              </span>
            </div>
          </div>

          {/* Right Grid of Agents */}
          <div className="grid md:grid-cols-2 gap-6">
            {agents.map((agent, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all shadow-sm"
              >
                <div className="bg-[#E8F5F3] w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                  {agent.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{agent.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {agent.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Private Community */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#E8F5F3] p-2 rounded-lg">
                <Users className="w-6 h-6 text-[#1C9988]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Private Community
              </h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              A members-only space for serious freelancers. Share wins. Find
              collaborators. Get help.
            </p>
            <ul className="space-y-3">
              {[
                "Success stories and client wins",
                "Collaboration opportunities",
                "Direct messages with members",
                "No spam. Only paid members.",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="w-1.5 h-1.5 bg-[#1C9988] rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Practical Resources */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFF8E7] p-2 rounded-lg border border-[#FFE8B9]">
                <FileCheck className="w-6 h-6 text-[#B4822D]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Practical Resources
              </h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Real tools and guides focused on closing clients. Not theory.
              Action.
            </p>
            <ul className="space-y-3">
              {[
                "PDF guides and checklists",
                "Video walkthroughs",
                "Ready-to-use templates",
                "Client closing strategies",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="w-1.5 h-1.5 bg-[#F85E2E] rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
