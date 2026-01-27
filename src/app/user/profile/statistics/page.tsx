"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Activity } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProfileSidebar from "../components/ProfileSidebar";
import Axios from "@/utils/Axios";

interface TokenData {
  monthlyTotal: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  totalUsed: number;
  daily: number;
  dailyLimit: number;
  dailyUsed: number;
}

export default function StatisticsPage() {
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    try {
      const response = await Axios.get("/auth/profile");
      setTokens(response.data.tokens);
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculatePercentage = (used: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  };

  // Helper for safe display values
  const formatNumber = (num: number | undefined) => {
    return (num || 0).toLocaleString();
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Usage Statistics</span>
          </h1>

          {tokens && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center border border-blue-200">
                  <div className="flex items-center justify-center mb-3">
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatNumber(tokens.totalUsed)}
                  </div>
                  <div className="text-blue-700 font-medium">
                    Total Tokens Used
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    All time usage
                  </div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center border border-green-200">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatNumber(tokens.monthlyUsed)}
                  </div>
                  <div className="text-green-700 font-medium">
                    Used This Month
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Current month consumption
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center border border-purple-200">
                  <div className="flex items-center justify-center mb-3">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {formatNumber(tokens.dailyUsed)}
                  </div>
                  <div className="text-purple-700 font-medium">Used Today</div>
                  <div className="text-xs text-purple-600 mt-1">
                    Today's consumption
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-6 text-lg">
                  Usage Efficiency Analysis
                </h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600 font-medium">
                        Monthly Usage Progress
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-blue-600 text-lg">
                          {calculatePercentage(
                            tokens.monthlyUsed,
                            tokens.monthlyTotal,
                          ).toFixed(1)}
                          %
                        </span>
                        <div className="text-xs text-gray-500">
                          {formatNumber(tokens.monthlyUsed)} /{" "}
                          {formatNumber(tokens.monthlyTotal)} tokens
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                        style={{
                          width: `${calculatePercentage(tokens.monthlyUsed, tokens.monthlyTotal)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>{formatNumber(tokens.monthlyTotal)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600 font-medium">
                        Daily Usage Progress
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-green-600 text-lg">
                          {calculatePercentage(
                            tokens.dailyUsed,
                            tokens.dailyLimit,
                          ).toFixed(1)}
                          %
                        </span>
                        <div className="text-xs text-gray-500">
                          {formatNumber(tokens.dailyUsed)} /{" "}
                          {formatNumber(tokens.dailyLimit)} tokens
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-600 h-4 rounded-full transition-all duration-500"
                        style={{
                          width: `${calculatePercentage(tokens.dailyUsed, tokens.dailyLimit)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>{formatNumber(tokens.dailyLimit)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Total Overview
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Allocated</span>
                      <span className="font-semibold text-blue-600">
                        {formatNumber(tokens.monthlyTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Used</span>
                      <span className="font-semibold text-red-600">
                        {formatNumber(tokens.monthlyUsed)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-semibold text-green-600">
                        {formatNumber(tokens.monthlyRemaining)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Daily Overview
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Limit</span>
                      <span className="font-semibold text-blue-600">
                        {formatNumber(tokens.dailyLimit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Used Today</span>
                      <span className="font-semibold text-red-600">
                        {formatNumber(tokens.dailyUsed)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available</span>
                      <span className="font-semibold text-green-600">
                        {formatNumber(tokens.daily)}
                      </span>
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
