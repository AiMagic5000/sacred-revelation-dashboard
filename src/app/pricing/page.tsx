'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Sparkles, ArrowLeft, Shield, Users, FileText, Heart } from 'lucide-react'
import { pricingTiers, yearlyPricingTiers, PricingTier } from '@/lib/polar'

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const currentTiers = billingInterval === 'monthly' ? pricingTiers : yearlyPricingTiers

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">508</span>
            </div>
            <span className="font-semibold text-gray-900">Ministry Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 font-medium">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-primary">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to manage your 508(c)(1)(A) ministry.
            Start with a 14-day free trial, no credit card required.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === 'yearly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-green-600 text-xs font-semibold">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {currentTiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </div>

        {/* Features Grid */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            All plans include
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'IRS Compliance', description: '508(c)(1)(A) specific tools' },
              { icon: Users, title: 'Team Management', description: 'Invite unlimited team members' },
              { icon: FileText, title: 'Document Storage', description: 'Secure cloud storage' },
              { icon: Heart, title: 'Donor Management', description: 'Track all donations' },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'What is a 508(c)(1)(A) organization?',
                a: 'A 508(c)(1)(A) organization is a faith-based nonprofit that is automatically exempt from federal income tax without filing for 501(c)(3) status. Our dashboard is specifically designed for these ministries.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.',
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. We use industry-standard encryption and security practices. Your data is stored securely and never shared with third parties.',
              },
              {
                q: 'Do you offer nonprofit discounts?',
                a: 'Our pricing is already designed to be affordable for faith-based organizations. Contact us if you have specific needs.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-lg"
          >
            <Sparkles className="w-5 h-5" />
            Start Your 14-Day Free Trial
          </Link>
          <p className="text-gray-500 mt-4">No credit card required</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          <p>&copy; 2025 508 Ministry Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function PricingCard({ tier }: { tier: PricingTier }) {
  const isPopular = tier.popular

  return (
    <div
      className={`relative rounded-2xl border-2 p-8 ${
        isPopular
          ? 'border-primary-500 bg-primary-50/50 shadow-xl shadow-primary-100'
          : 'border-gray-200 bg-white'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            Most Popular
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
        <p className="text-gray-500 mt-1">{tier.description}</p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-gray-900">${tier.price}</span>
          <span className="text-gray-500">/{tier.interval === 'yearly' ? 'year' : 'month'}</span>
        </div>
        {tier.interval === 'yearly' && (
          <p className="text-sm text-green-600 font-medium mt-1">Save 2 months free!</p>
        )}
      </div>

      <a
        href={tier.checkoutUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition-all ${
          isPopular
            ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        Get Started
      </a>

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
