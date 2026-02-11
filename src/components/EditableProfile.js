'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EditableProfile({ user, selectedGym, onClose, onUpdate, onLogout }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    dialCode: user?.dialCode || '91',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleUpdate = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate password fields if changing password
      if (showPasswordFields) {
        if (!formData.currentPassword) {
          setError('Please enter your current password')
          setLoading(false)
          return
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match')
          setLoading(false)
          return
        }
        if (formData.newPassword.length < 6) {
          setError('New password must be at least 6 characters')
          setLoading(false)
          return
        }
      }

      const token = localStorage.getItem('token')
      const updateData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        dialCode: formData.dialCode,
      }

      if (showPasswordFields && formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess('Profile updated successfully!')
        onUpdate(data.user)
        setIsEditing(false)
        setShowPasswordFields(false)
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/user/profile?confirm=true', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await res.json()

      if (data.success) {
        alert('Your account has been deleted')
        onLogout()
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Failed to delete account')
    }
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Profile</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-4 sm:mb-6">Here's your profile information.</div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {success}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Name</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-gray-900 text-sm sm:text-base truncate">{user?.name}</span>
            </div>
          )}
        </div>

        {/* Gym Name (Read-only) */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Gym Name</label>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-gray-900 text-sm sm:text-base truncate">{selectedGym?.name || 'No gym selected'}</span>
          </div>
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Email</label>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-900 text-sm sm:text-base truncate">{user?.email}</span>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Phone Number</label>
          {isEditing ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <input
                type="text"
                value={formData.dialCode}
                onChange={(e) => setFormData({ ...formData, dialCode: e.target.value })}
                className="px-2 sm:px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="col-span-2 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900 text-sm sm:text-base">{user?.dialCode}</span>
              </div>
              <div className="col-span-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-900 text-sm sm:text-base truncate">{user?.phoneNumber}</span>
              </div>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        {isEditing && (
          <div>
            <button
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              {showPasswordFields ? '− Hide Password Fields' : '+ Change Password'}
            </button>
            
            {showPasswordFields && (
              <div className="mt-3 space-y-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
                <input
                  type="password"
                  placeholder="New Password (min. 6 characters)"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Update Button */}
        {isEditing ? (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsEditing(false)
                setShowPasswordFields(false)
                setFormData({
                  name: user?.name || '',
                  phoneNumber: user?.phoneNumber || '',
                  dialCode: user?.dialCode || '91',
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                })
                setError('')
                setSuccess('')
              }}
              className="flex-1 p-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 p-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full p-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition text-sm sm:text-base"
          >
            Update Profile
          </button>
        )}

        {/* Language Selector */}
        <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm sm:text-base">
          <span className="text-2xl">🇬🇧</span>
          <span>English</span>
          <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Terms & Conditions */}
        <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm sm:text-base">
          Update Terms & Conditions
        </button>

        {/* Delete Account */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full p-3 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete My Account
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full p-3 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account?</h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteAccount()
                    setShowDeleteConfirm(false)
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}