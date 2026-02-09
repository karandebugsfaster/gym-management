// WhatsApp notification utility
export function sendWhatsAppMessage(phoneNumber, message) {
  // Remove country code formatting for WhatsApp URL
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  
  // Open WhatsApp with pre-filled message
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodedMessage}`
  window.open(whatsappUrl, '_blank')
}

// Email notification utility
export function sendEmail(to, subject, body) {
  const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = mailtoLink
}

// Generate expiry reminder message
export function generateExpiryReminderMessage(memberName, daysLeft, planName, gymName) {
  return `Hello ${memberName}! 👋

Your membership at ${gymName} is expiring in ${daysLeft} days.

📅 Plan: ${planName}
⏰ Expires: ${daysLeft} days remaining

Renew now to continue enjoying our facilities without interruption!

Reply to this message or visit us to renew your membership.

Thank you! 💪
${gymName} Team`
}

// Generate birthday message
export function generateBirthdayMessage(memberName, gymName) {
  return `🎉 Happy Birthday ${memberName}! 🎂

The entire team at ${gymName} wishes you a wonderful birthday filled with joy, health, and strength!

May this year bring you closer to all your fitness goals! 💪

Keep crushing it! 🔥

- ${gymName} Team`
}

// Generate payment reminder
export function generatePaymentReminderMessage(memberName, dueAmount, gymName) {
  return `Hello ${memberName}! 👋

This is a friendly reminder about your pending payment at ${gymName}.

💰 Due Amount: ₹${dueAmount}

Please clear your dues at your earliest convenience to avoid membership interruption.

Visit us or contact us for payment options.

Thank you! 🙏
${gymName} Team`
}

// Generate welcome message
export function generateWelcomeMessage(memberName, planName, gymName, startDate, endDate) {
  return `Welcome to ${gymName}, ${memberName}! 🎉

Thank you for joining our fitness family! We're excited to help you achieve your fitness goals.

📋 Your Membership Details:
- Plan: ${planName}
- Start Date: ${new Date(startDate).toLocaleDateString('en-IN')}
- Valid Until: ${new Date(endDate).toLocaleDateString('en-IN')}

Our team is here to support you every step of the way. Let's get started! 💪

See you at the gym! 🏋️

- ${gymName} Team`
}