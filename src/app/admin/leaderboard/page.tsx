"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminLayout from "../components/AdminLayout";
import { AdminAPI } from "../../../utils/AdminAPI";
import {
  Award,
  Trophy,
  Medal,
  Crown,
  Users,
  MessageCircle,
  Heart,
  RefreshCw,
  TrendingUp,
  Calendar,
  Gift,
  Coins,
  Send,
} from "lucide-react";

interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  communityActivity: {
    postsCreated: number;
    commentsMade: number;
    likesGiven: number;
    likesReceived: number;
  };
  createdAt: string;
  prizeTokenStatus: {
    hasActiveTokens: boolean;
    currentTokens: number;
    expiresAt: string | null;
    prizeType: string | null;
    grantedAt: string | null;
    grantedBy: string | null;
    timeUntilExpiry: string | null;
  };
}

interface CommunityStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  activeMembers: number;
}

export default function AdminLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    activeMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filterPeriod, setFilterPeriod] = useState("alltime");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [selectedUserForAward, setSelectedUserForAward] =
    useState<LeaderboardUser | null>(null);
  const [awardAmount, setAwardAmount] = useState("");
  const [awardReason, setAwardReason] = useState("");
  const [isAwarding, setIsAwarding] = useState(false);
  const [prizeHistory, setPrizeHistory] = useState<any[]>([]);
  const [prizeAnalytics, setPrizeAnalytics] = useState<any>({});
  const [showAllHistoryModal, setShowAllHistoryModal] = useState(false);
  const [allPrizeHistory, setAllPrizeHistory] = useState<any[]>([]);
  const [historySummary, setHistorySummary] = useState<any>(null);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const [filteredAnalytics, setFilteredAnalytics] = useState<any>({
    totalUsersRewarded: 0,
    totalTokensDistributed: 0,
    totalAwardsGiven: 0,
    activeTokensNow: 0,
    breakdown: {
      firstPrize: { count: 0, totalTokens: 0 },
      secondPrize: { count: 0, totalTokens: 0 },
      thirdPrize: { count: 0, totalTokens: 0 },
    },
  });

  useEffect(() => {
    fetchLeaderboard();
    fetchPrizeHistory();
    fetchPrizeAnalytics();

    // Auto-refresh every 60 seconds
    const refreshInterval = setInterval(() => {
      fetchLeaderboard(true);
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    fetchFilteredAnalytics();
  }, [filterPeriod, customStartDate, customEndDate]);

  const fetchLeaderboard = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      let leaderboardUrl = "/community/leaderboard";
      if (filterPeriod !== "alltime") {
        const params = new URLSearchParams({ period: filterPeriod });
        if (filterPeriod === "custom" && customStartDate && customEndDate) {
          params.append("startDate", customStartDate);
          params.append("endDate", customEndDate);
        }
        leaderboardUrl = `/leaderboard/filtered?${params.toString()}`;
      }

      const [leaderboardResponse, statsResponse] = await Promise.all([
        AdminAPI.get(leaderboardUrl),
        AdminAPI.get("/community/stats"),
      ]);

      // Handle leaderboard response
      if (leaderboardResponse?.success && leaderboardResponse.leaderboard) {
        setLeaderboard(leaderboardResponse.leaderboard);
      } else if (leaderboardResponse?.data?.leaderboard) {
        setLeaderboard(leaderboardResponse.data.leaderboard);
      } else if (leaderboardResponse?.leaderboard) {
        setLeaderboard(leaderboardResponse.leaderboard);
      }

      // Handle stats response
      if (statsResponse?.success) {
        setCommunityStats({
          totalPosts: statsResponse.totalPosts || 0,
          totalComments: statsResponse.totalComments || 0,
          totalLikes: statsResponse.totalLikes || 0,
          activeMembers: statsResponse.activeMembers || 0,
        });
      } else if (statsResponse?.data) {
        setCommunityStats(statsResponse.data);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      if (!silent) {
        toast.error("Error loading leaderboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPrizeHistory = async () => {
    try {
      const response = await AdminAPI.get("/prize-history?limit=10");
      if (response.success) {
        setPrizeHistory(response.history);
      }
    } catch (error) {
      console.error("Error fetching prize history:", error);
    }
  };

  const fetchPrizeAnalytics = async () => {
    try {
      const response = await AdminAPI.get("/prize-analytics");
      if (response.success) {
        setPrizeAnalytics(response.analytics);
      }
    } catch (error) {
      console.error("Error fetching prize analytics:", error);
    }
  };

  const fetchFilteredAnalytics = async () => {
    try {
      let url = "/prize-analytics";

      if (filterPeriod !== "alltime") {
        const params = new URLSearchParams({ period: filterPeriod });
        if (filterPeriod === "custom" && customStartDate && customEndDate) {
          params.append("startDate", customStartDate);
          params.append("endDate", customEndDate);
        }
        url = `/prize-analytics/filtered?${params.toString()}`;
      }

      const response = await AdminAPI.get(url);

      if (response?.success) {
        setFilteredAnalytics(response.analytics);
      }
    } catch (error) {
      console.error("Error fetching filtered analytics:", error);
    }
  };

  const handleAwardClick = (user: LeaderboardUser, rank: number) => {
    setSelectedUserForAward(user);
    // Default suggestion based on rank, but editable
    if (rank === 1) setAwardAmount("500");
    else if (rank === 2) setAwardAmount("300");
    else if (rank === 3) setAwardAmount("100");
    else setAwardAmount("50");

    if (rank === 1) setAwardReason("1st Prize");
    else if (rank === 2) setAwardReason("2nd Prize");
    else if (rank === 3) setAwardReason("3rd Prize");
    else setAwardReason("Community Reward");

    setAwardModalOpen(true);
  };

  const submitAward = async () => {
    if (!selectedUserForAward || !awardAmount || !awardReason) {
      toast.error("Please fill in all fields");
      return;
    }

    const amount = parseInt(awardAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsAwarding(true);
    try {
      // Find rank if possible
      const rank =
        leaderboard.findIndex((u) => u._id === selectedUserForAward._id) + 1;

      const response = await AdminAPI.awardPrizeTokens(
        selectedUserForAward._id,
        amount,
        awardReason,
        rank > 0 ? rank : undefined,
      );

      if (response.success) {
        toast.success(
          `🎉 ${amount} tokens awarded to ${selectedUserForAward.name}! (Expires in 24 hours)`,
        );
        setAwardModalOpen(false);
        fetchLeaderboard(true);
        fetchPrizeHistory();
        fetchPrizeAnalytics();
        fetchFilteredAnalytics();
      } else {
        toast.error(response.error || "Failed to award tokens");
      }
    } catch (error: any) {
      if (
        error.message?.includes("already has active") ||
        error.message?.includes("User already has active prize tokens")
      ) {
        toast.info(`${selectedUserForAward.name} has been already rewarded`);
      } else {
        toast.error(error.message || "Error awarding tokens");
      }
    } finally {
      setIsAwarding(false);
    }
  };

  const getPrizeInfo = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          badge: "🥇 1st Prize",
          bgGradient:
            "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600",
          textColor: "text-yellow-900",
          borderColor: "border-yellow-300",
          icon: <Crown className="w-6 h-6 text-yellow-700" />,
        };
      case 2:
        return {
          badge: "🥈 2nd Prize",
          bgGradient:
            "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500",
          textColor: "text-gray-900",
          borderColor: "border-gray-300",
          icon: <Trophy className="w-6 h-6 text-gray-700" />,
        };
      case 3:
        return {
          badge: "🥉 3rd Prize",
          bgGradient:
            "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600",
          textColor: "text-orange-900",
          borderColor: "border-orange-300",
          icon: <Medal className="w-6 h-6 text-orange-700" />,
        };
      default:
        return {
          badge: `#${rank}`,
          bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
          textColor: "text-blue-900",
          borderColor: "border-blue-200",
          icon: <Award className="w-5 h-5 text-blue-600" />,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchAllPrizeHistory = async () => {
    try {
      const response = await AdminAPI.get(
        "/community/prize-history/all?page=1&limit=50",
      );
      if (response.success) {
        setAllPrizeHistory(response.history);
        setHistorySummary(response.summary);
        setHistoryPagination(response.pagination);
        setShowAllHistoryModal(true);
      }
    } catch (error) {
      console.error("Error fetching all prize history:", error);
      toast.error("Failed to load prize history");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Active
          </span>
        );
      case "expired":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Expired
          </span>
        );
      case "claimed":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Claimed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-[#BDDDFC] text-gray-800 rounded-full text-xs font-medium">
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <div className="text-xl text-gray-700">Loading leaderboard...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
                Prize Distribution System
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Filter leaderboard by time period and distribute prizes to top
                performers
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="text-xs md:text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={fetchAllPrizeHistory}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-sm md:text-base w-full sm:w-auto"
                >
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    View All Prize History
                  </span>
                  <span className="sm:hidden">Prize History</span>
                </button>
                <button
                  onClick={() => fetchLeaderboard(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Prize Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Filter & Prize Settings
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Filter */}
            <div>
              <h3 className="text-sm font-semibold text-black mb-3">
                Time Period
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  >
                    <option value="alltime">All Time</option>
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {filterPeriod === "custom" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filtered Prize Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-600">
                  {filterPeriod === "weekly"
                    ? "Tokens This Week"
                    : filterPeriod === "monthly"
                      ? "Tokens This Month"
                      : filterPeriod === "custom"
                        ? "Tokens (Custom)"
                        : "Total Distributed"}
                </div>
                <div className="text-3xl font-bold text-green-900">
                  {filteredAnalytics.totalTokensDistributed}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-600">
                  Users Rewarded
                </div>
                <div className="text-3xl font-bold text-blue-900">
                  {filteredAnalytics.totalUsersRewarded}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-600">
                  Awards Given
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  {filteredAnalytics.totalAwardsGiven}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-orange-600">
                  Active Tokens Now
                </div>
                <div className="text-3xl font-bold text-orange-900">
                  {filteredAnalytics.activeTokensNow}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {communityStats.activeMembers}
                </div>
                <div className="text-sm text-gray-600">Active Members</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {communityStats.totalPosts}
                </div>
                <div className="text-sm text-gray-600">Total Posts</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {communityStats.totalComments}
                </div>
                <div className="text-sm text-gray-600">Total Comments</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {communityStats.totalLikes}
                </div>
                <div className="text-sm text-gray-600">Total Likes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Winners */}
        {leaderboard.length >= 3 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              Prize Winners
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leaderboard.slice(0, 3).map((user, index) => {
                const rank = index + 1;
                const prizeInfo = getPrizeInfo(rank);

                return (
                  <div
                    key={user._id}
                    className={`${prizeInfo.bgGradient} rounded-xl shadow-lg border-2 ${prizeInfo.borderColor} p-6 transform hover:scale-105 transition-all duration-200`}
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        {prizeInfo.icon}
                      </div>

                      <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center text-2xl font-bold text-gray-700 mx-auto mb-4 shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div
                        className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${prizeInfo.textColor} bg-white bg-opacity-80 mb-3`}
                      >
                        {prizeInfo.badge}
                      </div>

                      <h3 className="text-xl font-bold text-black mb-1">
                        {user.name}
                      </h3>
                      <p className="text-black text-opacity-90 text-sm mb-3">
                        {user.email}
                      </p>

                      <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                        <div className="text-3xl font-bold text-black">
                          {user.points}
                        </div>
                        <div className="text-black text-opacity-90 text-sm">
                          Points
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-2">
                          <div className="font-bold text-black">
                            {user.communityActivity.postsCreated}
                          </div>
                          <div className="text-black text-opacity-80">
                            Posts
                          </div>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-2">
                          <div className="font-bold text-black">
                            {user.communityActivity.commentsMade}
                          </div>
                          <div className="text-black text-opacity-80">
                            Comments
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAwardClick(user, rank)}
                        className="w-full bg-white bg-opacity-90 hover:bg-white text-gray-800 font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105"
                      >
                        <Coins className="w-4 h-4" />
                        Award Prize Tokens
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Complete Rankings
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              All community members ranked by points
            </p>
          </div>

          <div className="overflow-x-auto">
            {leaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Rankings Available
                </h3>
                <p className="text-gray-600">
                  Community members will appear here once they start earning
                  points
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Likes Given
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prize Token Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((user, index) => {
                    const rank = index + 1;
                    const prizeInfo = getPrizeInfo(rank);

                    return (
                      <tr
                        key={user._id}
                        className={`hover:bg-gray-50 ${rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-transparent" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                rank <= 3
                                  ? prizeInfo.bgGradient + " text-white"
                                  : "bg-[#BDDDFC] text-gray-700"
                              }`}
                            >
                              {rank}
                            </div>
                            {rank <= 3 && (
                              <div className="text-lg">
                                {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-gray-900">
                            {user.points}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.communityActivity.postsCreated}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.communityActivity.commentsMade}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.communityActivity.likesGiven}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.prizeTokenStatus?.hasActiveTokens ? (
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                  Active
                                </span>
                              </div>
                              <div className="font-bold text-orange-600">
                                {user.prizeTokenStatus.currentTokens} tokens
                              </div>
                              <div className="text-gray-600">
                                Expires: {user.prizeTokenStatus.timeUntilExpiry}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {user.prizeTokenStatus.prizeType}
                              </div>
                              <div className="text-gray-400 text-xs">
                                Granted:{" "}
                                {formatDate(
                                  user.prizeTokenStatus.grantedAt || "",
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs">
                              <span className="px-2 py-1 bg-[#BDDDFC] text-gray-600 rounded-full text-xs">
                                No Active Tokens
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {rank <= 3 ? (
                            <button
                              onClick={() => handleAwardClick(user, rank)}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
                            >
                              <Gift className="w-4 h-4" />
                              Award Tokens
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm italic">
                              No prize tokens
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* All Prize History Modal */}
      {showAllHistoryModal && historySummary && (
        <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold flex items-center gap-3">
                    <Award className="w-8 h-8" />
                    Complete Prize Distribution History
                  </h3>
                  <p className="text-purple-100 mt-2">
                    All users prize awards and statistics
                  </p>
                </div>
                <button
                  onClick={() => setShowAllHistoryModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
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
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm font-medium text-blue-600">
                    Total Users Rewarded
                  </div>
                  <div className="text-3xl font-bold text-blue-900 mt-2">
                    {historySummary.totalUsersRewarded}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="text-sm font-medium text-green-600">
                    Total Tokens Distributed
                  </div>
                  <div className="text-3xl font-bold text-green-900 mt-2">
                    {historySummary.totalTokensDistributed}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="text-sm font-medium text-purple-600">
                    Total Awards Given
                  </div>
                  <div className="text-3xl font-bold text-purple-900 mt-2">
                    {historySummary.totalAwardsGiven}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="text-sm font-medium text-orange-600">
                    Active Tokens Now
                  </div>
                  <div className="text-3xl font-bold text-orange-900 mt-2">
                    {historySummary.activeTokensNow}
                  </div>
                </div>
              </div>

              {/* Breakdown by Position */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6 border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Breakdown by Position
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🥇</div>
                    <div>
                      <div className="text-sm text-gray-600">1st Prize</div>
                      <div className="font-bold text-gray-900">
                        <div className="font-bold text-gray-900">
                          {historySummary.breakdown.firstPrize.count} awards
                        </div>
                        <div className="text-xs font-semibold text-gray-500">
                          Total:{" "}
                          {historySummary.breakdown.firstPrize.totalTokens}{" "}
                          tokens
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🥈</div>
                    <div>
                      <div className="text-sm text-gray-600">2nd Prize</div>
                      <div className="font-bold text-gray-900">
                        <div className="font-bold text-gray-900">
                          {historySummary.breakdown.secondPrize.count} awards
                        </div>
                        <div className="text-xs font-semibold text-gray-500">
                          Total:{" "}
                          {historySummary.breakdown.secondPrize.totalTokens}{" "}
                          tokens
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🥉</div>
                    <div>
                      <div className="text-sm text-gray-600">3rd Prize</div>
                      <div className="font-bold text-gray-900">
                        <div className="font-bold text-gray-900">
                          {historySummary.breakdown.thirdPrize.count} awards
                        </div>
                        <div className="text-xs font-semibold text-gray-500">
                          Total:{" "}
                          {historySummary.breakdown.thirdPrize.totalTokens}{" "}
                          tokens
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete History List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-lg mb-4">
                  Complete Award History
                </h4>
                {allPrizeHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No prize history found</p>
                  </div>
                ) : (
                  allPrizeHistory.map((prize) => (
                    <div
                      key={prize._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                              prize.position === 1
                                ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                : prize.position === 2
                                  ? "bg-gradient-to-br from-gray-300 to-gray-500"
                                  : prize.position === 3
                                    ? "bg-gradient-to-br from-orange-400 to-orange-600"
                                    : "bg-gradient-to-br from-blue-400 to-blue-600"
                            }`}
                          >
                            <span className="text-white text-2xl">
                              {prize.position === 1
                                ? "🥇"
                                : prize.position === 2
                                  ? "🥈"
                                  : prize.position === 3
                                    ? "🥉"
                                    : "🎁"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-bold text-gray-900 text-lg">
                                  {prize.user.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {prize.user.email}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-green-600">
                                  {prize.tokenAmount}
                                </div>
                                <div className="text-xs text-gray-500">
                                  tokens
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-500">
                                  Contest Details
                                </div>
                                <div className="font-semibold text-gray-900">
                                  {prize.contestName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {prize.period.charAt(0).toUpperCase() +
                                    prize.period.slice(1)}{" "}
                                  Contest
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatDate(prize.dateRange.start)} -{" "}
                                  {formatDate(prize.dateRange.end)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">
                                  Award Information
                                </div>
                                <div className="text-sm text-gray-900">
                                  Awarded: {formatDateTime(prize.awardedAt)}
                                </div>
                                <div className="mt-2">
                                  {getStatusBadge(prize.status)}
                                  {prize.status === "active" &&
                                    prize.timeRemaining && (
                                      <div className="text-xs text-orange-600 mt-1">
                                        Expires in {prize.timeRemaining}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination Info */}
              {historyPagination.pages > 1 && (
                <div className="mt-6 text-center text-sm text-gray-600">
                  Showing {allPrizeHistory.length} of {historyPagination.total}{" "}
                  total awards
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowAllHistoryModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Award Modal */}
      {awardModalOpen && selectedUserForAward && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-3xl animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner ring-1 ring-white/30">
                  <Gift className="w-8 h-8 text-white drop-shadow-md" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Award Prize Tokens
                </h3>
                <p className="text-blue-100 text-sm mt-2 font-medium">
                  Reward {selectedUserForAward.name} for their contributions
                </p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Token Amount
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-blue-50">
                    <Coins className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={awardAmount}
                    onChange={(e) => setAwardAmount(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 bg-gray-50/50 hover:bg-white focus:bg-white"
                    placeholder="e.g. 500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Reason / Prize Type
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-blue-50">
                    <Award className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={awardReason}
                    onChange={(e) => setAwardReason(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 bg-gray-50/50 hover:bg-white focus:bg-white"
                    placeholder="e.g. 1st Place, Weekly Winner"
                  />
                </div>
              </div>

              <div className="bg-blue-50/80 border border-blue-100 text-blue-800 text-xs p-4 rounded-xl flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-blue-100 rounded-full">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                </div>
                <p className="leading-snug">
                  Tokens will be instantly credited to the user's account and
                  will remain valid for{" "}
                  <span className="font-bold">24 hours</span>. A notification
                  will be sent automatically.
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setAwardModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-sm active:scale-95"
                  disabled={isAwarding}
                >
                  Cancel
                </button>
                <button
                  onClick={submitAward}
                  disabled={isAwarding}
                  className="flex-[2] px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAwarding ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Award Tokens
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
