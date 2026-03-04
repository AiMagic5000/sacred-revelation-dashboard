import nodemailer from 'nodemailer'

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || process.env.SMTP_PASSWORD === 'your_smtp_password_here') {
    console.log('Email not sent - SMTP not configured:', options.subject)
    return {
      success: true,
      messageId: 'demo-mode',
    }
  }

  try {
    const info = await transporter.sendMail({
      from: `"508 Ministry Dashboard" <${process.env.SMTP_FROM}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      replyTo: options.replyTo,
    })

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

export async function verifyConnection(): Promise<boolean> {
  if (!process.env.SMTP_HOST || process.env.SMTP_PASSWORD === 'your_smtp_password_here') {
    return false
  }

  try {
    await transporter.verify()
    return true
  } catch {
    return false
  }
}
