"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Target, Coins, Plus, Zap, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProfileSidebar from "../components/ProfileSidebar";
import TokenPurchase from "../../../../components/TokenPurchase";
import Axios from "@/utils/Axios";
import BackButton from "../../components/BackButton";

interface TokenData {
  monthlyTotal: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  totalUsed: number;
  daily: number;
  dailyLimit: number;
  dailyUsed: number;
  // Bonus tokens
  bonusTokens?: number;
  bonusTokensInitial?: number;
  bonusTokensUsed?: number;
  bonusTokensGrantedAt?: string;
  // Purchased tokens
  purchasedTokens?: {
    current: number;
    total: number;
    used: number;
  };
  // Prize tokens
  prizeTokens?: number;
  prizeTokenType?: string;
  prizeTokenExpiresAt?: string;
}

interface TokenBalance {
  total: number;
  regular: number;
  extra: number;
  used: number;
  dailyLimit: number;
  hasExtraTokens: boolean;
}

interface QuickPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
}

const calculatePercentage = (current: number, total: number) => {
  if (total === 0) return "0.0";
  const percentage = (current / total) * 100;

  

  // If we have remaining tokens < total but percentage rounds to 100, show 99.9
  if (current < total && percentage > 99.9) {
    return "99.9";
  }
  return percentage.toFixed(1);
};

export default function TokenUsagePage() {
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [quickPackages, setQuickPackages] = useState<QuickPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const router = useRouter();

  const loadTokenData = async () => {
    try {
      const [profileResponse, balanceResponse, packagesResponse] =
        await Promise.all([
          Axios.get("/auth/profile"),
          Axios.get("/tokens/balance"),
          Axios.get("/tokens/packages"),
        ]);

      setTokens(profileResponse.data.tokens);
      setTokenBalance(balanceResponse.data.balance);

      // Store subscription info for total plan tokens calculation
      const subscription = profileResponse.data.subscription;
      if (subscription?.plan) {
        setSubscriptionData({
          planName: subscription.plan.name,
          durationDays: subscription.plan.durationDays,
          bonusTokens: subscription.plan.bonusTokens,
          daysRemaining: subscription.daysRemaining,
          totalPlanTokens:
            subscription.plan.dailyTokens * subscription.plan.durationDays +
            (subscription.plan.bonusTokens || 0),
        });
      }

      // Get all packages for quick top-up
      const packages = packagesResponse.data.packages;
      setQuickPackages(packages);
    } catch (error) {
      console.error("Error loading token data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseComplete = () => {
    setShowPurchaseModal(false);
    loadTokenData(); // Refresh data after purchase
  };

  useEffect(() => {
    loadTokenData();

    // Check for purchase status in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseStatus = urlParams.get("purchase");
    const tokensAdded = urlParams.get("tokens");

    if (purchaseStatus === "success") {
      toast.success(
        `🎉 Token purchase successful! ${tokensAdded || ""} tokens added to your account.`,
      );
    } else if (purchaseStatus === "cancelled") {
      toast.info("🚫 Payment cancelled. No charges were made.");
    } else if (purchaseStatus === "failed") {
      toast.error("❌ Payment failed. Please try again or contact support.");
    } else if (purchaseStatus === "error") {
      toast.error("⚠️ Payment processing error. Please try again.");
    }

    // Clean URL if any purchase status exists
    if (purchaseStatus) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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
      <div
        className={`${showPurchaseModal ? "blur-sm" : ""} transition-all duration-300`}
      >
        <Navbar />

        <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
          <ProfileSidebar />

          <div className="flex-1 p-4 md:p-8 bg-gray-50">
            <div className="mb-4">
              <BackButton />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-2">
              <Target className="w-6 h-6 text-blue-600" />
              <span>Token Usage</span>
            </h1>

            {/* Comprehensive Token Overview Section */}
            {tokens && subscriptionData && (
              <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-lg border border-blue-100 p-6 md:p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                      Token Overview
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Complete breakdown of your token allocation
                    </p>
                  </div>
                  <div className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    {subscriptionData.daysRemaining} days left
                  </div>
                </div>

                {/* Primary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* Total Plan Tokens */}
                  <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 border border-blue-100">
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      Total Plan Tokens
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
                      {subscriptionData.totalPlanTokens.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {subscriptionData.durationDays} day plan
                    </div>
                  </div>

                  {/* Plan Tokens Remaining */}
                  <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 border border-green-100">
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      Plan Tokens Left
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
                      {(
                        tokens.monthlyRemaining + (tokens.bonusTokens || 0)
                      ).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {calculatePercentage(
                        tokens.monthlyRemaining + (tokens.bonusTokens || 0),
                        subscriptionData.totalPlanTokens,
                      )}
                    </div>
                  </div>

                  {/* Bonus Tokens */}
                  {(tokens.bonusTokens || 0) > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 border border-yellow-100">
                      <div className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1">
                        <span>Bonus Tokens</span>
                        <span className="text-yellow-500">✨</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-yellow-600 mb-1">
                        {tokens.bonusTokens?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tokens.bonusTokensUsed}/{tokens.bonusTokensInitial}{" "}
                        used
                      </div>
                    </div>
                  )}

                  {/* Daily Tokens */}
                  <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 border border-indigo-100">
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      Daily Tokens
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-1">
                      {tokens.daily}
                    </div>
                    <div className="text-xs text-gray-500">
                      of {tokens.dailyLimit}
                    </div>
                  </div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Purchased Tokens */}
                  {tokens.purchasedTokens &&
                    tokens.purchasedTokens.current > 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-3 border border-orange-100">
                        <div className="text-xs text-gray-500 mb-1 font-medium">
                          Purchased
                        </div>
                        <div className="text-lg font-bold text-orange-600">
                          {tokens.purchasedTokens.current.toLocaleString()}
                        </div>
                      </div>
                    )}

                  {/* Prize Tokens */}
                  {(tokens.prizeTokens || 0) > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-3 border border-pink-100">
                      <div className="text-xs text-gray-500 mb-1 font-medium">
                        Prize 🎉
                      </div>
                      <div className="text-lg font-bold text-pink-600">
                        {tokens.prizeTokens}
                      </div>
                    </div>
                  )}

                  {/* Total Used */}
                  <div className="bg-white rounded-lg shadow-sm p-3 border border-purple-100">
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      Total Used
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {tokens.totalUsed.toLocaleString()}
                    </div>
                  </div>

                  {/* Used Today */}
                  <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      Used Today
                    </div>
                    <div className="text-lg font-bold text-gray-700">
                      {tokens.dailyUsed}
                    </div>
                  </div>
                </div>

                {/* Plan Info Bar */}
                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-xs text-blue-600 font-medium">
                          Current Plan
                        </div>
                        <div className="text-lg font-bold text-blue-900">
                          {subscriptionData.planName}
                        </div>
                      </div>
                      {subscriptionData.bonusTokens &&
                        subscriptionData.bonusTokens > 0 && (
                          <div className="bg-yellow-100 px-3 py-1 rounded-full">
                            <span className="text-xs font-semibold text-yellow-700">
                              +{subscriptionData.bonusTokens.toLocaleString()}{" "}
                              Bonus
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tokens && (
              <div className="space-y-8">
                {/* Low Balance Warning & Purchase Button */}
                {tokens.daily < 10 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-orange-900">
                            Low Token Balance
                          </h3>
                          <p className="text-orange-700 text-sm">
                            You have {tokens.daily} tokens remaining. Buy more
                            to continue accessing leads.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPurchaseModal(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Buy Tokens
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                      {/* Current Balance Side */}
                      <div className="p-6 bg-blue-50/30">
                        <h3 className="text-lg font-semibold text-blue-900 mb-6 flex items-center">
                          <Coins className="w-5 h-5 mr-2" />
                          Token Balance
                        </h3>

                        <div className="text-center mb-8">
                          <div className="text-5xl font-bold text-blue-600 mb-2">
                            {tokens.daily}
                            <span className="text-xl text-gray-400 font-normal">
                              /{tokens.dailyLimit}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Available Daily Tokens
                          </div>

                          <div className="mt-6 max-w-xs mx-auto">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Usage</span>
                              <span>
                                {Math.round(
                                  (tokens.daily / tokens.dailyLimit) * 100,
                                )}
                                %
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min((tokens.daily / tokens.dailyLimit) * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {tokenBalance && (
                          <div className="bg-white rounded-lg border border-blue-100 p-4">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Regular Balance
                                </span>
                                <span className="font-medium">
                                  {tokenBalance.regular}
                                </span>
                              </div>
                              {tokenBalance.hasExtraTokens && (
                                <div className="flex justify-between text-orange-600">
                                  <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> Extra
                                  </span>
                                  <span className="font-medium">
                                    +{tokenBalance.extra}
                                  </span>
                                </div>
                              )}
                              <div className="pt-2 border-t border-gray-100 flex justify-between">
                                <span className="text-gray-900 font-medium">
                                  Total Available
                                </span>
                                <span className="font-bold text-blue-600">
                                  {tokens.daily}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quick Top-Up Side */}
                      <div className="p-6 bg-purple-50/30">
                        <h3 className="text-lg font-semibold text-purple-900 mb-6 flex items-center">
                          <Zap className="w-5 h-5 mr-2" />
                          Quick Top-Up
                        </h3>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {quickPackages.map((pkg) => (
                            <button
                              key={pkg.id}
                              onClick={() => setShowPurchaseModal(true)}
                              className="flex flex-col items-center justify-center p-3 bg-white border border-purple-100 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group text-center"
                            >
                              <span className="text-lg font-bold text-purple-600 group-hover:scale-110 transition-transform">
                                {pkg.tokens}
                              </span>
                              <span className="text-xs text-gray-500 mb-1">
                                tokens
                              </span>
                              <span className="text-sm font-semibold text-gray-900 bg-purple-50 px-2 py-0.5 rounded-full">
                                ₹{pkg.price}
                              </span>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setShowPurchaseModal(true)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          View All Packages
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-6">
                    Usage Efficiency
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 font-medium">
                          Monthly Usage
                        </span>
                        <span className="font-semibold text-blue-600">
                          {(
                            (tokens.monthlyUsed / tokens.monthlyTotal) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${(tokens.monthlyUsed / tokens.monthlyTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {tokens.monthlyUsed} of {tokens.monthlyTotal} tokens
                        used
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 font-medium">
                          Daily Usage
                        </span>
                        <span className="font-semibold text-green-600">
                          {(
                            (tokens.dailyUsed / tokens.dailyLimit) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${(tokens.dailyUsed / tokens.dailyLimit) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {tokens.dailyUsed} of {tokens.dailyLimit} tokens used
                        today
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

      {/* Token Purchase Modal */}
      <TokenPurchase
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseComplete={handlePurchaseComplete}
        currentBalance={tokens?.daily || 0}
      />
    </div>
  );
}
