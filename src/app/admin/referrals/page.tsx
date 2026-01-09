"use client"

import { useState, useEffect } from "react"
import { Search, Users, UserPlus, TrendingUp, Eye, Filter, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import AdminLayout from "../components/AdminLayout"
import { AdminAPI } from "@/utils/AdminAPI"

interface ReferralAnalytics {
  totalReferrers: number
  totalReferrals: number
  activeReferrals: number
  referredUsers: number
  conversionRate: string
  cycles: {
    total8Cycles: number
    total15Cycles: number
    total25Cycles: number
    totalCycles: number
    totalTokensDistributed: number
    averageCyclesPerUser: string
  }
}

interface Referrer {
  _id: string
  name: string
  email: string
  referralCode: string
  referralStats: {
    totalReferrals: number
    activeReferrals: number
    totalEarnings: number
  }
  subscription: {
    planName: string
    isActive: boolean
    endDate: string
  }
  joinedAt: string
  referralsCount: number
  activeReferralsCount: number
  milestoneRewards: {
    referral8Cycles: number
    referral15Cycles: number
    referral25Cycles: number
    totalTokensEarned: number
    referral8LastReset: string | null
    referral15LastReset: string | null
    referral25LastReset: string | null
  }
  temporaryTokens: {
    amount: number
    grantedAt: string
    expiresAt: string
    prizeType: string
    timeUntilExpiry: string
  } | null
  computed: {
    totalCycles: number
    hasActiveTokens: boolean
    milestoneBreakdown: string
  }
}

interface ReferredUser {
  _id: string
  name: string
  email: string
  referredBy: {
    name: string
    email: string
    referralCode: string
  }
  subscription: {
    planName: string
    planPrice: number
    isActive: boolean
    startDate: string
    endDate: string
  }
  joinedAt: string
}

export default function ReferralsManagement() {
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null)
  const [referrers, setReferrers] = useState<Referrer[]>([])
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'referrers' | 'referred'>('referrers')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    loadData()
  }, [activeTab, searchTerm, statusFilter, currentPage])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load analytics
      const analyticsRes = await AdminAPI.get('/referrals/analytics')
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data)
      }

      // Load tab-specific data
      if (activeTab === 'referrers') {
        const referrersRes = await AdminAPI.get(`/referrals/referrers?page=${currentPage}&search=${searchTerm}&status=${statusFilter}`)
        if (referrersRes.success) {
          setReferrers(referrersRes.data.referrers)
          setPagination(referrersRes.data.pagination)
        }
      } else {
        const usersRes = await AdminAPI.get(`/referrals/referred-users?page=${currentPage}&search=${searchTerm}&status=${statusFilter}`)
        if (usersRes.success) {
          setReferredUsers(usersRes.data.referredUsers)
          setPagination(usersRes.data.pagination)
        }
      }
    } catch (error) {
      console.error('Error loading referrals data:', error)
      toast.error('Failed to load referrals data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const loadUserDetails = async (userId: string) => {
    setLoadingDetails(true)
    try {
      const response = await AdminAPI.get(`/referrals/referred-user/${userId}`)
      if (response.success) {
        setSelectedUser(response.data)
        setShowUserModal(true)
      }
    } catch (error) {
      console.error('Error loading user details:', error)
      toast.error('Failed to load user details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
        Inactive
      </span>
    )
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Referrals Management</h1>
              <p className="text-gray-600 mt-2">Monitor and manage user referral activities</p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Referrers</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalReferrers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <UserPlus className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalReferrals}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Referrals</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.activeReferrals}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Referred Users</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.referredUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cycle Analytics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">8-Referral Cycles</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.cycles.total8Cycles}</p>
                    <p className="text-xs text-gray-500">300 tokens each</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">15-Referral Cycles</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.cycles.total15Cycles}</p>
                    <p className="text-xs text-gray-500">500 tokens each</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">25-Referral Cycles</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.cycles.total25Cycles}</p>
                    <p className="text-xs text-gray-500">1000 tokens each</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Cycles</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.cycles.totalCycles}</p>
                    <p className="text-xs text-gray-500">All milestones</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tokens Distributed</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.cycles.totalTokensDistributed}</p>
                    <p className="text-xs text-gray-500">Avg: {analytics.cycles.averageCyclesPerUser} cycles/user</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('referrers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'referrers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Referrers ({analytics?.totalReferrers || 0})
              </button>
              <button
                onClick={() => setActiveTab('referred')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'referred'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Referred Users ({analytics?.referredUsers || 0})
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 text-black">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {activeTab === 'referrers' ? (
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#BDDDFC]/20">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Referrer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Referral Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Referrals
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Active Referrals
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cycles Completed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tokens Earned
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Temp Tokens
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {referrers.map((referrer) => (
                          <tr key={referrer._id} className="hover:bg-[#BDDDFC]/20">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{referrer.name}</div>
                                <div className="text-sm text-gray-500">{referrer.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                                {referrer.referralCode}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {referrer.referralStats.totalReferrals}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {referrer.referralStats.activeReferrals}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xs space-y-1">
                                <div className="text-gray-900 font-medium">{referrer.computed?.milestoneBreakdown || '8×0, 15×0, 25×0'}</div>
                                <div className="text-gray-500">Total: {referrer.computed?.totalCycles || 0} cycles</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-green-600">
                                {referrer.milestoneRewards?.totalTokensEarned || 0} tokens
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {referrer.temporaryTokens ? (
                                <div className="text-xs">
                                  <div className="font-bold text-orange-600">{referrer.temporaryTokens.amount} tokens</div>
                                  <div className="text-gray-500">Expires: {referrer.temporaryTokens.timeUntilExpiry}</div>
                                  <div className="text-gray-400 truncate max-w-[100px]" title={referrer.temporaryTokens.prizeType}>
                                    {referrer.temporaryTokens.prizeType}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">None</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(referrer.subscription.isActive)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              ) : (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#BDDDFC]/20">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Referred By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Plan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {referredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-[#BDDDFC]/20">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.referredBy.name}</div>
                                <div className="text-xs text-gray-500 font-mono">{user.referredBy.referralCode}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.subscription.planName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{user.subscription.planPrice}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.joinedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(user.subscription.isActive)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => loadUserDetails(user._id)}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-[#BDDDFC]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                        disabled={currentPage === pagination.pages}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-[#BDDDFC]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-base font-medium text-gray-900">{selectedUser.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-base font-medium text-gray-900">{selectedUser.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-base font-medium text-gray-900">{selectedUser.user.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Referral Code</p>
                      <p className="text-base font-mono font-bold text-blue-600">{selectedUser.user.referralCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Joined Date</p>
                      <p className="text-base font-medium text-gray-900">{formatDate(selectedUser.user.joinedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-base font-medium text-gray-900">{formatDate(selectedUser.user.lastUpdated)}</p>
                    </div>
                  </div>
                </div>

                {/* Referred By Info */}
                {selectedUser.referredBy && (
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserPlus className="w-5 h-5 mr-2 text-purple-600" />
                      Referred By
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="text-base font-medium text-gray-900">{selectedUser.referredBy.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-base font-medium text-gray-900">{selectedUser.referredBy.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Referral Code</p>
                        <p className="text-base font-mono font-bold text-purple-600">{selectedUser.referredBy.referralCode}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscription Info */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="text-base font-medium text-gray-900">{selectedUser.subscription.planName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="text-base font-bold text-green-600">₹{selectedUser.subscription.planPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      {getStatusBadge(selectedUser.subscription.isActive)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedUser.subscription.startDate ? formatDate(selectedUser.subscription.startDate) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedUser.subscription.endDate ? formatDate(selectedUser.subscription.endDate) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Token Information */}
                <div className="bg-orange-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Available</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedUser.tokens.available}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Daily</p>
                      <p className="text-2xl font-bold text-green-600">{selectedUser.tokens.dailyTokens}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Prize</p>
                      <p className="text-2xl font-bold text-orange-600">{selectedUser.tokens.prizeTokens}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="text-sm font-medium">
                        {selectedUser.tokens.hasActiveTokens ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-gray-500">Inactive</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {selectedUser.tokens.temporaryTokens && (
                    <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Temporary Tokens Active</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <span className="ml-2 font-bold text-orange-600">{selectedUser.tokens.temporaryTokens.amount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="ml-2 font-medium">{selectedUser.tokens.temporaryTokens.prizeType}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Expires in:</span>
                          <span className="ml-2 font-medium text-red-600">{selectedUser.tokens.temporaryTokens.timeUntilExpiry}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Milestone Rewards */}
                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestone Rewards</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">8-Cycles</p>
                      <p className="text-2xl font-bold text-yellow-600">{selectedUser.milestoneRewards.referral8Cycles}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">15-Cycles</p>
                      <p className="text-2xl font-bold text-orange-600">{selectedUser.milestoneRewards.referral15Cycles}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">25-Cycles</p>
                      <p className="text-2xl font-bold text-red-600">{selectedUser.milestoneRewards.referral25Cycles}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                      <p className="text-2xl font-bold text-green-600">{selectedUser.milestoneRewards.totalTokensEarned}</p>
                    </div>
                  </div>
                </div>

                {/* Referral Stats */}
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                      <p className="text-3xl font-bold text-indigo-600">{selectedUser.referralStats.totalReferrals}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Active Referrals</p>
                      <p className="text-3xl font-bold text-green-600">{selectedUser.referralStats.activeReferrals}</p>
                    </div>
                  </div>
                </div>

                {/* Users Referred by This User */}
                {selectedUser.referredUsers && selectedUser.referredUsers.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Users Referred by This User ({selectedUser.referredUsers.length})</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedUser.referredUsers.map((ref: any) => (
                        <div key={ref._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{ref.name}</p>
                            <p className="text-sm text-gray-500">{ref.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{ref.subscription.planName}</p>
                            <p className="text-xs text-gray-500">{formatDate(ref.joinedAt)}</p>
                            {getStatusBadge(ref.subscription.isActive)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    )
  }
