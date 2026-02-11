'use client'

import { useAuth } from '@/context/AuthContext'
import { getPlanLimits, canAddMember, canAddGym, canAddStaff, hasFeature } from '@/lib/PlanLimits'

export function usePlanLimits() {
  const { selectedGym } = useAuth()

  const currentPlan = selectedGym?.subscription?.plan || 'trial'
  const planLimits = getPlanLimits(currentPlan)
  const subscriptionStatus = selectedGym?.subscription?.status || 'trial'
  const subscriptionEndDate = selectedGym?.subscription?.endDate

  const isTrialExpired = () => {
    if (subscriptionStatus !== 'trial') return false
    if (!subscriptionEndDate) return false
    return new Date(subscriptionEndDate) < new Date()
  }

  const isSubscriptionActive = () => {
    return subscriptionStatus === 'active' || (subscriptionStatus === 'trial' && !isTrialExpired())
  }

  const getDaysLeft = () => {
    if (!subscriptionEndDate) return 0
    const now = new Date()
    const end = new Date(subscriptionEndDate)
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  return {
    currentPlan,
    planLimits,
    subscriptionStatus,
    subscriptionEndDate,
    isTrialExpired: isTrialExpired(),
    isSubscriptionActive: isSubscriptionActive(),
    daysLeft: getDaysLeft(),
    canAddMember: (currentCount) => canAddMember(currentCount, currentPlan),
    canAddGym: (currentCount) => canAddGym(currentCount, currentPlan),
    canAddStaff: (currentCount) => canAddStaff(currentCount, currentPlan),
    hasFeature: (featureName) => hasFeature(currentPlan, featureName),
  }
}