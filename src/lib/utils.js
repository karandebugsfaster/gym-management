// Calculate end date based on start date and duration in days
export function calculateEndDate(startDate, durationInDays) {
  if (!startDate || !durationInDays) {
    throw new Error('Start date and duration are required');
  }

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + parseInt(durationInDays));
  return end;
}

// Get remaining days from end date
export function getDaysRemaining(endDate) {
  if (!endDate) return null;
  
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Check if membership is expiring today
export function isExpiringToday(endDate) {
  if (!endDate) return false;
  
  const today = new Date();
  const end = new Date(endDate);
  
  return (
    today.getDate() === end.getDate() &&
    today.getMonth() === end.getMonth() &&
    today.getFullYear() === end.getFullYear()
  );
}

// Check if membership is expiring soon (within specified days)
export function isExpiringSoon(endDate, days = 7) {
  const daysLeft = getDaysRemaining(endDate);
  return daysLeft !== null && daysLeft > 0 && daysLeft <= days;
}

// Check if today is member's birthday
export function isBirthdayToday(dateOfBirth) {
  if (!dateOfBirth) return false;
  
  const today = new Date();
  const dob = new Date(dateOfBirth);
  
  return (
    today.getDate() === dob.getDate() &&
    today.getMonth() === dob.getMonth()
  );
}

// Format date to readable string
export function formatDate(date, format = 'short') {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-IN');
  } else if (format === 'long') {
    return d.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }
  
  return d.toLocaleDateString('en-IN');
}

// Get today's date range (start and end of day)
export function getTodayDateRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return { start: today, end: tomorrow };
}

// Convert duration to days
export function convertToDays(value, unit) {
  const numValue = parseInt(value);
  
  if (isNaN(numValue) || numValue <= 0) {
    throw new Error('Invalid duration value');
  }

  switch (unit.toLowerCase()) {
    case 'day':
    case 'days':
      return numValue;
    
    case 'week':
    case 'weeks':
      return numValue * 7;
    
    case 'month':
    case 'months':
      return numValue * 30; // Approximate
    
    case 'year':
    case 'years':
      return numValue * 365; // Approximate
    
    default:
      throw new Error(`Invalid duration unit: ${unit}. Use 'days', 'months', or 'years'`);
  }
}