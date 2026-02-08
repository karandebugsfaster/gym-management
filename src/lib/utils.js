/**
 * Calculate membership end date based on start date and duration
 */
export function calculateEndDate(startDate, duration, unit) {
  const date = new Date(startDate);
  
  switch (unit) {
    case 'days':
      date.setDate(date.getDate() + duration);
      break;
    case 'months':
      date.setMonth(date.getMonth() + duration);
      break;
    case 'years':
      date.setFullYear(date.getFullYear() + duration);
      break;
    default:
      throw new Error('Invalid duration unit');
  }
  
  return date;
}

/**
 * Calculate days remaining until expiry
 */
export function getDaysRemaining(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if membership is expiring today
 */
export function isExpiringToday(endDate) {
  const today = new Date();
  const end = new Date(endDate);
  
  return (
    today.getDate() === end.getDate() &&
    today.getMonth() === end.getMonth() &&
    today.getFullYear() === end.getFullYear()
  );
}

/**
 * Check if membership is expiring soon (within days)
 */
export function isExpiringSoon(endDate, withinDays = 7) {
  const daysRemaining = getDaysRemaining(endDate);
  return daysRemaining > 0 && daysRemaining <= withinDays;
}

/**
 * Check if today is member's birthday
 */
export function isBirthdayToday(dateOfBirth) {
  if (!dateOfBirth) return false;
  
  const today = new Date();
  const dob = new Date(dateOfBirth);
  
  return (
    today.getDate() === dob.getDate() &&
    today.getMonth() === dob.getMonth()
  );
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date range for today
 */
export function getTodayDateRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Convert duration to days
 */
export function convertToDays(value, unit) {
  switch (unit) {
    case 'days':
      return value;
    case 'months':
      return value * 30; // Approximate
    case 'years':
      return value * 365; // Approximate
    default:
      return 0;
  }
}