'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function ExpiryTab() {
  const { selectedGym } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (selectedGym) {
      fetchMembers()
    }
  }, [selectedGym])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/member?gymId=${selectedGym.id || selectedGym._id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const calculateDaysLeft = (endDate) => {
    if (!endDate) return null
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const isExpiringToday = (endDate) => {
    const daysLeft = calculateDaysLeft(endDate)
    return daysLeft === 0
  }

  const isExpiringSoon = (endDate, days = 7) => {
    const daysLeft = calculateDaysLeft(endDate)
    return daysLeft !== null && daysLeft > 0 && daysLeft <= days
  }

  const isExpired = (endDate) => {
    const daysLeft = calculateDaysLeft(endDate)
    return daysLeft !== null && daysLeft < 0
  }

  // Filter members based on active filter
  const getFilteredMembers = () => {
    if (!members || members.length === 0) return []

    switch (filter) {
      case 'today':
        return members.filter(m => m.membershipEndDate && isExpiringToday(m.membershipEndDate))
      
      case 'soon':
        return members.filter(m => m.membershipEndDate && isExpiringSoon(m.membershipEndDate, 7))
      
      case 'expired':
        return members.filter(m => m.membershipEndDate && isExpired(m.membershipEndDate))
      
      case 'all':
      default:
        return members.filter(m => m.membershipEndDate)
    }
  }

  const filteredMembers = getFilteredMembers()

  // Count members for each category
  const counts = {
    all: members.filter(m => m.membershipEndDate).length,
    today: members.filter(m => m.membershipEndDate && isExpiringToday(m.membershipEndDate)).length,
    soon: members.filter(m => m.membershipEndDate && isExpiringSoon(m.membershipEndDate, 7)).length,
    expired: members.filter(m => m.membershipEndDate && isExpired(m.membershipEndDate)).length,
  }

  // Get status badge
  const getStatusBadge = (member) => {
    if (!member.membershipEndDate) return null
    
    const daysLeft = calculateDaysLeft(member.membershipEndDate)
    
    if (daysLeft < 0) {
      return {
        text: 'Expired',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
      }
    } else if (daysLeft === 0) {
      return {
        text: 'Expires Today',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
      }
    } else if (daysLeft <= 7) {
      return {
        text: `${daysLeft} days left`,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-300',
      }
    } else {
      return {
        text: `${daysLeft} days left`,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-20"
    >
      {/* Filter Buttons - Mobile optimized with counts */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`p-3 sm:p-4 rounded-xl text-center transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="text-xl sm:text-2xl font-bold mb-1">{counts.all}</div>
          <div className="text-xs font-medium">All</div>
        </button>

        <button
          onClick={() => setFilter('today')}
          className={`p-3 sm:p-4 rounded-xl text-center transition ${
            filter === 'today'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="text-xl sm:text-2xl font-bold mb-1">{counts.today}</div>
          <div className="text-xs font-medium">Today</div>
        </button>

        <button
          onClick={() => setFilter('soon')}
          className={`p-3 sm:p-4 rounded-xl text-center transition ${
            filter === 'soon'
              ? 'bg-orange-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="text-xl sm:text-2xl font-bold mb-1">{counts.soon}</div>
          <div className="text-xs font-medium">Soon</div>
        </button>

        <button
          onClick={() => setFilter('expired')}
          className={`p-3 sm:p-4 rounded-xl text-center transition ${
            filter === 'expired'
              ? 'bg-gray-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="text-xl sm:text-2xl font-bold mb-1">{counts.expired}</div>
          <div className="text-xs font-medium">Expired</div>
        </button>
      </div>

      {/* Member Cards - Mobile optimized */}
      {filteredMembers.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member) => {
              const status = getStatusBadge(member)
              
              return (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-xl p-4 sm:p-5 shadow-sm border-l-4 ${status.borderColor}`}
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {member.memberId}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {member.batch}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${status.bgColor} ${status.textColor}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg mb-3 text-xs sm:text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">Plan</div>
                      <div className="font-semibold text-gray-900 truncate">
                        {member.currentPlan?.name || 'No Plan'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Expiry Date</div>
                      <div className="font-semibold text-gray-900">
                        {member.membershipEndDate
                          ? new Date(member.membershipEndDate).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-3 bg-green-50 text-green-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-100 transition active:scale-95">
                      Renew
                    </button>
                    <button className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-100 transition active:scale-95">
                      Remind
                    </button>
                    <button className="p-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition active:scale-95">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            {filter === 'all' && 'No Members Found'}
            {filter === 'today' && 'No Memberships Expiring Today'}
            {filter === 'soon' && 'No Memberships Expiring Soon'}
            {filter === 'expired' && 'No Expired Memberships'}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {filter === 'all' && 'Add members to track their membership expiry'}
            {filter === 'today' && 'No memberships are expiring today'}
            {filter === 'soon' && 'No memberships are expiring in the next 7 days'}
            {filter === 'expired' && 'All members have active memberships'}
          </p>
        </motion.div>
      )}

      {/* Summary Card at bottom - Mobile optimized */}
      {filteredMembers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 sm:mt-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 border-2 border-blue-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">
                {filter === 'all' && 'Total Members'}
                {filter === 'today' && 'Expiring Today'}
                {filter === 'soon' && 'Expiring Soon (7 days)'}
                {filter === 'expired' && 'Expired Members'}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {filteredMembers.length}
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
            Out of {counts.all} total members with active memberships
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}