import { Quote, Star } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      q: "Sent my first email using ClientSure. Got a reply in 2 days.",
      author: "Rohit",
      role: "Web Designer, Delhi",
    },
    {
      q: "No bidding. No commissions. Direct WhatsApp works.",
      author: "Ankit",
      role: "Agency Owner, Jaipur",
    },
    {
      q: "Didn't expect this at this price. Very clean data.",
      author: "Neha",
      role: "Marketing Consultant, Pune",
    },
  ];

  return (
    <section className="bg-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Main Highlight Card */}
        <div className="bg-[#E8F5F3] rounded-3xl p-10 md:p-16 text-center mb-12 shadow-sm border border-[#d0e8e4]">
          <div className="flex justify-center mb-6 opacity-30">
            <Quote className="w-12 h-12 text-[#1C9988]" fill="currentColor" />
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-normal">
            I sent 15 emails.
            <br />
            Got 3 replies.
            <br />
            <span className="text-[#1C9988]">
              Closed my first international client.
            </span>
          </h3>

          <p className="text-gray-500 font-medium text-sm">
            — Vikram S., Graphic Designer, Mumbai
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow"
            >
              <Star className="w-5 h-5 text-yellow-400 mb-4 fill-current" />
              <p className="text-gray-800 font-medium text-sm mb-4 leading-relaxed">
                "{review.q}"
              </p>
              <div className="mt-auto pt-2">
                <p className="text-xs font-bold text-gray-900">
                  {review.author}{" "}
                  <span className="text-gray-400 font-normal">
                    ({review.role})
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
