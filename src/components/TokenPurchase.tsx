"use client";

import { useState, useEffect } from "react";
import { Coins, Zap, Star, Clock, ShoppingCart, X } from "lucide-react";
import Axios from "@/utils/Axios";
import { toast } from "sonner";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  description: string;
  isPopular: boolean;
  category: string;
  pricePerToken: string;
}

interface TokenPurchaseProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
  currentBalance: number;
}

export default function TokenPurchase({
  isOpen,
  onClose,
  onPurchaseComplete,
  currentBalance,
}: TokenPurchaseProps) {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await Axios.get("/tokens/packages");
      setPackages(response.data.packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load token packages");
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (packageId: string, packageName: string) => {
    try {
      setPurchasing(packageId);

      // Get user data for prefill
      const profileRes = await Axios.get("/auth/profile");
      const user = profileRes.data.user;

      const response = await Axios.post("/razorpay/create-token-order", {
        packageId,
        userId: user._id,
      });

      if (response.data.success) {
        const { key, amount, currency, orderId, transactionId } = response.data;

        const res = await loadRazorpay();
        if (!res) {
          toast.error("Razorpay SDK failed to load. Are you online?");
          setPurchasing(null);
          return;
        }

        const options = {
          key,
          amount,
          currency,
          name: "Token Purchase",
          description: `Purchase ${packageName}`,
          order_id: orderId,
          handler: async function (response: any) {
            try {
              const verifyResponse = await Axios.post(
                "/razorpay/verify-token-purchase",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  transactionId,
                },
              );

              if (verifyResponse.data.success) {
                toast.success("Tokens added successfully!");
                onPurchaseComplete();
              } else {
                toast.error("Payment verification failed");
              }
            } catch (err) {
              console.error("Verification error", err);
              toast.error("Payment verification failed");
            } finally {
              setPurchasing(null);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone,
          },
          theme: {
            color: "#3399cc",
          },
        };

        // @ts-ignore
        const rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function (response: any) {
          toast.error(response.error.description || "Payment failed");
          setPurchasing(null);
        });
        rzp1.open();
      } else {
        toast.error(response.data.error || "Failed to create purchase order");
        setPurchasing(null);
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.response?.data?.error || "Failed to initiate purchase");
      setPurchasing(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "emergency":
        return <Zap className="w-5 h-5 text-red-500" />;
      case "standard":
        return <Coins className="w-5 h-5 text-blue-500" />;
      case "premium":
        return <Star className="w-5 h-5 text-purple-500" />;
      case "bulk":
        return <ShoppingCart className="w-5 h-5 text-green-500" />;
      default:
        return <Coins className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "emergency":
        return "border-red-200 bg-red-50";
      case "standard":
        return "border-blue-200 bg-blue-50";
      case "premium":
        return "border-purple-200 bg-purple-50";
      case "bulk":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Buy More Tokens
            </h2>
            <p className="text-gray-600 mt-1">
              Current balance:{" "}
              <span className="font-semibold text-blue-600">
                {currentBalance} tokens
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading packages...</span>
            </div>
          ) : (
            <>
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Token Validity</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Extra tokens expire at midnight and reset with your daily
                  allowance.
                </p>
              </div>

              {/* Packages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative border-2 rounded-lg p-6 transition-all hover:shadow-lg ${getCategoryColor(pkg.category)} ${
                      pkg.isPopular
                        ? "ring-2 ring-blue-500 ring-opacity-50"
                        : ""
                    }`}
                  >
                    {/* Popular Badge */}
                    {pkg.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          POPULAR
                        </span>
                      </div>
                    )}

                    {/* Package Header */}
                    <div className="flex items-center justify-between mb-4">
                      {getCategoryIcon(pkg.category)}
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {pkg.category}
                      </span>
                    </div>

                    {/* Package Details */}
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {pkg.name}
                      </h3>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {pkg.tokens}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          tokens
                        </span>
                      </div>
                      <div className="text-xl font-semibold text-blue-600 mb-2">
                        ₹{pkg.price}
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹{pkg.pricePerToken}/token
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 text-center mb-6">
                      {pkg.description}
                    </p>

                    {/* Purchase Button */}
                    <button
                      onClick={() => handlePurchase(pkg.id, pkg.name)}
                      disabled={purchasing === pkg.id}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                        pkg.isPopular
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                      {purchasing === pkg.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          Buy Now
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Important Notes:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • Extra tokens are added to your current balance immediately
                  </li>
                  <li>• Unused extra tokens expire at midnight (1:00 AM)</li>
                  <li>• Your regular daily allowance resets every day</li>
                  <li>• Secure payment processing via Razorpay</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
