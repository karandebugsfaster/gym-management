'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function ManagersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    } else if (!authLoading && user?.role !== 'owner') {
      router.push('/manager')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && user.role === 'owner') {
      fetchManagers()
    }
  }, [user])

  const fetchManagers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/manager', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setManagers(data.managers)
      }
    } catch (error) {
      console.error('Error fetching managers:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user || user.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
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

          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Managers</h1>

          <div className="w-10"></div>
        </div>
      </header>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : managers.length > 0 ? (
          <div className="space-y-3">
            {managers.map((manager) => (
              <motion.div
                key={manager._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-4 sm:p-5"
              >
                <div className="flex items-start gap-3 sm:gap-4 mb-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {manager.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                      {manager.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{manager.email}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{manager.dialCode} {manager.phoneNumber}</p>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    manager.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {manager.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Assigned Gyms */}
                <div className="mb-3">
                  <div className="text-xs text-gray-600 mb-2">Assigned Gyms:</div>
                  <div className="flex flex-wrap gap-2">
                    {manager.managedGyms && manager.managedGyms.length > 0 ? (
                      manager.managedGyms.map((gym) => (
                        <span key={gym._id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {gym.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No gyms assigned</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-100 transition">
                    Edit
                  </button>
                  <button className="flex-1 py-2 px-3 bg-red-50 text-red-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-100 transition">
                    Deactivate
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Managers Yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Add managers to help you manage your gym
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition text-base"
            >
              Add First Manager
            </button>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {managers.length > 0 && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-30"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Add Manager Modal */}
      <AddManagerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchManagers}
      />

      <style jsx>{`
        .safe-top {
          padding-top: env(safe-area-inset-top);
        }
      `}</style>
    </div>
  )
}

function AddManagerModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gyms, setGyms] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    dialCode: '91',
    gymIds: [],
  })

  useEffect(() => {
    if (isOpen) {
      fetchGyms()
    }
  }, [isOpen])

  const fetchGyms = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/gym', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setGyms(data.gyms.filter(g => g.owner === user._id || g.owner._id === user._id))
      }
    } catch (error) {
      console.error('Error fetching gyms:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        setFormData({
          name: '',
          email: '',
          password: '',
          phoneNumber: '',
          dialCode: '91',
          gymIds: [],
        })
        onSuccess()
        onClose()
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to create manager')
    } finally {
      setLoading(false)
    }
  }

  const toggleGym = (gymId) => {
    setFormData(prev => ({
      ...prev,
      gymIds: prev.gymIds.includes(gymId)
        ? prev.gymIds.filter(id => id !== gymId)
        : [...prev.gymIds, gymId]
    }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add Manager</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                placeholder="Manager name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                placeholder="manager@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                placeholder="Min. 6 characters"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <input
                  type="text"
                  value={formData.dialCode}
                  onChange={(e) => setFormData({ ...formData, dialCode: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                  placeholder="91"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Gyms ({formData.gymIds.length} selected)
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {gyms.map((gym) => (
                  <button
                    key={gym._id}
                    type="button"
                    onClick={() => toggleGym(gym._id)}
                    className={`w-full p-3 rounded-lg text-left transition text-sm ${
                      formData.gymIds.includes(gym._id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium">{gym.name}</div>
                    <div className="text-xs opacity-90">{gym.location}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? 'Creating...' : 'Create Manager'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}