'use client'

import { useState } from 'react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  Code2,
  ExternalLink,
  DollarSign,
  Users,
  Percent,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
  Building2,
  Shield,
  Zap,
} from 'lucide-react'

interface SoftwareProduct {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  link: string
  category: 'dashboard' | 'automation' | 'compliance' | 'integration'
  popular?: boolean
}

const softwareProducts: SoftwareProduct[] = [
  {
    id: '1',
    name: 'Complete 508 Build Out',
    description: 'Full 508(c)(1)(A) trust setup including software, compliance, documentation, and ongoing support. Everything you need to operate as a tax-exempt faith-based organization.',
    price: 2925,
    features: [
      'Complete Trust Formation',
      'All Software Included',
      'Trust Documents & Bylaws',
      'IRS Compliance Setup',
      'Dashboard Access',
      'Training & Support',
    ],
    link: 'https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into',
    category: 'dashboard',
    popular: true,
  },
  {
    id: '2',
    name: '508 Software Only',
    description: 'Full access to the 508 Ministry Dashboard software suite. Perfect for organizations that already have their trust established.',
    price: 1495,
    features: [
      'Ministry Dashboard',
      'Trust Data Management',
      'Donation Tracking',
      'Volunteer Management',
      'Compliance Reports',
      'AI Activity Logging',
    ],
    link: 'https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into',
    category: 'dashboard',
    popular: true,
  },
  {
    id: '3',
    name: '508 Automation Suite',
    description: 'AI-powered automation for ministry operations. Automate emails, reports, and administrative tasks.',
    price: 297,
    features: [
      'Email Automation',
      'Report Generation',
      'Meeting Transcription',
      'Task Scheduling',
      'AI Assistant',
      'Workflow Builder',
    ],
    link: 'https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into',
    category: 'automation',
  },
  {
    id: '4',
    name: '508 Compliance Toolkit',
    description: 'Stay compliant with IRS requirements for 508(c)(1)(A) organizations. Automated checks and documentation.',
    price: 197,
    features: [
      'IRS Compliance Checks',
      'Document Templates',
      'Annual Report Generator',
      'Audit Trail',
      'Legal Updates',
      'Expert Support',
    ],
    link: 'https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into',
    category: 'compliance',
  },
  {
    id: '5',
    name: '508 Integration Hub',
    description: 'Connect your ministry tools. Integrates with QuickBooks, Mailchimp, Google Workspace, and more.',
    price: 147,
    features: [
      'QuickBooks Sync',
      'Email Marketing',
      'Google Workspace',
      'Payment Processing',
      'CRM Integration',
      'API Access',
    ],
    link: 'https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into',
    category: 'integration',
  },
]

const categoryIcons = {
  dashboard: Building2,
  automation: Zap,
  compliance: Shield,
  integration: Code2,
}

const categoryLabels = {
  dashboard: 'Dashboard',
  automation: 'Automation',
  compliance: 'Compliance',
  integration: 'Integration',
}

export default function SoftwarePage() {
  return (
    <ThemeProvider>
      {(theme) => <SoftwareContent theme={theme} />}
    </ThemeProvider>
  )
}

function SoftwareContent({ theme }: { theme: DashboardTheme }) {
  const classes = getThemeClasses(theme)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const filteredProducts = filterCategory === 'all'
    ? softwareProducts
    : softwareProducts.filter(p => p.category === filterCategory)

  const commissionRate = 20
  const totalProducts = softwareProducts.length
  const potentialCommission = softwareProducts.reduce((sum, p) => sum + (p.price * commissionRate / 100), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">508 Software</h1>
          <p className="text-gray-600 mt-1">Recommend our software and earn 20% commission on every sale</p>
        </div>
        <a
          href="https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium',
            classes.bgPrimary,
            'hover:opacity-90 transition-opacity'
          )}
        >
          <Users className="w-5 h-5" />
          Become a Reseller
        </a>
      </div>

      {/* Commission Banner */}
      <div className={cn(
        'rounded-xl p-6 mb-8 bg-gradient-to-r from-purple-700 to-indigo-900 text-white'
      )}>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 rounded-xl">
            <Percent className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">20% Reseller Commission</h2>
            <p className="text-purple-200">
              Earn $99+ per referral. Share your unique link and get paid when customers purchase.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-200">Potential earnings per product set</p>
            <p className="text-3xl font-bold">${potentialCommission.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Code2 className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-sm text-gray-600">Products Available</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-200">
              <Percent className="w-6 h-6 text-purple-800" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">20%</p>
              <p className="text-sm text-gray-600">Commission Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-100">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">$1,240</p>
              <p className="text-sm text-gray-600">Your Earnings (Demo)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-600">Referrals (Demo)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterCategory('all')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            filterCategory === 'all'
              ? cn(classes.bgPrimary, 'text-white')
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          All Products
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const Icon = categoryIcons[key as keyof typeof categoryIcons]
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                filterCategory === key
                  ? cn(classes.bgPrimary, 'text-white')
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredProducts.map(product => {
          const Icon = categoryIcons[product.category]
          const commission = (product.price * commissionRate / 100).toFixed(0)

          return (
            <div
              key={product.id}
              className={cn(
                'bg-white rounded-xl shadow-sm border-2 p-6 relative overflow-hidden',
                product.popular ? 'border-purple-500' : 'border-gray-200'
              )}
            >
              {product.popular && (
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-1 bg-purple-700 text-white text-xs font-bold px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-white" />
                    Popular
                  </span>
                </div>
              )}

              <div className={cn('p-3 rounded-lg w-fit mb-4', classes.bgLight)}>
                <Icon className={cn('w-6 h-6', classes.textPrimary)} />
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

              <div className="space-y-2 mb-4">
                {product.features.slice(0, 4).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-700 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
                {product.features.length > 4 && (
                  <p className="text-xs text-gray-500 pl-6">
                    +{product.features.length - 4} more features
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-2xl font-bold text-gray-900">${product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Your Commission</p>
                    <p className="text-xl font-bold text-purple-800">${commission}</p>
                  </div>
                </div>

                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium',
                    classes.bgPrimary,
                    'text-white hover:opacity-90 transition-opacity'
                  )}
                >
                  View Product
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          How the Reseller Program Works
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3', classes.bgLight)}>
              <span className={cn('text-xl font-bold', classes.textPrimary)}>1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Sign Up</h3>
            <p className="text-sm text-gray-600">Register as a 508 Trust Services reseller</p>
          </div>
          <div className="text-center">
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3', classes.bgLight)}>
              <span className={cn('text-xl font-bold', classes.textPrimary)}>2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Get Your Link</h3>
            <p className="text-sm text-gray-600">Receive your unique referral tracking link</p>
          </div>
          <div className="text-center">
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3', classes.bgLight)}>
              <span className={cn('text-xl font-bold', classes.textPrimary)}>3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Share & Refer</h3>
            <p className="text-sm text-gray-600">Share products with your network</p>
          </div>
          <div className="text-center">
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3', classes.bgLight)}>
              <span className={cn('text-xl font-bold', classes.textPrimary)}>4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Earn 20%</h3>
            <p className="text-sm text-gray-600">Get paid for every successful sale</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className={cn('rounded-xl p-6', classes.bgLight)}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Ready to Start Earning?</h3>
            <p className="text-gray-600">Join our reseller program and earn 20% on every sale you refer.</p>
          </div>
          <a
            href="https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg font-medium',
              classes.bgPrimary,
              'text-white hover:opacity-90 transition-opacity'
            )}
          >
            Apply Now
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
