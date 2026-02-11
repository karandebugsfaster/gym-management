'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendWhatsAppMessage, generateExpiryReminderMessage } from '@/lib/notifications'
import { printInvoice } from '@/lib/invoiceGenerator'
import { useAuth } from '@/context/AuthContext'

export default function MemberDetailModal({ isOpen, onClose, member, onUpdate }) {
  const { selectedGym } = useAuth()
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [historyType, setHistoryType] = useState('membership') // 'membership' or 'attendance'

  if (!isOpen || !member) return null

  const calculateDaysLeft = (endDate) => {
    if (!endDate) return null
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysLeft = calculateDaysLeft(member.membershipEndDate)

  const handleSendExpiryReminder = () => {
    const message = generateExpiryReminderMessage(
      member.name,
      daysLeft,
      member.currentPlan?.name || 'your plan',
      selectedGym?.name || 'our gym'
    )
    sendWhatsAppMessage(member.phoneNumber, message)
  }

  const handleSendWhatsAppReminder = () => {
    const message = generateExpiryReminderMessage(
      member.name,
      daysLeft,
      member.currentPlan?.name || 'your plan',
      selectedGym?.name || 'our gym'
    )
    sendWhatsAppMessage(member.phoneNumber, message)
  }

  const handlePrintInvoice = () => {
    const invoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
      gymName: selectedGym?.name || '',
      gymAddress: selectedGym?.location || '',
      gymPhone: '',
      gymEmail: '',
      memberName: member.name,
      memberId: member.memberId,
      memberPhone: member.phoneNumber,
      memberEmail: member.email || '',
      planName: member.currentPlan?.name || '',
      planPrice: member.planPrice || 0,
      discount: member.discount || 0,
      finalPrice: member.finalPrice || 0,
      amountPaid: member.amountPaid || 0,
      dueAmount: member.dueAmount || 0,
      paymentMode: 'cash',
      membershipStartDate: member.membershipStartDate 
        ? new Date(member.membershipStartDate).toLocaleDateString('en-IN')
        : '',
      membershipEndDate: member.membershipEndDate
        ? new Date(member.membershipEndDate).toLocaleDateString('en-IN')
        : '',
    }
    printInvoice(invoiceData)
  }

  const handleFreezeMember = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/member', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId: member._id,
          isFrozen: !member.isFrozen,
          frozenDate: !member.isFrozen ? new Date() : null,
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert(`Member ${!member.isFrozen ? 'frozen' : 'unfrozen'} successfully`)
        onUpdate()
        onClose()
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Failed to update member status')
    }
  }

  const handleDeleteMember = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/member?memberId=${member._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        alert('Member deleted successfully')
        onUpdate()
        onClose()
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Failed to delete member')
    }
  }

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
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.memberId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Contact Buttons */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.open(`tel:${member.phoneNumber}`)}
                className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button
                onClick={() => window.open(`https://wa.me/${member.phoneNumber}`, '_blank')}
                className="p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
              {member.email && (
                <button
                  onClick={() => window.open(`mailto:${member.email}`)}
                  className="p-3 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Membership Details */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Membership Details</h4>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">{member.currentPlan?.name || 'No Plan'}</div>
              <div className={`text-2xl font-bold mb-2 ${
                daysLeft < 0 ? 'text-red-600' : 
                daysLeft <= 7 ? 'text-orange-600' : 
                'text-green-600'
              }`}>
                {daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="px-3 py-1.5 bg-gray-800 text-white rounded-lg">
                  {member.membershipStartDate 
                    ? new Date(member.membershipStartDate).toLocaleDateString('en-IN')
                    : 'N/A'
                  }
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="px-3 py-1.5 bg-gray-800 text-white rounded-lg">
                  {member.membershipEndDate 
                    ? new Date(member.membershipEndDate).toLocaleDateString('en-IN')
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 space-y-2">
            <ActionButton
              icon={<MessageIcon />}
              label="Send Expiry Reminder"
              onClick={handleSendExpiryReminder}
            />
            
            <ActionButton
              icon={<EditIcon />}
              label="Edit / Delete Profile"
              onClick={() => setShowDeleteConfirm(true)}
            />
            
            <ActionButton
              icon={<RefreshIcon />}
              label="Edit Membership"
              onClick={() => setShowEditModal(true)}
            />
            
            <ActionButton
              icon={<RenewIcon />}
              label="Early Renew Member"
              onClick={() => setShowRenewModal(true)}
            />
            
            <ActionButton
              icon={<InfoIcon />}
              label="Show More Info"
              onClick={() => setShowMoreInfo(!showMoreInfo)}
            />
            
            <ActionButton
              icon={<FreezeIcon />}
              label={member.isFrozen ? "Unfreeze Member" : "Freeze Member"}
              onClick={handleFreezeMember}
            />
            
            <ActionButton
              icon={<HistoryIcon />}
              label="Membership History"
              onClick={() => {
                setHistoryType('membership')
                setShowHistoryModal(true)
              }}
            />
            
            <ActionButton
              icon={<AttendanceIcon />}
              label="Attendance History"
              onClick={() => {
                setHistoryType('attendance')
                setShowHistoryModal(true)
              }}
            />
            
            <ActionButton
              icon={<WhatsAppIcon />}
              label="Send WhatsApp Reminder"
              onClick={handleSendWhatsAppReminder}
              green
            />
            
            <ActionButton
              icon={<PrintIcon />}
              label="Print Invoice"
              onClick={handlePrintInvoice}
            />
          </div>

          {/* More Info Section */}
          <AnimatePresence>
            {showMoreInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  <InfoRow label="Email" value={member.email || 'Not provided'} />
                  <InfoRow label="Phone" value={member.phoneNumber} />
                  <InfoRow label="Gender" value={member.gender} />
                  <InfoRow label="Batch" value={member.batch} />
                  <InfoRow label="Height" value={member.height ? `${member.height} cm` : 'Not provided'} />
                  <InfoRow label="Weight" value={member.weight ? `${member.weight} kg` : 'Not provided'} />
                  <InfoRow label="Address" value={member.address || 'Not provided'} />
                  <InfoRow label="Notes" value={member.notes || 'No notes'} />
                  {member.dateOfBirth && (
                    <InfoRow 
                      label="Date of Birth" 
                      value={new Date(member.dateOfBirth).toLocaleDateString('en-IN')} 
                    />
                  )}
                  <InfoRow label="Due Amount" value={`₹${member.dueAmount || 0}`} />
                  <InfoRow label="Status" value={member.isFrozen ? '🥶 Frozen' : '✅ Active'} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Member?</h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete {member.name}? This action cannot be undone.
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
                      handleDeleteMember()
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
      </motion.div>
    </AnimatePresence>
  )
}

// Helper Components
function ActionButton({ icon, label, onClick, green = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-left ${
        green ? 'text-green-600' : 'text-gray-700'
      }`}
    >
      <div className={`flex-shrink-0 ${green ? 'text-green-600' : 'text-gray-600'}`}>
        {icon}
      </div>
      <span className="flex-1 font-medium text-sm">{label}</span>
      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  )
}

// Icons
const MessageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const RenewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const FreezeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
)

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AttendanceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
)

const PrintIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
)