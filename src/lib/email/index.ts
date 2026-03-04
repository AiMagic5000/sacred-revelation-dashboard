// Email system exports
export { sendEmail, verifyConnection } from './config'
export type { EmailOptions } from './config'

export {
  welcomeEmail,
  donationReceiptEmail,
  complianceReminderEmail,
  trialExpiringEmail,
  volunteerWelcomeEmail,
} from './templates'

export type {
  WelcomeEmailData,
  DonationReceiptData,
  ComplianceReminderData,
  TrialExpiringData,
  VolunteerWelcomeData,
} from './templates'

export {
  sendWelcomeEmail,
  sendDonationReceipt,
  sendComplianceReminder,
  sendTrialExpiringEmail,
  sendVolunteerWelcome,
  generateReceiptNumber,
  formatEmailDate,
} from './send'
