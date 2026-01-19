"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

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

        const databaseOrderId = response.data._id || paymentPayload.orderId; // Prefer DB ID from response

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
            color: "#3399cc",
          },
        };

        // @ts-ignore
        const rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function (response: any) {
          toast.error(response.error.description || "Payment failed");
        });
        rzp1.open();
      } else if (paymentPayload?.checkoutUrl) {
        // Fallback or PhonePe legacy if still used
        window.location.href = paymentPayload.checkoutUrl;
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

  const modalContent = (
    <div
      className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Complete Your Purchase
        </h2>

        {/* Plan Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {plan.name}
          </h3>
          <div className="flex gap-3">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
              ₹{plan.price}
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
              {plan.duration}
            </div>
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium">
              {plan.tokensPerDay}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-black font-semibold mb-3 text-lg">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-black bg-white"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-black font-semibold mb-3 text-lg">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-black bg-white"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-black font-semibold mb-3 text-lg">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-black bg-white"
              required
            />
          </div>

          {/* Referral Code */}
          <div>
            <label className="block text-black font-semibold mb-3 text-lg">
              Referral Code <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Enter referral code if you have one"
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
              className={`w-full px-5 py-4 border rounded-lg focus:outline-none focus:ring-2 text-lg text-black bg-white ${
                referralValidation.isValid === true
                  ? "border-green-500 focus:ring-green-500"
                  : referralValidation.isValid === false
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:ring-blue-500"
              }`}
            />
            {referralValidation.isChecking && (
              <p className="text-blue-600 text-sm mt-2">
                Validating referral code...
              </p>
            )}
            {referralValidation.isValid === true && (
              <p className="text-green-600 text-sm mt-2">
                ✓ Valid referral code from {referralValidation.referrerName}
              </p>
            )}
            {referralValidation.isValid === false && formData.referralCode && (
              <p className="text-red-600 text-sm mt-2">
                ✗ Invalid referral code
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
