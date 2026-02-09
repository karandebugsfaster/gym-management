'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function AddMemberModal({ isOpen, onClose }) {
  const { selectedGym } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState([])
  const [error, setError] = useState('')

  // Step 1: Basic Details (NOW INCLUDING MEMBERID)
  const [basicData, setBasicData] = useState({
    memberId: '', // ADD THIS
    name: '',
    phoneNumber: '',
    gender: 'Male',
    batch: 'Morning',
  })

  // Step 2: Additional Details
  const [additionalData, setAdditionalData] = useState({
    email: '',
    height: '',
    weight: '',
    address: '',
    notes: '',
    dateOfBirth: '',
    image: '',
  })

  // Step 3: Plan Assignment
  const [planData, setPlanData] = useState({
    joiningDate: new Date().toISOString().split('T')[0],
    planId: '',
    discount: 0,
    amountCollected: 0,
    paymentMode: 'cash',
    sendInvoice: false,
  })

  useEffect(() => {
    if (isOpen && step === 3) {
      fetchPlans()
    }
  }, [isOpen, step])

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token')
      const gymId = selectedGym.id || selectedGym._id
      const res = await fetch(`/api/plan?gymId=${gymId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!basicData.memberId || !basicData.name || !basicData.phoneNumber) {
        setError('Member ID, Name and Phone number are required')
        return
      }
    }
    setError('')
    setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const gymId = selectedGym.id || selectedGym._id

      const memberData = {
        gymId,
        ...basicData,
        ...additionalData,
        ...planData,
      }

      const res = await fetch('/api/member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(memberData),
      })

      const data = await res.json()

      if (data.success) {
        // Reset form
        setStep(1)
        setBasicData({ memberId: '', name: '', phoneNumber: '', gender: 'Male', batch: 'Morning' })
        setAdditionalData({ email: '', height: '', weight: '', address: '', notes: '', dateOfBirth: '', image: '' })
        setPlanData({ joiningDate: new Date().toISOString().split('T')[0], planId: '', discount: 0, amountCollected: 0, paymentMode: 'cash', sendInvoice: false })
        onClose()
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = plans.find(p => p._id === planData.planId)
  const planPrice = selectedPlan?.price || 0
  const finalPrice = planPrice - (planData.discount || 0)
  const dueAmount = finalPrice - (planData.amountCollected || 0)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add New Member</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-sm text-gray-600 mb-4 sm:mb-6">Add member profile.</p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Basic Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3 sm:space-y-4"
              >
                {/* MEMBER ID - NEW FIELD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={basicData.memberId}
                    onChange={(e) => setBasicData({ ...basicData, memberId: e.target.value.trim().toUpperCase() })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base font-mono"
                    placeholder="e.g., GYM001, KING123"
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for this member</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={basicData.name}
                    onChange={(e) => setBasicData({ ...basicData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                    placeholder="Enter member name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={basicData.phoneNumber}
                    onChange={(e) => setBasicData({ ...basicData, phoneNumber: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => setBasicData({ ...basicData, gender })}
                        className={`py-2.5 sm:py-3 px-4 rounded-lg font-medium transition text-sm sm:text-base ${
                          basicData.gender === gender
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch *</label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {['Morning', 'Noon', 'Evening', 'Night'].map((batch) => (
                      <button
                        key={batch}
                        type="button"
                        onClick={() => setBasicData({ ...basicData, batch })}
                        className={`py-2.5 sm:py-3 px-4 rounded-lg font-medium transition text-sm sm:text-base ${
                          basicData.batch === batch
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {batch}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-6 text-base"
                >
                  Proceed →
                </button>
              </motion.div>
            )}

            {/* Step 2: Additional Details */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={additionalData.email}
                    onChange={(e) => setAdditionalData({ ...additionalData, email: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={additionalData.height}
                      onChange={(e) => setAdditionalData({ ...additionalData, height: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                      placeholder="170"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      value={additionalData.weight}
                      onChange={(e) => setAdditionalData({ ...additionalData, weight: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                      placeholder="70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={additionalData.address}
                    onChange={(e) => setAdditionalData({ ...additionalData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-base"
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={additionalData.notes}
                    onChange={(e) => setAdditionalData({ ...additionalData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-base"
                    placeholder="Any additional notes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={additionalData.dateOfBirth}
                    onChange={(e) => setAdditionalData({ ...additionalData, dateOfBirth: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-base"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-base"
                  >
                    Proceed →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Plan Assignment */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={planData.joiningDate}
                    onChange={(e) => setPlanData({ ...planData, joiningDate: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Plans ({plans.length})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {plans.map((plan) => (
                      <button
                        key={plan._id}
                        type="button"
                        onClick={() => setPlanData({ ...planData, planId: plan._id })}
                        className={`w-full p-3 rounded-lg text-left transition text-sm sm:text-base ${
                          planData.planId === plan._id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm opacity-90">₹{plan.price} - {plan.duration.value} {plan.duration.unit}</div>
                      </button>
                    ))}
                  </div>
                  {plans.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No plans available. Create one first.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admission Amount
                  </label>
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-base">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">{planPrice}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={planPrice}
                    value={planData.discount}
                    onChange={(e) => setPlanData({ ...planData, discount: Number(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {['online', 'cash'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPlanData({ ...planData, paymentMode: mode })}
                        className={`py-2.5 sm:py-3 px-4 rounded-lg font-medium uppercase transition text-sm sm:text-base ${
                          planData.paymentMode === mode
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Payable
                    </label>
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg bg-white font-bold text-lg sm:text-xl text-center">
                      {finalPrice}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Amount
                    </label>
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg bg-white font-bold text-lg sm:text-xl text-center">
                      {dueAmount}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-blue-600">
                    Amount Collected
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={finalPrice}
                    value={planData.amountCollected}
                    onChange={(e) => setPlanData({ ...planData, amountCollected: Number(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                    placeholder="8000"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sendInvoice"
                    checked={planData.sendInvoice}
                    onChange={(e) => setPlanData({ ...planData, sendInvoice: e.target.checked })}
                    className="w-5 h-5 text-blue-600"
                  />
                  <label htmlFor="sendInvoice" className="text-sm text-gray-700">
                    Send Invoice
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-base"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !planData.planId}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Adding...
                      </span>
                    ) : (
                      '▶ Add Member'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}