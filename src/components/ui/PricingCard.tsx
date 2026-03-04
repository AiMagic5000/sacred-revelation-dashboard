'use client'

import { Check, Sparkles } from 'lucide-react'
import { PricingTier } from '@/lib/polar'

interface PricingCardProps {
  tier: PricingTier
  onSelect?: (tier: PricingTier) => void
  currentPlan?: string
}

export function PricingCard({ tier, onSelect, currentPlan }: PricingCardProps) {
  const isCurrentPlan = currentPlan === tier.id
  const isPopular = tier.popular

  const handleClick = () => {
    if (onSelect) {
      onSelect(tier)
    } else {
      // Direct redirect to Polar checkout
      window.open(tier.checkoutUrl, '_blank')
    }
  }

  return (
    <div
      className={`relative rounded-2xl border-2 p-6 ${
        isPopular
          ? 'border-primary-500 bg-primary-50/50 shadow-lg shadow-primary-100'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            Most Popular
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
          <span className="text-gray-500">/{tier.interval === 'yearly' ? 'year' : 'month'}</span>
        </div>
        {tier.interval === 'yearly' && (
          <p className="text-sm text-green-600 font-medium mt-1">
            Save 2 months free!
          </p>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleClick}
        disabled={isCurrentPlan}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : isPopular
              ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : 'Upgrade Now'}
      </button>

      {/* Features */}
      <ul className="mt-6 space-y-3">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Compact upgrade button for use in headers/sidebars
interface UpgradeButtonProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'outline' | 'gradient'
  className?: string
}

export function UpgradeButton({
  size = 'md',
  variant = 'primary',
  className = '',
}: UpgradeButtonProps) {
  const checkoutUrl = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL || 'https://buy.polar.sh/polar_cl_CducjBA5CFUyaS1dcA5b8iqPdDS7rvAvZUffm3RQcEk'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    gradient: 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700',
  }

  return (
    <a
      href={checkoutUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 font-semibold rounded-lg transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <Sparkles className="w-4 h-4" />
      Upgrade
    </a>
  )
}
