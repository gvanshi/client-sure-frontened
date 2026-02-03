"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Lock,
  FileText,
  Play,
  AlertTriangle,
  Database,
  Users,
  ExternalLink,
  MessageCircle,
  Bot,
  Zap,
  Plus,
  X,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VideoViewer from "@/components/VideoViewer";
import ResourceModal from "@/components/ResourceModal";
import Axios from "@/utils/Axios";

export const dynamic = "force-dynamic";

interface UserStats {
  tokens: number;
  tokensUsedTotal: number;
  tokensUsedToday: number;
  dailyTokens: number;
  totalAvailable?: number;
  // Bonus Tokens
  bonusTokens: number;
  bonusTokensInitial: number;
  bonusTokensUsed: number;
  // Purchased Tokens
  purchasedTokens: number;
  purchasedTokensTotal: number;
  // Prize Tokens
  prizeTokens?: number;
  prizeTokenType?: string;
  prizeTokenExpiresAt?: string;
  dailyLimit?: number;
  // Plan Info
  planBonusTokens?: number;
  planDailyTokens?: number;
  planDurationDays?: number;
  totalPlanTokens: number;
  totalPlanTokensRemaining: number;
  daysRemaining: number;
  monthlyTokens: {
    total: number;
    used: number;
    remaining: number;
  };
  subscription: {
    isActive: boolean;
    planName?: string;
    endDate?: string;
    monthlyAllocation: number;
  };
}

interface Resource {
  id: string;
  title: string;
  type: string;
  description: string;
  thumbnailUrl?: string;
  url?: string;
  isAccessedByUser: boolean;
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

function DashboardContent() {
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLowTokenAlert, setShowLowTokenAlert] = useState(false);
  const [pdfFilter, setPdfFilter] = useState<"all" | "accessed" | "unaccessed">(
    "all",
  );
  const [videoFilter, setVideoFilter] = useState<
    "all" | "accessed" | "unaccessed"
  >("all");
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const searchParams = useSearchParams();

  // ... (state definitions kept as is)

  useEffect(() => {
    // Check for new subscription
    const newSubscription = searchParams?.get("newSubscription");
    if (newSubscription === "true") {
      setShowWelcome(true);
      toast.success(
        "🎉 Welcome! Your subscription is now active. Enjoy your premium resources!",
      );

      // Clear localStorage after successful login
      if (typeof window !== "undefined") {
        localStorage.removeItem("pendingUserEmail");
        localStorage.removeItem("pendingUserName");
      }
    }
  }, [searchParams]);

  const loadUserStats = async () => {
    try {
      const response = await Axios.get("/auth/profile");
      const tokens = response.data.tokens;
      const subscription = response.data.subscription;
      const plan = subscription?.plan;

      // Calculate total plan tokens and remaining
      const dailyTokens = plan?.dailyTokens || 0;
      const durationDays = plan?.durationDays || 0;
      const bonusTokens = plan?.bonusTokens || 0;
      
      const totalPlanTokens = plan
        ? (dailyTokens * durationDays) + bonusTokens
        : 0;
      const totalPlanTokensRemaining =
        (tokens?.monthlyRemaining || 0) + (tokens?.bonusTokens || 0);

      const newStats: UserStats = {
        tokens: tokens?.effectiveTokens || tokens?.daily || 0,
        dailyTokens: tokens?.dailyLimit || 100,
        totalAvailable: tokens?.daily || 0,
        // Bonus tokens
        bonusTokens: tokens?.bonusTokens || 0,
        bonusTokensInitial: tokens?.bonusTokensInitial || 0,
        bonusTokensUsed: tokens?.bonusTokensUsed || 0,
        // Purchased tokens
        purchasedTokens: tokens?.purchasedTokens?.current || 0,
        purchasedTokensTotal: tokens?.purchasedTokens?.total || 0,
        // Prize tokens
        prizeTokens: tokens?.prizeTokens || 0,
        prizeTokenType: tokens?.prizeTokenType,
        prizeTokenExpiresAt: tokens?.prizeTokenExpiresAt,
        tokensUsedTotal: tokens?.totalUsed || 0,
        tokensUsedToday: tokens?.dailyUsed || 0,
        dailyLimit: tokens?.dailyLimit || 100,
        // Plan info
        planBonusTokens: plan?.bonusTokens || 0,
        planDailyTokens: plan?.dailyTokens || 0,
        planDurationDays: plan?.durationDays || 0,
        totalPlanTokens,
        totalPlanTokensRemaining,
        daysRemaining: subscription?.daysRemaining || 0,
        monthlyTokens: {
          total: tokens?.monthlyTotal || 0,
          used: tokens?.monthlyUsed || 0,
          remaining: tokens?.monthlyRemaining || 0,
        },
        subscription: {
          isActive: subscription?.isActive || false,
          planName: plan?.name,
          endDate: subscription?.endDate,
          monthlyAllocation: tokens?.monthlyTotal || 0,
        },
      };

      // Check for low tokens (0 or very low)
      if (newStats.tokens <= 0 && newStats.subscription.isActive) {
        setShowLowTokenAlert(true);
      }

      setUserStats(newStats);
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const loadResources = async () => {
    try {
      const response = await Axios.get("/resources");
      // Backend returns array directly, not wrapped in {resources: [...]}
      const resourcesData = Array.isArray(response.data)
        ? response.data
        : response.data?.resources || [];
      // Map _id to id for frontend compatibility
      const mappedResources = resourcesData.map(
        (r: Resource & { _id?: string }) => ({
          ...r,
          id: r._id || r.id,
        }),
      );
      setResources(mappedResources);
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccessResource = async (resourceId: string) => {
    try {
      const response = await Axios.post(`/auth/access/${resourceId}`);
      await loadUserStats();

      if (response.data?.resource?.url) {
        window.open(response.data.resource.url, "_blank");
      }

      toast.success("Resource accessed successfully!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to access resource";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    loadUserStats();
    loadResources();
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const getFilteredResources = (type: "pdf" | "video") => {
    const filter = type === "pdf" ? pdfFilter : videoFilter;
    return resources.filter((r) => {
      if (r.type !== type) return false;
      if (filter === "accessed") return r.isAccessedByUser;
      if (filter === "unaccessed") return !r.isAccessedByUser;
      return true;
    });
  };

  const filteredPdfs = getFilteredResources("pdf");
  const filteredVideos = getFilteredResources("video");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Low Token Alert Popup */}
      {showLowTokenAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowLowTokenAlert(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tokens Exhausted!
              </h3>
              <p className="text-gray-600 mb-6">
                You've used all your daily tokens. Purchase more tokens to
                continue accessing leads and resources.
              </p>

              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-orange-700">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold">
                    Current Balance: {userStats?.tokens || 0} tokens
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowLowTokenAlert(false);
                    handleNavigation("/user/profile/tokens");
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Buy More Tokens
                </button>

                <button
                  onClick={() => setShowLowTokenAlert(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                💡 Tokens reset daily at 1:00 AM
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Message for New Subscribers */}
        {showWelcome && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <div className="text-green-600 text-3xl mr-4">🎉</div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Welcome to ClientSure Premium!
                </h3>
                <p className="text-green-700 mb-3">
                  Your subscription is now active! You can now access all
                  premium resources and start growing your business.
                </p>
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Premium Resources Unlocked
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Monthly Tokens Allocated
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comprehensive Token Metrics Section */}
        {userStats && (
          <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-lg border border-blue-100 p-8 mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Token Overview
                </h2>
                <p className="text-gray-600 text-sm">
                  Complete breakdown of your token allocation and usage
                </p>
              </div>
              <div className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                {userStats.daysRemaining} days remaining
              </div>
            </div>

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {/* Total Plan Tokens */}
              <div className="bg-white rounded-xl shadow-sm p-5 border border-blue-100">
                <div className="text-xs text-gray-500 mb-1 font-medium">
                  Total Plan Tokens
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {userStats.totalPlanTokens.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {userStats.planDurationDays} days @ {userStats.planDailyTokens}/day
                </div>
              </div>

              {/* Plan Tokens Remaining */}
              <div className="bg-white rounded-xl shadow-sm p-5 border border-green-100">
                <div className="text-xs text-gray-500 mb-1 font-medium">
                  Plan Tokens Left
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {userStats.totalPlanTokensRemaining.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {calculatePercentage(
                    userStats.totalPlanTokensRemaining,
                    userStats.totalPlanTokens,
                  )}
                  % remaining
                </div>
              </div>

              {/* Daily Tokens */}
              <div className="bg-white rounded-xl shadow-sm p-5 border border-indigo-100">
                <div className="text-xs text-gray-500 mb-1 font-medium">
                  Daily Tokens
                </div>
                <div className="text-3xl font-bold text-indigo-600 mb-1">
                  {userStats.tokens}
                </div>
                <div className="text-xs text-gray-500">
                  of {userStats.dailyLimit} available
                </div>
              </div>

              {/* Bonus Tokens */}
              <div className="bg-white rounded-xl shadow-sm p-5 border border-yellow-100">
                <div className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1">
                  <span>Bonus Tokens</span>
                  <span className="text-yellow-500">✨</span>
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {userStats.bonusTokens.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {userStats.bonusTokensUsed}/{userStats.bonusTokensInitial}{" "}
                  used
                </div>
              </div>

              {/* Token Usage */}
              <div className="bg-white rounded-xl shadow-sm p-5 border border-purple-100">
                <div className="text-xs text-gray-500 mb-1 font-medium">
                  Total Used
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {userStats.tokensUsedTotal.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {userStats.tokensUsedToday} today
                </div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Monthly Tokens */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="text-xs text-gray-500 mb-2 font-medium">
                  Monthly Allocation
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {userStats.monthlyTokens.total.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {userStats.monthlyTokens.remaining.toLocaleString()} left
                </div>
              </div>

              {/* Purchased Tokens */}
              {userStats.purchasedTokens > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100">
                  <div className="text-xs text-gray-500 mb-2 font-medium">
                    Purchased Tokens
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    {userStats.purchasedTokens.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Extra tokens</div>
                </div>
              )}

              {/* Prize Tokens */}
              {(userStats.prizeTokens || 0) > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-pink-100">
                  <div className="text-xs text-gray-500 mb-2 font-medium">
                    Prize Tokens 🎉
                  </div>
                  <div className="text-xl font-bold text-pink-600">
                    {userStats.prizeTokens}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {userStats.prizeTokenType}
                  </div>
                </div>
              )}

              {/* Effective Tokens */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-teal-100">
                <div className="text-xs text-gray-500 mb-2 font-medium">
                  Effective Total
                </div>
                <div className="text-xl font-bold text-teal-600">
                  {userStats.tokens}
                </div>
                <div className="text-xs text-gray-600 mt-1">Available now</div>
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
                      {userStats.subscription.planName}
                    </div>
                  </div>
                  {userStats.planBonusTokens &&
                    userStats.planBonusTokens > 0 && (
                      <div className="bg-yellow-100 px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-yellow-700">
                          +{userStats.planBonusTokens.toLocaleString()} Bonus
                        </span>
                      </div>
                    )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-600">Plan Valid Until</div>
                  <div className="text-sm font-semibold text-blue-900">
                    {userStats.subscription.endDate
                      ? new Date(
                          userStats.subscription.endDate,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Sections */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {/* Lead Information Section */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md p-5 border border-gray-200 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="hidden md:block bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                Lead Information
              </h2>
            </div>
            <p className="hidden md:block text-gray-500 text-sm mb-6 grow">
              Access verified business leads with complete contact details and
              social profiles.
            </p>
            <button
              onClick={() => handleNavigation("/user/leads/information")}
              className="w-full py-2.5 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-all"
            >
              Browse Leads
            </button>
          </div>

          {/* Accessed Leads Section */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md p-5 border border-gray-200 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="hidden md:block bg-green-50 p-3 rounded-xl group-hover:bg-green-100 transition-colors">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                Accessed Leads
              </h2>
            </div>
            <p className="hidden md:block text-gray-500 text-sm mb-6 grow">
              View and manage all your unlocked leads with full contact
              information.
            </p>
            <button
              onClick={() => handleNavigation("/user/leads/accessed")}
              className="w-full py-2.5 rounded-lg border border-green-100 bg-green-50 text-green-700 font-semibold text-sm hover:bg-green-100 transition-all"
            >
              View Accessed
            </button>
          </div>

          {/* External Tools Section */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md p-5 border border-gray-200 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="hidden md:block bg-purple-50 p-3 rounded-xl group-hover:bg-purple-100 transition-colors">
                <ExternalLink className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                External Tools
              </h2>
            </div>
            <p className="hidden md:block text-gray-500 text-sm mb-6 grow">
              Explore powerful tools and integrations to boost your business
              growth.
            </p>
            <button
              onClick={() => handleNavigation("/user/tools")}
              className="w-full py-2.5 rounded-lg border border-purple-100 bg-purple-50 text-purple-700 font-semibold text-sm hover:bg-purple-100 transition-all"
            >
              Explore Tools
            </button>
          </div>

          {/* Community Section */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md p-5 border border-gray-200 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="hidden md:block bg-orange-50 p-3 rounded-xl group-hover:bg-orange-100 transition-colors">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                Community
              </h2>
            </div>
            <p className="hidden md:block text-gray-500 text-sm mb-6 grow">
              Connect with other members, share insights, and grow together.
            </p>
            <button
              onClick={() => handleNavigation("/user/community")}
              className="w-full py-2.5 rounded-lg border border-orange-100 bg-orange-50 text-orange-700 font-semibold text-sm hover:bg-orange-100 transition-all"
            >
              Join Community
            </button>
          </div>

          {/* Chatbot Tools Section */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md p-5 border border-gray-200 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="hidden md:block bg-cyan-50 p-3 rounded-xl group-hover:bg-cyan-100 transition-colors">
                <Bot className="w-6 h-6 text-cyan-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                Chatbot Tools
              </h2>
            </div>
            <p className="hidden md:block text-gray-500 text-sm mb-6 grow">
              Access AI-powered chatbot tools to automate customer interactions
              and support.
            </p>
            <button
              onClick={() => handleNavigation("/user/dashboard/chatbot")}
              className="w-full py-2.5 rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-700 font-semibold text-sm hover:bg-cyan-100 transition-all"
            >
              Launch Chatbot
            </button>
          </div>
        </div>

        {/* Resources Section */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading resources...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* PDF Documents Section */}
            {resources.filter((r) => r.type === "pdf").length > 0 && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-3 rounded-xl">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        PDF Documents
                      </h2>
                      <p className="text-sm text-gray-500">
                        Downloadable guides and resources
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                      <button
                        onClick={() => setPdfFilter("all")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          pdfFilter === "all"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setPdfFilter("accessed")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          pdfFilter === "accessed"
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Accessed
                      </button>
                      <button
                        onClick={() => setPdfFilter("unaccessed")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          pdfFilter === "unaccessed"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Unaccessed
                      </button>
                    </div>

                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {filteredPdfs.length} PDFs
                    </span>

                    <button
                      onClick={() =>
                        handleNavigation("/user/resources?type=pdf")
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                      View All
                    </button>
                  </div>
                </div>

                {filteredPdfs.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredPdfs.slice(0, 4).map((resource) => (
                      <div
                        key={resource.id}
                        onClick={() => {
                          if (resource.isAccessedByUser) {
                            setSelectedResource(resource);
                          } else {
                            handleNavigation(`/user/resource/${resource.id}`);
                          }
                        }}
                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        {/* ... (existing card content, unchanged logic just using resource) ... */}
                        <div className="relative h-32 bg-linear-to-br from-red-50 to-orange-50 flex items-center justify-center">
                          {resource.isAccessedByUser &&
                          resource.thumbnailUrl ? (
                            <div className="w-full h-full p-4">
                              <img
                                src={resource.thumbnailUrl}
                                alt={`${resource.title} preview`}
                                className="w-full h-full object-contain rounded-lg shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  if (e.currentTarget.nextElementSibling) {
                                    (
                                      e.currentTarget
                                        .nextElementSibling as HTMLElement
                                    ).style.display = "flex";
                                  }
                                }}
                              />
                              <div
                                className="w-full h-full items-center justify-center"
                                style={{ display: "none" }}
                              >
                                <div className="bg-white rounded-2xl p-3 shadow-md mx-auto w-fit">
                                  <FileText className="w-10 h-10 text-red-500" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="bg-white rounded-2xl p-3 shadow-md mx-auto w-fit">
                                <FileText className="w-10 h-10 text-red-500" />
                              </div>
                              {resource.isAccessedByUser && (
                                <p className="text-red-600 text-sm font-medium mt-2">
                                  PDF Ready
                                </p>
                              )}
                            </div>
                          )}
                          {!resource.isAccessedByUser && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                              <div className="text-center text-white">
                                <Lock className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm font-semibold">
                                  Unlock to Access
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                            {resource.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {resource.description}
                          </p>
                          <div className="flex justify-end">
                            <span
                              className={`px-4 py-2 rounded-lg text-sm font-semibold ${resource.isAccessedByUser ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                            >
                              {resource.isAccessedByUser
                                ? "✓ Accessed"
                                : "🔓 Click to Unlock"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                    <p className="text-gray-500">
                      No PDF documents match your filter.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Video Courses Section */}
            {resources.filter((r) => r.type === "video").length > 0 && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Play className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Video Courses
                      </h2>
                      <p className="text-sm text-gray-500">
                        Master courses and tutorials
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                      <button
                        onClick={() => setVideoFilter("all")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          videoFilter === "all"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setVideoFilter("accessed")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          videoFilter === "accessed"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Accessed
                      </button>
                      <button
                        onClick={() => setVideoFilter("unaccessed")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          videoFilter === "unaccessed"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Unaccessed
                      </button>
                    </div>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {filteredVideos.length} Videos
                    </span>

                    <button
                      onClick={() =>
                        handleNavigation("/user/resources?type=video")
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View All
                    </button>
                  </div>
                </div>

                {filteredVideos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredVideos.slice(0, 4).map((resource) => (
                      <div
                        key={resource.id}
                        onClick={() => {
                          if (resource.isAccessedByUser) {
                            setSelectedResource(resource);
                          } else {
                            handleNavigation(`/user/resource/${resource.id}`);
                          }
                        }}
                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        {/* ... (existing card content, unchanged logic) ... */}
                        <div className="relative h-32 bg-blue-100 overflow-hidden">
                          {resource.isAccessedByUser &&
                          resource.thumbnailUrl ? (
                            <div className="w-full h-full">
                              <img
                                src={resource.thumbnailUrl}
                                alt={`${resource.title} thumbnail`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  if (e.currentTarget.nextElementSibling) {
                                    (
                                      e.currentTarget
                                        .nextElementSibling as HTMLElement
                                    ).style.display = "flex";
                                  }
                                }}
                              />
                              <div
                                className="w-full h-full items-center justify-center bg-blue-100"
                                style={{ display: "none" }}
                              >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                                  <Play className="w-6 h-6 text-blue-600" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Play className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="text-gray-600 text-sm font-medium">
                                  {resource.isAccessedByUser
                                    ? "Click to Play"
                                    : "Premium Video"}
                                </p>
                              </div>
                            </div>
                          )}
                          {!resource.isAccessedByUser && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                              <div className="text-center text-white">
                                <Lock className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm font-semibold">
                                  Unlock to Watch
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                            {resource.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {resource.description}
                          </p>
                          <div className="flex justify-end">
                            <span
                              className={`px-4 py-2 rounded-lg text-sm font-semibold ${resource.isAccessedByUser ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}
                            >
                              {resource.isAccessedByUser
                                ? "✓ Accessed"
                                : "🔓 Click to Unlock"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                    <p className="text-gray-500">
                      No Video courses match your filter.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {resources.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Resources Available
                </h3>
                <p className="text-gray-500">
                  Check back later for new content
                </p>
              </div>
            )}
          </div>
        )}

        {/* Subscription Status */}
        {userStats && !userStats.subscription.isActive && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">
                  Subscription Required
                </h3>
                <p className="text-yellow-700">
                  Subscribe to a plan to access premium resources and get
                  monthly token allocations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      {selectedResource && (
        <ResourceModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
