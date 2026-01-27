"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Calendar, Award } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProfileSidebar from "../components/ProfileSidebar";
import Axios from "@/utils/Axios";
import BackButton from "../../components/BackButton";

interface SubscriptionData {
  plan: {
    id: string;
    name: string;
    price: number;
    durationDays?: number;
    dailyTokens?: number;
    bonusTokens?: number;
  } | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  daysRemaining?: number;
}

interface TokenData {
  monthlyTotal: number;
  dailyLimit: number;
  monthlyRemaining: number;
  bonusTokens?: number;
  bonusTokensInitial?: number;
  bonusTokensUsed?: number;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    try {
      const response = await Axios.get("/auth/profile");
      setSubscription(response.data.subscription);
      setTokens(response.data.tokens);
    } catch (error) {
      console.error("Error loading subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <ProfileSidebar />

        <div className="flex-1 p-4 md:p-8 bg-gray-50">
          <div className="mb-4">
            <BackButton />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Subscription Plan</span>
          </h1>

          {/* Comprehensive Subscription Overview */}
          {subscription?.plan && (
            <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl shadow-lg border border-purple-100 p-6 md:p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                    Subscription Overview
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Your current plan details and token allocation
                  </p>
                </div>
                <div className="hidden md:block">
                  <div
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      subscription.isActive
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {subscription.isActive ? "✓ Active" : "✗ Inactive"}
                  </div>
                </div>
              </div>

              {/* Plan Header Card */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <div className="text-sm font-medium text-purple-100 mb-1">
                      Current Plan
                    </div>
                    <div className="text-3xl md:text-4xl font-bold mb-2">
                      {subscription.plan.name}
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="text-2xl font-bold">
                        ₹{subscription.plan.price}
                      </span>
                      {subscription.plan.durationDays && (
                        <span className="text-sm text-purple-100">
                          / {subscription.plan.durationDays} days
                        </span>
                      )}
                    </div>
                  </div>
                  {subscription.plan.bonusTokens &&
                    subscription.plan.bonusTokens > 0 && (
                      <div className="bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3 text-center">
                        <div className="text-sm font-medium text-purple-100">
                          Bonus Tokens
                        </div>
                        <div className="text-3xl font-bold">
                          +{subscription.plan.bonusTokens.toLocaleString()}
                        </div>
                        <div className="text-xs text-purple-100">
                          One-time grant
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Total Plan Tokens */}
                {subscription.plan.durationDays &&
                  subscription.plan.dailyTokens && (
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1 font-medium">
                        Total Plan Tokens
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {(
                          subscription.plan.dailyTokens *
                            subscription.plan.durationDays +
                          (subscription.plan.bonusTokens || 0)
                        ).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Full allocation
                      </div>
                    </div>
                  )}

                {/* Days Remaining */}
                {subscription.daysRemaining !== undefined && (
                  <div className="bg-white rounded-xl shadow-sm p-4 border border-purple-100">
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      Days Remaining
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {subscription.daysRemaining}
                    </div>
                    <div className="text-xs text-gray-500">Until expiry</div>
                  </div>
                )}

                {/* Daily Tokens */}
                {subscription.plan.dailyTokens && (
                  <div className="bg-white rounded-xl shadow-sm p-4 border border-green-100">
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      Daily Tokens
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {subscription.plan.dailyTokens}
                    </div>
                    <div className="text-xs text-gray-500">Per day</div>
                  </div>
                )}

                {/* Bonus Tokens */}
                {tokens?.bonusTokens !== undefined &&
                  tokens.bonusTokens > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-yellow-100">
                      <div className="text-xs text-gray-500 mb-1 font-medium">
                        Bonus Available
                      </div>
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {tokens.bonusTokens.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Remaining</div>
                    </div>
                  )}
              </div>

              {/* Subscription Timeline */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Started</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(subscription.startDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Expires</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(subscription.endDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
