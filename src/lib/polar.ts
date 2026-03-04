// Polar.sh Payment Configuration
// This file contains pricing tiers and checkout URL helpers

export interface PricingTier {
  id: string
  name: string
  description: string
  price: number
  interval: 'monthly' | 'yearly'
  features: string[]
  popular?: boolean
  checkoutUrl: string
}

// Base checkout URL from environment
const POLAR_CHECKOUT_BASE = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL || 'https://buy.polar.sh/polar_cl_CducjBA5CFUyaS1dcA5b8iqPdDS7rvAvZUffm3RQcEk'

// Pricing tiers for 508(c)(1)(A) Ministry Dashboard
export const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small ministries just getting started',
    price: 47,
    interval: 'monthly',
    features: [
      'Up to 100 members',
      'Basic trust documents',
      'Donation tracking',
      'Email support',
      'Basic reporting',
    ],
    checkoutUrl: `${POLAR_CHECKOUT_BASE}?tier=starter`,
  },
  {
    id: 'ministry',
    name: 'Ministry',
    description: 'Full-featured solution for growing ministries',
    price: 97,
    interval: 'monthly',
    popular: true,
    features: [
      'Unlimited members',
      'Complete trust management',
      'Advanced donation tracking',
      'Volunteer management',
      'Partner management',
      'Food & farm production tracking',
      'Distribution management',
      'AI-powered activity log',
      'Priority email support',
      'Compliance dashboard',
      'Custom reports',
    ],
    checkoutUrl: POLAR_CHECKOUT_BASE, // Default tier
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large ministries with multiple locations',
    price: 197,
    interval: 'monthly',
    features: [
      'Everything in Ministry',
      'Multiple ministry locations',
      'Advanced user roles',
      'API access',
      'White-label options',
      'Dedicated account manager',
      'Phone support',
      'Custom integrations',
      'Training sessions',
    ],
    checkoutUrl: `${POLAR_CHECKOUT_BASE}?tier=enterprise`,
  },
]

// Yearly pricing (2 months free)
export const yearlyPricingTiers: PricingTier[] = pricingTiers.map(tier => ({
  ...tier,
  id: `${tier.id}-yearly`,
  price: tier.price * 10, // 10 months instead of 12 (2 months free)
  interval: 'yearly' as const,
  checkoutUrl: `${tier.checkoutUrl}&interval=yearly`,
}))

// Helper to get checkout URL with metadata
export function getCheckoutUrl(
  tierId: string,
  options?: {
    email?: string
    successUrl?: string
    cancelUrl?: string
  }
): string {
  const tier = [...pricingTiers, ...yearlyPricingTiers].find(t => t.id === tierId)
  if (!tier) return POLAR_CHECKOUT_BASE

  const url = new URL(tier.checkoutUrl)

  if (options?.email) {
    url.searchParams.set('email', options.email)
  }
  if (options?.successUrl) {
    url.searchParams.set('success_url', options.successUrl)
  }
  if (options?.cancelUrl) {
    url.searchParams.set('cancel_url', options.cancelUrl)
  }

  return url.toString()
}

// Get default checkout URL (Ministry tier)
export function getDefaultCheckoutUrl(): string {
  return POLAR_CHECKOUT_BASE
}

// Trial configuration
export const TRIAL_DAYS = parseInt(process.env.TRIAL_DAYS || '14', 10)

// Check if user is in trial period
export function isInTrial(trialEndsAt: string | Date): boolean {
  const endDate = new Date(trialEndsAt)
  return endDate > new Date()
}

// Get days remaining in trial
export function getTrialDaysRemaining(trialEndsAt: string | Date): number {
  const endDate = new Date(trialEndsAt)
  const now = new Date()
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}
