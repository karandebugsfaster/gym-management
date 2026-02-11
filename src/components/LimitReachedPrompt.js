'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function LimitReachedPrompt({ 
  isOpen, 
  onClose, 
  limitType = 'members',
  currentCount = 0,
  maxLimit = 0,
  currentPlan = 'trial',
}) {
  const router = useRouter()

  const handleUpgrade = () => {
    onClose()
    router.push('/pricing')
  }

  const getLimitInfo = () => {
    switch(limitType) {
      case 'members':
        return {
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          title: 'Member Limit Reached',
          message: `You've reached the maximum of ${maxLimit} members for your ${currentPlan} plan.`,
          upgradeMessage: 'Upgrade to add more members and grow your gym!',
        }
      case 'gyms':
        return {
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          title: 'Gym Limit Reached',
          message: `You've reached the maximum of ${maxLimit} gym location(s) for your ${currentPlan} plan.`,
          upgradeMessage: 'Upgrade to manage multiple gym locations!',
        }
      case 'staff':
        return {
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
          title: 'Staff Limit Reached',
          message: `You've reached the maximum of ${maxLimit} staff members for your ${currentPlan} plan.`,
          upgradeMessage: 'Upgrade to add more trainers and staff!',
        }
      default:
        return {
          icon: null,
          title: 'Limit Reached',
          message: 'You have reached your plan limit.',
          upgradeMessage: 'Upgrade to unlock more features!',
        }
    }
  }

  const info = getLimitInfo()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              {info.icon}
            </div>
            <h2 className="text-2xl font-bold">{info.title}</h2>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 text-center mb-4">{info.message}</p>
            
            {/* Current Usage */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Usage</span>
                <span className="text-sm font-bold text-gray-900">{currentCount} / {maxLimit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                  style={{ width: `${Math.min((currentCount / maxLimit) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Upgrade Benefits */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="text-sm text-blue-700">{info.upgradeMessage}</div>
              </div>
            </div>

            {/* Plan Comparison */}
            <div className="space-y-2 mb-6">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Available in:</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-600">Pro</div>
                  <div className="text-xs text-purple-600">
                    {limitType === 'members' && '200 members'}
                    {limitType === 'gyms' && '3 locations'}
                    {limitType === 'staff' && '10 staff'}
                  </div>
                </div>
                <div className="flex-1 bg-orange-50 border-2 border-orange-400 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-orange-600">Premium</div>
                  <div className="text-xs text-orange-600">Unlimited</div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}