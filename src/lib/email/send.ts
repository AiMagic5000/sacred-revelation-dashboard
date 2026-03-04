import { sendEmail } from './config'
import {
  welcomeEmail,
  donationReceiptEmail,
  complianceReminderEmail,
  trialExpiringEmail,
  volunteerWelcomeEmail,
  type WelcomeEmailData,
  type DonationReceiptData,
  type ComplianceReminderData,
  type TrialExpiringData,
  type VolunteerWelcomeData,
} from './templates'

/**
 * Send a welcome email to new users
 */
export async function sendWelcomeEmail(to: string, data: WelcomeEmailData) {
  const { subject, html, text } = welcomeEmail(data)
  return sendEmail({ to, subject, html, text })
}

/**
 * Send a donation receipt to donors
 */
export async function sendDonationReceipt(to: string, data: DonationReceiptData) {
  const { subject, html, text } = donationReceiptEmail(data)
  return sendEmail({ to, subject, html, text })
}

/**
 * Send a compliance reminder email
 */
export async function sendComplianceReminder(to: string | string[], data: ComplianceReminderData) {
  const { subject, html, text } = complianceReminderEmail(data)
  return sendEmail({ to, subject, html, text })
}

/**
 * Send a trial expiring notification
 */
export async function sendTrialExpiringEmail(to: string, data: TrialExpiringData) {
  const { subject, html, text } = trialExpiringEmail(data)
  return sendEmail({ to, subject, html, text })
}

/**
 * Send a welcome email to new volunteers
 */
export async function sendVolunteerWelcome(to: string, data: VolunteerWelcomeData) {
  const { subject, html, text } = volunteerWelcomeEmail(data)
  return sendEmail({ to, subject, html, text })
}

/**
 * Helper to generate receipt number for donations
 */
export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `RCP-${timestamp}-${random}`
}

/**
 * Format date for email display
 */
export function formatEmailDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
