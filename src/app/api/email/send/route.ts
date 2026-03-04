import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/config'
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
} from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, data } = body

    if (!type || !to) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type and to' },
        { status: 400 }
      )
    }

    let emailContent: { subject: string; html: string; text: string }

    switch (type) {
      case 'welcome':
        emailContent = welcomeEmail(data as WelcomeEmailData)
        break

      case 'donation-receipt':
        emailContent = donationReceiptEmail(data as DonationReceiptData)
        break

      case 'compliance-reminder':
        emailContent = complianceReminderEmail(data as ComplianceReminderData)
        break

      case 'trial-expiring':
        emailContent = trialExpiringEmail(data as TrialExpiringData)
        break

      case 'volunteer-welcome':
        emailContent = volunteerWelcomeEmail(data as VolunteerWelcomeData)
        break

      case 'custom':
        // Allow custom emails with subject, html, and text
        if (!data.subject || !data.html) {
          return NextResponse.json(
            { success: false, error: 'Custom emails require subject and html' },
            { status: 400 }
          )
        }
        emailContent = {
          subject: data.subject,
          html: data.html,
          text: data.text || data.html.replace(/<[^>]*>/g, ''),
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: `Unknown email type: ${type}` },
          { status: 400 }
        )
    }

    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      replyTo: data.replyTo,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        demo: result.messageId === 'demo-mode',
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Email API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
