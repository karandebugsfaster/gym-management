'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import MembersTab from '@/components/manager/MembersTab'
import PlansTab from '@/components/manager/PlansTab'
import ExpiryTab from '@/components/manager/ExpiryTab'
import EnquiryTab from '@/components/manager/EnquiryTab'

export default function ManagerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, selectedGym } = useAuth()
  
  const [activeTab, setActiveTab] = useState('members')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  if (authLoading || !user || !selectedGym) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  // REMOVED EXPENSE AND OUTLET
  const tabs = [
    { id: 'members', label: 'Member' },
    { id: 'plans', label: 'Plan' },
    { id: 'expiry', label: 'Expiry' },
    { id: 'enquiry', label: 'Enquiry' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
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

          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Manager</h1>

          <div className="w-10"></div>
        </div>

        {/* Horizontal Scrollable Tabs - Mobile optimized */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-1 px-3 sm:px-4 pb-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-6 py-2 rounded-t-lg font-medium transition whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <div className="p-3 sm:p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'members' && <MembersTab key="members" />}
          {activeTab === 'plans' && <PlansTab key="plans" />}
          {activeTab === 'expiry' && <ExpiryTab key="expiry" />}
          {activeTab === 'enquiry' && <EnquiryTab key="enquiry" />}
        </AnimatePresence>
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