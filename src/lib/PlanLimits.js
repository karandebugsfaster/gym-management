export const PLAN_LIMITS = {
  basic: {
    maxMembers: 50,
    maxGyms: 1,
    maxStaff: 0,
    features: {
      analytics: 'basic',
      memberManagement: true,
      planManagement: true,
      staffManagement: false,
      whatsappNotifications: false,
      emailNotifications: false,
      invoiceGeneration: false,
      advancedReports: false,
      customBranding: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  pro: {
    maxMembers: 200,
    maxGyms: 3,
    maxStaff: 10,
    features: {
      analytics: 'advanced',
      memberManagement: true,
      planManagement: true,
      staffManagement: true,
      whatsappNotifications: true,
      emailNotifications: true,
      invoiceGeneration: true,
      advancedReports: true,
      customBranding: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  premium: {
    maxMembers: Infinity,
    maxGyms: Infinity,
    maxStaff: Infinity,
    features: {
      analytics: 'advanced',
      memberManagement: true,
      planManagement: true,
      staffManagement: true,
      whatsappNotifications: true,
      emailNotifications: true,
      invoiceGeneration: true,
      advancedReports: true,
      customBranding: true,
      prioritySupport: true,
      apiAccess: true,
    },
  },
  trial: {
    maxMembers: 10,
    maxGyms: 1,
    maxStaff: 0,
    features: {
      analytics: 'basic',
      memberManagement: true,
      planManagement: true,
      staffManagement: false,
      whatsappNotifications: false,
      emailNotifications: false,
      invoiceGeneration: false,
      advancedReports: false,
      customBranding: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
}

export function getPlanLimits(planType) {
  return PLAN_LIMITS[planType] || PLAN_LIMITS.trial
}

export function canAddMember(currentCount, planType) {
  const limits = getPlanLimits(planType)
  return currentCount < limits.maxMembers
}

export function canAddGym(currentCount, planType) {
  const limits = getPlanLimits(planType)
  return currentCount < limits.maxGyms
}

export function canAddStaff(currentCount, planType) {
  const limits = getPlanLimits(planType)
  return currentCount < limits.maxStaff
}

export function hasFeature(planType, featureName) {
  const limits = getPlanLimits(planType)
  return limits.features[featureName] === true
}