import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Sacred Revelation | Ministry Trust Dashboard',
  description: 'Enterprise trust management for 508(c)(1)(A) faith-based ministries. Administered by Sacred Revelation, A Free Church.',
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
