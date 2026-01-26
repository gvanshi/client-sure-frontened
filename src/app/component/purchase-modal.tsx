import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Axios from "../../utils/Axios";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: string;
    duration: string;
    tokensPerDay: string;
    bonusTokens: number;
  };
}

export default function PurchaseModal({
  isOpen,
  onClose,
  plan,
}: PurchaseModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    referralCode: "",
  });
  const [referralValidation, setReferralValidation] = useState<{
    isValid: boolean | null;
    referrerName: string | null;
    isChecking: boolean;
  }>({ isValid: null, referrerName: null, isChecking: false });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Store user data in localStorage for payment flow
      localStorage.setItem("pendingUserEmail", formData.email);
      localStorage.setItem("pendingUserName", formData.fullName);

      const response = await Axios.post("/payments/create-order", {
        planId: plan.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        planPrice: plan.price,
        planName: plan.name,
        referralCode: formData.referralCode || null,
      });

      const { paymentPayload } = response.data;

      if (paymentPayload && paymentPayload.key) {
        const res = await loadRazorpay();

        if (!res) {
          toast.error("Razorpay SDK failed to load. Are you online?");
          return;
        }

        const databaseOrderId = response.data._id || paymentPayload.orderId;

        const options = {
          key: paymentPayload.key,
          amount: paymentPayload.amount,
          currency: paymentPayload.currency,
          name: "ClientSure",
          description: `Subscription for ${plan.name}`,
          order_id: paymentPayload.orderId,
          handler: async function (response: any) {
            try {
              const verifyResponse = await Axios.post(
                "/razorpay/verify-subscription",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: databaseOrderId,
                },
              );

              if (verifyResponse.data.success) {
                if (verifyResponse.data.token) {
                  localStorage.removeItem("adminToken");
                  localStorage.setItem("userToken", verifyResponse.data.token);
                  if (verifyResponse.data.user) {
                    localStorage.setItem(
                      "userData",
                      JSON.stringify(verifyResponse.data.user),
                    );
                  }
                }
                window.location.href = `/payment-success?orderId=${databaseOrderId}`;
              } else {
                toast.error("Payment verification failed");
              }
            } catch (err) {
              console.error("Verification error", err);
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
          },
          notes: {
            address: "ClientSure Corporate Office",
          },
          theme: {
            color: "#1C9988",
          },
        };

        // @ts-ignore
        const rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function (response: any) {
          toast.error(response.error.description || "Payment failed");
        });
        rzp1.open();
      } else {
        toast.error("Invalid payment configuration received from server");
      }
    } catch (error: any) {
      console.error("Order creation failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            {/* Modal Content */}
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  Complete Your Purchase
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto">
                {/* Plan Details */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {plan.name}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg font-medium text-sm">
                      {plan.price}
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-medium text-sm">
                      {plan.duration}
                    </div>
                    <div className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg font-medium text-sm">
                      {plan.tokensPerDay}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1C9988] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1C9988] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1C9988] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referral Code{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter referral code"
                      value={formData.referralCode}
                      onChange={async (e) => {
                        const code = e.target.value.toUpperCase();
                        setFormData({ ...formData, referralCode: code });

                        if (code.length >= 6) {
                          setReferralValidation({
                            isValid: null,
                            referrerName: null,
                            isChecking: true,
                          });
                          try {
                            const response = await Axios.get(
                              `/referrals/validate/${code}`,
                            );
                            if (response.data.valid) {
                              setReferralValidation({
                                isValid: true,
                                referrerName: response.data.referrer.name,
                                isChecking: false,
                              });
                            } else {
                              setReferralValidation({
                                isValid: false,
                                referrerName: null,
                                isChecking: false,
                              });
                            }
                          } catch (error) {
                            setReferralValidation({
                              isValid: false,
                              referrerName: null,
                              isChecking: false,
                            });
                          }
                        } else {
                          setReferralValidation({
                            isValid: null,
                            referrerName: null,
                            isChecking: false,
                          });
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all ${
                        referralValidation.isValid === true
                          ? "border-green-500 focus:ring-green-500"
                          : referralValidation.isValid === false
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-200 focus:ring-[#1C9988]"
                      }`}
                    />
                    {referralValidation.isChecking && (
                      <p className="text-[#1C9988] text-xs mt-1">
                        Validating referral code...
                      </p>
                    )}
                    {referralValidation.isValid === true && (
                      <p className="text-green-600 text-xs mt-1">
                        ✓ Valid referral code from{" "}
                        {referralValidation.referrerName}
                      </p>
                    )}
                    {referralValidation.isValid === false &&
                      formData.referralCode && (
                        <p className="text-red-600 text-xs mt-1">
                          ✗ Invalid referral code
                        </p>
                      )}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 bg-[#1C9988] text-white rounded-lg hover:bg-[#158f7f] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? "Processing..." : "Proceed to Payment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
