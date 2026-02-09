'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'

export default function FinancePage() {
  const router = useRouter()
  const { user, loading: authLoading, selectedGym } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('today')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (selectedGym) {
      fetchFinanceData()
    }
  }, [selectedGym, dateRange])

  const fetchFinanceData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/analytics?gymId=${selectedGym.id || selectedGym._id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user || !selectedGym) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header - Mobile optimized */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-top">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Finance</h1>

          <button className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {/* Date Range Selector - Mobile optimized */}
        <div className="px-3 sm:px-4 pb-3 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 min-w-max">
            {['today', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Revenue Cards - Mobile optimized */}
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs sm:text-sm opacity-90">Total Revenue</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              ₹{loading ? '...' : analytics?.revenue?.moneyCollectedToday || 0}
            </div>
            <div className="text-xs sm:text-sm opacity-75">
              {dateRange === 'today' ? 'Today' : `This ${dateRange}`}
            </div>
          </motion.div>

          {/* Cash Collection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs sm:text-sm opacity-90">Cash</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              ₹{loading ? '...' : analytics?.revenue?.paymentModes?.cash || 0}
            </div>
            <div className="text-xs sm:text-sm opacity-75">Cash payments</div>
          </motion.div>

          {/* Online Collection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs sm:text-sm opacity-90">Online</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              ₹{loading ? '...' : analytics?.revenue?.paymentModes?.online || 0}
            </div>
            <div className="text-xs sm:text-sm opacity-75">Online payments</div>
          </motion.div>
        </div>

        {/* Transaction Breakdown */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Transaction Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Admissions</div>
                  <div className="text-xs text-gray-600">{loading ? '...' : analytics?.revenue?.todayAdmissions || 0} members</div>
                </div>
              </div>
              <div className="text-lg font-bold text-blue-600">
                ₹{loading ? '...' : (analytics?.revenue?.moneyCollectedToday || 0) * 0.7}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Renewals</div>
                  <div className="text-xs text-gray-600">0 members</div>
                </div>
              </div>
              <div className="text-lg font-bold text-green-600">₹0</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Due Payments</div>
                  <div className="text-xs text-gray-600">0 cleared</div>
                </div>
              </div>
              <div className="text-lg font-bold text-orange-600">₹0</div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Recent Transactions</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            </div>
          ) : analytics?.recentTransactions?.length > 0 ? (
            <div className="space-y-2.5 sm:space-y-3">
              {analytics.recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate capitalize">
                      {transaction.transactionType}
                    </div>
                    <div className="text-xs text-gray-600 truncate">{transaction.member?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <div className="font-bold text-green-600 text-sm sm:text-base">
                      +₹{transaction.amount}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${
                      transaction.paymentMode === 'cash' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {transaction.paymentMode}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No transactions yet
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .safe-top {
          padding-top: env(safe-area-inset-top);
        }
      `}</style>
    </div>
  )
}