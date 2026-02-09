'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function EnquiryTab() {
  const { selectedGym } = useAuth()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState('all')

  // Demo data - replace with API call
  const demoEnquiries = [
    {
      id: 1,
      name: 'Rahul Sharma',
      phone: '9876543210',
      status: 'pending',
      date: new Date(),
      interestedIn: '6 Months Plan',
      source: 'Walk-in',
    },
    {
      id: 2,
      name: 'Priya Patel',
      phone: '9988776655',
      status: 'follow-up',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      interestedIn: '1 Year Plan',
      source: 'Phone Call',
    },
  ]

  const getFilteredEnquiries = () => {
    if (filter === 'all') return demoEnquiries
    return demoEnquiries.filter(e => e.status === filter)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Filter Bar - Mobile optimized */}
      <div className="bg-white rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto hide-scrollbar pb-1">
          {['all', 'pending', 'follow-up', 'converted', 'lost'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries List - Mobile optimized */}
      <div className="space-y-2.5 sm:space-y-3 pb-20">
        {getFilteredEnquiries().map((enquiry) => (
          <motion.div
            key={enquiry.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border-l-4 border-purple-500"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{enquiry.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{enquiry.phone}</p>
              </div>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                enquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                enquiry.status === 'follow-up' ? 'bg-blue-100 text-blue-800' :
                enquiry.status === 'converted' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {enquiry.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600 mb-3">
              <div>📅 {enquiry.date.toLocaleDateString()}</div>
              <div>💳 {enquiry.interestedIn}</div>
              <div className="col-span-2">📍 {enquiry.source}</div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-100 transition">
                Follow Up
              </button>
              <button className="flex-1 py-2 px-3 bg-green-50 text-green-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-100 transition">
                Convert
              </button>
              <button className="p-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-30"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add Enquiry Modal - simplified for now */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Add Enquiry - Coming Soon</h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full py-3 bg-gray-200 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  )
}