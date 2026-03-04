// Email templates for 508 Ministry Dashboard

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #374151;
`

const headerStyles = `
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 32px;
  text-align: center;
  border-radius: 8px 8px 0 0;
`

const contentStyles = `
  background: #ffffff;
  padding: 32px;
  border: 1px solid #e5e7eb;
  border-top: none;
`

const footerStyles = `
  background: #f9fafb;
  padding: 24px 32px;
  text-align: center;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  font-size: 14px;
  color: #6b7280;
`

const buttonStyles = `
  display: inline-block;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  margin: 16px 0;
`

function wrapTemplate(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${preheader ? `<span style="display: none; max-height: 0; overflow: hidden;">${preheader}</span>` : ''}
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; ${baseStyles}">
    ${content}
  </div>
</body>
</html>
`
}

export interface WelcomeEmailData {
  organizationName: string
  userName: string
  dashboardUrl: string
  trialDays: number
}

export function welcomeEmail(data: WelcomeEmailData): { subject: string; html: string; text: string } {
  const subject = `Welcome to 508 Ministry Dashboard - ${data.organizationName}`

  const html = wrapTemplate(`
    <div style="${headerStyles}">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Welcome to 508 Ministry Dashboard</h1>
    </div>
    <div style="${contentStyles}">
      <h2 style="color: #111827; margin-top: 0;">Hello ${data.userName}!</h2>
      <p>Thank you for choosing 508 Ministry Dashboard to manage <strong>${data.organizationName}</strong>.</p>
      <p>Your ${data.trialDays}-day free trial has started. During this time, you'll have full access to all features:</p>
      <ul style="padding-left: 20px;">
        <li>Donation tracking and reporting</li>
        <li>Volunteer management</li>
        <li>Compliance monitoring</li>
        <li>Document storage</li>
        <li>AI-powered activity insights</li>
        <li>Tax document management</li>
      </ul>
      <div style="text-align: center;">
        <a href="${data.dashboardUrl}" style="${buttonStyles}">Go to Dashboard</a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">If you have any questions, our support team is here to help.</p>
    </div>
    <div style="${footerStyles}">
      <p style="margin: 0;">508 Ministry Dashboard</p>
      <p style="margin: 8px 0 0 0;">Empowering faith-based organizations</p>
    </div>
  `, `Welcome to 508 Ministry Dashboard! Your ${data.trialDays}-day trial has started.`)

  const text = `
Welcome to 508 Ministry Dashboard!

Hello ${data.userName},

Thank you for choosing 508 Ministry Dashboard to manage ${data.organizationName}.

Your ${data.trialDays}-day free trial has started. During this time, you'll have full access to all features:
- Donation tracking and reporting
- Volunteer management
- Compliance monitoring
- Document storage
- AI-powered activity insights
- Tax document management

Visit your dashboard: ${data.dashboardUrl}

If you have any questions, our support team is here to help.

508 Ministry Dashboard
Empowering faith-based organizations
`

  return { subject, html, text }
}

export interface DonationReceiptData {
  donorName: string
  donorEmail: string
  organizationName: string
  amount: number
  date: string
  receiptNumber: string
  paymentMethod: string
  isRecurring?: boolean
  dashboardUrl: string
}

export function donationReceiptEmail(data: DonationReceiptData): { subject: string; html: string; text: string } {
  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.amount)
  const subject = `Donation Receipt - ${formattedAmount} to ${data.organizationName}`

  const html = wrapTemplate(`
    <div style="${headerStyles}">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Thank You for Your Donation</h1>
    </div>
    <div style="${contentStyles}">
      <h2 style="color: #111827; margin-top: 0;">Dear ${data.donorName},</h2>
      <p>Thank you for your generous ${data.isRecurring ? 'recurring ' : ''}donation to <strong>${data.organizationName}</strong>.</p>

      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #374151;">Donation Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Amount:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #059669;">${formattedAmount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Date:</td>
            <td style="padding: 8px 0; text-align: right;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Receipt #:</td>
            <td style="padding: 8px 0; text-align: right;">${data.receiptNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Payment Method:</td>
            <td style="padding: 8px 0; text-align: right;">${data.paymentMethod}</td>
          </tr>
        </table>
      </div>

      <p style="background: #ecfdf5; border-left: 4px solid #059669; padding: 12px 16px; border-radius: 0 8px 8px 0;">
        <strong>Tax Deductible:</strong> ${data.organizationName} is a 508(c)(1)(A) faith-based organization.
        Your donation is tax-deductible to the extent allowed by law. Please retain this receipt for your records.
      </p>

      <p>Your support helps us continue our mission. Thank you for making a difference!</p>
    </div>
    <div style="${footerStyles}">
      <p style="margin: 0;">${data.organizationName}</p>
      <p style="margin: 8px 0 0 0; font-size: 12px;">This receipt was generated automatically by 508 Ministry Dashboard</p>
    </div>
  `, `Thank you for your ${formattedAmount} donation to ${data.organizationName}`)

  const text = `
Donation Receipt

Dear ${data.donorName},

Thank you for your generous ${data.isRecurring ? 'recurring ' : ''}donation to ${data.organizationName}.

Donation Details:
- Amount: ${formattedAmount}
- Date: ${data.date}
- Receipt #: ${data.receiptNumber}
- Payment Method: ${data.paymentMethod}

Tax Deductible: ${data.organizationName} is a 508(c)(1)(A) faith-based organization. Your donation is tax-deductible to the extent allowed by law. Please retain this receipt for your records.

Your support helps us continue our mission. Thank you for making a difference!

${data.organizationName}
`

  return { subject, html, text }
}

export interface ComplianceReminderData {
  userName: string
  organizationName: string
  taskTitle: string
  dueDate: string
  daysUntilDue: number
  taskDescription?: string
  dashboardUrl: string
}

export function complianceReminderEmail(data: ComplianceReminderData): { subject: string; html: string; text: string } {
  const urgency = data.daysUntilDue <= 7 ? 'Urgent: ' : ''
  const subject = `${urgency}Compliance Reminder - ${data.taskTitle} due ${data.dueDate}`

  const urgencyColor = data.daysUntilDue <= 7 ? '#dc2626' : data.daysUntilDue <= 14 ? '#d97706' : '#0d9488'

  const html = wrapTemplate(`
    <div style="${headerStyles}">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Compliance Reminder</h1>
    </div>
    <div style="${contentStyles}">
      <h2 style="color: #111827; margin-top: 0;">Hello ${data.userName},</h2>
      <p>This is a reminder about an upcoming compliance task for <strong>${data.organizationName}</strong>.</p>

      <div style="background: #f9fafb; border-left: 4px solid ${urgencyColor}; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
        <h3 style="margin-top: 0; color: #374151;">${data.taskTitle}</h3>
        ${data.taskDescription ? `<p style="color: #6b7280; margin-bottom: 16px;">${data.taskDescription}</p>` : ''}
        <p style="margin: 0;">
          <strong style="color: ${urgencyColor};">Due: ${data.dueDate}</strong>
          <span style="color: #6b7280;"> (${data.daysUntilDue} days remaining)</span>
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${data.dashboardUrl}/dashboard/compliance" style="${buttonStyles}">View Compliance Tasks</a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">
        Staying compliant helps maintain your 508(c)(1)(A) status and ensures transparency in your ministry operations.
      </p>
    </div>
    <div style="${footerStyles}">
      <p style="margin: 0;">508 Ministry Dashboard</p>
      <p style="margin: 8px 0 0 0;">Keeping your ministry compliant and organized</p>
    </div>
  `, `Reminder: ${data.taskTitle} is due ${data.dueDate}`)

  const text = `
Compliance Reminder

Hello ${data.userName},

This is a reminder about an upcoming compliance task for ${data.organizationName}.

Task: ${data.taskTitle}
${data.taskDescription ? `Description: ${data.taskDescription}\n` : ''}Due Date: ${data.dueDate} (${data.daysUntilDue} days remaining)

View your compliance tasks: ${data.dashboardUrl}/dashboard/compliance

Staying compliant helps maintain your 508(c)(1)(A) status and ensures transparency in your ministry operations.

508 Ministry Dashboard
Keeping your ministry compliant and organized
`

  return { subject, html, text }
}

export interface TrialExpiringData {
  userName: string
  organizationName: string
  daysRemaining: number
  expirationDate: string
  dashboardUrl: string
}

export function trialExpiringEmail(data: TrialExpiringData): { subject: string; html: string; text: string } {
  const subject = `Your trial expires in ${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''} - ${data.organizationName}`

  const html = wrapTemplate(`
    <div style="${headerStyles}">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Your Trial is Ending Soon</h1>
    </div>
    <div style="${contentStyles}">
      <h2 style="color: #111827; margin-top: 0;">Hello ${data.userName},</h2>
      <p>Your free trial for <strong>${data.organizationName}</strong> will expire on <strong>${data.expirationDate}</strong>.</p>

      <div style="background: #fef3c7; border-left: 4px solid #d97706; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #92400e;">
          <strong>${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''} remaining</strong> in your trial period.
        </p>
      </div>

      <p>To continue using all the features you've come to rely on, upgrade to a paid plan:</p>

      <ul style="padding-left: 20px;">
        <li>Keep all your data and settings</li>
        <li>Unlimited donations and volunteer tracking</li>
        <li>Advanced compliance monitoring</li>
        <li>AI-powered insights</li>
        <li>Priority support</li>
      </ul>

      <div style="text-align: center;">
        <a href="${data.dashboardUrl}/dashboard/settings" style="${buttonStyles}">Upgrade Now</a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">
        Questions about pricing? Reply to this email and we'll be happy to help.
      </p>
    </div>
    <div style="${footerStyles}">
      <p style="margin: 0;">508 Ministry Dashboard</p>
      <p style="margin: 8px 0 0 0;">Empowering faith-based organizations</p>
    </div>
  `, `Your trial expires in ${data.daysRemaining} days. Upgrade now to keep your data.`)

  const text = `
Your Trial is Ending Soon

Hello ${data.userName},

Your free trial for ${data.organizationName} will expire on ${data.expirationDate}.

${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''} remaining in your trial period.

To continue using all the features you've come to rely on, upgrade to a paid plan:
- Keep all your data and settings
- Unlimited donations and volunteer tracking
- Advanced compliance monitoring
- AI-powered insights
- Priority support

Upgrade now: ${data.dashboardUrl}/dashboard/settings

Questions about pricing? Reply to this email and we'll be happy to help.

508 Ministry Dashboard
Empowering faith-based organizations
`

  return { subject, html, text }
}

export interface VolunteerWelcomeData {
  volunteerName: string
  organizationName: string
  role: string
  startDate: string
  contactEmail: string
}

export function volunteerWelcomeEmail(data: VolunteerWelcomeData): { subject: string; html: string; text: string } {
  const subject = `Welcome to ${data.organizationName} - Volunteer Confirmation`

  const html = wrapTemplate(`
    <div style="${headerStyles}">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Welcome to the Team!</h1>
    </div>
    <div style="${contentStyles}">
      <h2 style="color: #111827; margin-top: 0;">Hello ${data.volunteerName}!</h2>
      <p>Welcome to <strong>${data.organizationName}</strong>! We're excited to have you join our volunteer team.</p>

      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #374151;">Your Volunteer Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Role:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.role}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Start Date:</td>
            <td style="padding: 8px 0; text-align: right;">${data.startDate}</td>
          </tr>
        </table>
      </div>

      <p>Your time and dedication make a real difference in our ministry. We look forward to working with you!</p>

      <p style="color: #6b7280; font-size: 14px;">
        If you have any questions, please contact us at <a href="mailto:${data.contactEmail}" style="color: #0d9488;">${data.contactEmail}</a>
      </p>
    </div>
    <div style="${footerStyles}">
      <p style="margin: 0;">${data.organizationName}</p>
      <p style="margin: 8px 0 0 0;">Thank you for volunteering!</p>
    </div>
  `, `Welcome to ${data.organizationName}! You're now part of our volunteer team.`)

  const text = `
Welcome to the Team!

Hello ${data.volunteerName},

Welcome to ${data.organizationName}! We're excited to have you join our volunteer team.

Your Volunteer Details:
- Role: ${data.role}
- Start Date: ${data.startDate}

Your time and dedication make a real difference in our ministry. We look forward to working with you!

If you have any questions, please contact us at ${data.contactEmail}

${data.organizationName}
Thank you for volunteering!
`

  return { subject, html, text }
}
