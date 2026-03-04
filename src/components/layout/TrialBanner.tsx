'use client'

import { AlertCircle, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { getTrialDaysRemaining } from '@/lib/utils'

interface TrialBannerProps {
  trialEndsAt?: string
}

export function TrialBanner({ trialEndsAt }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !trialEndsAt) return null

  const daysRemaining = getTrialDaysRemaining(trialEndsAt)

  if (daysRemaining <= 0) return null

  const isUrgent = daysRemaining <= 3

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 ${
        isUrgent ? 'bg-amber-50 border-b border-amber-200' : 'bg-primary-50 border-b border-primary-200'
      }`}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className={`w-4 h-4 ${isUrgent ? 'text-amber-600' : 'text-primary-600'}`} />
        <span className={`text-sm font-medium ${isUrgent ? 'text-amber-800' : 'text-primary-800'}`}>
          {daysRemaining === 1
            ? 'Your trial ends tomorrow!'
            : `${daysRemaining} days left in your trial`}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL || '/dashboard/settings/billing'}
          className={`text-sm font-medium ${
            isUrgent
              ? 'text-amber-700 hover:text-amber-800'
              : 'text-primary-700 hover:text-primary-800'
          }`}
        >
          Upgrade now →
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/50 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  )
}
