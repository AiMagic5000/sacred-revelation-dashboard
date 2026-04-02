import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Sacred Revelation | Ministry Trust Dashboard',
  description: 'Enterprise trust management for 508(c)(1)(A) faith-based ministries. Administered by Sacred Revelation, A Free Church.',
}

function EncryptionMarquee() {
  return (
    <div className="w-full bg-slate-900 text-white overflow-hidden" style={{ height: '36px', lineHeight: '36px' }}>
      <div
        className="whitespace-nowrap inline-block"
        style={{
          animation: 'marquee 45s linear infinite',
        }}
      >
        <span className="mx-8 text-xs font-medium tracking-wide">
          &#128274; 256-BIT AES ENCRYPTED &bull; ACCESS RESTRICTED &bull; THIS DOMAIN IS PROTECTED BY ENTERPRISE-GRADE ENCRYPTION &bull; ONLY TWO (2) AUTHORIZED EMAIL ADDRESSES MAY ACCESS THIS SITE: support@startmybusiness.us AND gracenote37@icloud.com &bull; VERIFICATION CODE REQUIRED FOR EVERY SESSION &bull; NO PUBLIC ACCESS PERMITTED UNLESS DIRECTOR/ADMINISTRATOR PATRICIA WARD SPECIFICALLY AUTHORIZES PUBLIC ACCESS AND DEFINES THE STIPULATIONS THEREOF &bull; ALL SESSIONS ARE LOGGED AND MONITORED &bull; 256-BIT AES ENCRYPTED &bull; ACCESS RESTRICTED &bull; THIS DOMAIN IS PROTECTED BY ENTERPRISE-GRADE ENCRYPTION &bull; ONLY TWO (2) AUTHORIZED EMAIL ADDRESSES MAY ACCESS THIS SITE: support@startmybusiness.us AND gracenote37@icloud.com &bull; VERIFICATION CODE REQUIRED FOR EVERY SESSION &bull; NO PUBLIC ACCESS PERMITTED UNLESS DIRECTOR/ADMINISTRATOR PATRICIA WARD SPECIFICALLY AUTHORIZES PUBLIC ACCESS AND DEFINES THE STIPULATIONS THEREOF &bull; ALL SESSIONS ARE LOGGED AND MONITORED
        </span>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  )
}

function SecurityNotice() {
  return (
    <div className="w-full bg-indigo-950 border-b border-indigo-800">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <p className="text-xs text-indigo-200 text-center leading-relaxed">
          <span className="font-bold text-white">PRIVATE ACCESS NOTICE:</span>{' '}
          This landing page may appear public-facing, however access to this domain requires
          email verification through one of only two authorized accounts. Access to the Sacred Revelation
          Trust Software and Dashboard requires traditional authentication via Clerk after domain-level clearance.
          Should the trust owner and Director/Administrator <span className="font-semibold text-white">Patricia Ward</span>{' '}
          elect to allow public access for trustees, grantors, nominees, directors, donation receipt holders,
          or other authorized parties, that access will be enabled at her sole direction and subject to any
          stipulations she may define. Until such authorization is granted, this site remains fully private.
        </p>
        <p className="text-[10px] text-indigo-400 text-center mt-1.5">
          Authorized email addresses: support@startmybusiness.us | gracenote37@icloud.com
        </p>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased">
          <EncryptionMarquee />
          <SecurityNotice />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
