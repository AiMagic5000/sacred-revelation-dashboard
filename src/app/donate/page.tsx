'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Heart,
  Shield,
  Church,
  Wheat,
  Sparkles,
  Music,
  Users,
  Globe,
  GraduationCap,
  Leaf,
  DollarSign,
  Clock,
  Package,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  User,
  MessageSquare,
  Repeat,
  Gift,
  HeartHandshake,
  MapPin,
  Truck,
  Info,
} from 'lucide-react'

/* ────────────────────────────────────────────────────────── */
/*  TYPES                                                     */
/* ────────────────────────────────────────────────────────── */

type DonationType = 'money' | 'time' | 'resources'
type Frequency = 'one-time' | 'recurring'

interface DonationCategory {
  id: string
  label: string
  icon: typeof Heart
  color: string
  iconBg: string
  description: string
}

interface FormState {
  donationType: DonationType
  category: string
  amount: number | null
  customAmount: string
  frequency: Frequency
  donorName: string
  donorEmail: string
  donorPhone: string
  message: string
  // resource / time fields
  resourceDescription: string
  estimatedValue: string
  deliveryPreference: 'pickup' | 'dropoff' | ''
  volunteerHours: string
}

interface SubmissionResult {
  success: boolean
  receiptNumber?: string
  error?: string
}

/* ────────────────────────────────────────────────────────── */
/*  DATA                                                      */
/* ────────────────────────────────────────────────────────── */

const CATEGORIES: DonationCategory[] = [
  {
    id: 'general',
    label: 'General Fund / Tithes',
    icon: Church,
    color: 'text-purple-600',
    iconBg: 'bg-purple-100',
    description: 'Support the overall mission and daily operations of our ministry.',
  },
  {
    id: 'building',
    label: 'Building Fund',
    icon: Shield,
    color: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    description: 'Help us expand and maintain our physical spaces for worship and service.',
  },
  {
    id: 'food',
    label: 'Food Ministry',
    icon: Wheat,
    color: 'text-amber-600',
    iconBg: 'bg-amber-100',
    description: 'Feed families through our aquaponics and community food distribution programs.',
  },
  {
    id: 'healing',
    label: 'Healing Ministry',
    icon: Sparkles,
    color: 'text-rose-600',
    iconBg: 'bg-rose-100',
    description: 'Support prayer, faith-based healing, and spiritual wellness programs.',
  },
  {
    id: 'music',
    label: 'Music & Worship',
    icon: Music,
    color: 'text-sky-600',
    iconBg: 'bg-sky-100',
    description: 'Fund instruments, sound equipment, and worship events that bring us together.',
  },
  {
    id: 'outreach',
    label: 'Community Outreach',
    icon: Users,
    color: 'text-teal-600',
    iconBg: 'bg-teal-100',
    description: 'Partner with churches and organizations to extend love and service.',
  },
  {
    id: 'youth',
    label: 'Youth Programs',
    icon: GraduationCap,
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    description: 'Invest in the next generation through mentorship, education, and faith.',
  },
  {
    id: 'missions',
    label: 'Missions',
    icon: Globe,
    color: 'text-violet-600',
    iconBg: 'bg-violet-100',
    description: 'Send resources and support to communities beyond our local region.',
  },
]

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000]

const DONATION_TYPES: { id: DonationType; label: string; icon: typeof DollarSign; description: string }[] = [
  { id: 'money', label: 'Financial Gift', icon: DollarSign, description: 'Monetary donation by check, cash, or online (coming soon)' },
  { id: 'time', label: 'Volunteer Time', icon: Clock, description: 'Give your time and skills to our ministry programs' },
  { id: 'resources', label: 'Resources & Goods', icon: Package, description: 'Donate food, supplies, equipment, or other items' },
]

const INITIAL_FORM: FormState = {
  donationType: 'money',
  category: '',
  amount: null,
  customAmount: '',
  frequency: 'one-time',
  donorName: '',
  donorEmail: '',
  donorPhone: '',
  message: '',
  resourceDescription: '',
  estimatedValue: '',
  deliveryPreference: '',
  volunteerHours: '',
}

/* ────────────────────────────────────────────────────────── */
/*  FADE-IN OBSERVER HOOK                                     */
/* ────────────────────────────────────────────────────────── */

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

/* ────────────────────────────────────────────────────────── */
/*  SECTION WRAPPER WITH FADE-IN                              */
/* ────────────────────────────────────────────────────────── */

function FadeSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, visible } = useFadeIn()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  NAVBAR (simplified for donate page)                       */
/* ────────────────────────────────────────────────────────── */

function DonateNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4338CA)' }}
            >
              <span>&#10014;</span>
            </div>
            <div>
              <span className={`font-bold text-lg ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                Sacred Revelation
              </span>
              <p className={`text-[10px] font-medium leading-none ${scrolled ? 'text-purple-600' : 'text-white/70'}`}>
                Free Church Ministry Trust
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={`hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors ${
                scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/sign-in"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4338CA)' }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  MAIN PAGE COMPONENT                                       */
/* ────────────────────────────────────────────────────────── */

export default function DonatePage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmissionResult | null>(null)
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null)
  const formSectionRef = useRef<HTMLDivElement>(null)

  const updateForm = (updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }))
  }

  const effectiveAmount = form.amount ?? (form.customAmount ? parseFloat(form.customAmount) : 0)

  const isMoneyFormValid =
    form.donationType === 'money' &&
    form.category !== '' &&
    effectiveAmount > 0 &&
    form.donorName.trim() !== '' &&
    form.donorEmail.trim() !== ''

  const isTimeFormValid =
    form.donationType === 'time' &&
    form.category !== '' &&
    form.volunteerHours.trim() !== '' &&
    form.donorName.trim() !== '' &&
    form.donorEmail.trim() !== ''

  const isResourceFormValid =
    form.donationType === 'resources' &&
    form.category !== '' &&
    form.resourceDescription.trim() !== '' &&
    form.donorName.trim() !== '' &&
    form.donorEmail.trim() !== ''

  const isFormValid = isMoneyFormValid || isTimeFormValid || isResourceFormValid

  const handleCategorySelect = (catId: string, index: number) => {
    updateForm({ category: catId })
    setSelectedCategoryIndex(index)
  }

  const handleAmountSelect = (amt: number) => {
    updateForm({ amount: amt, customAmount: '' })
  }

  const handleCustomAmountChange = (value: string) => {
    updateForm({ customAmount: value, amount: null })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setSubmitting(true)
    setResult(null)

    try {
      const body: Record<string, unknown> = {
        donation_type: form.donationType,
        category: form.category,
        frequency: form.frequency,
        donor_name: form.donorName.trim(),
        donor_email: form.donorEmail.trim(),
        donor_phone: form.donorPhone.trim() || undefined,
        message: form.message.trim() || undefined,
      }

      if (form.donationType === 'money') {
        body.amount = effectiveAmount
      } else if (form.donationType === 'time') {
        body.volunteer_hours = parseFloat(form.volunteerHours)
        body.amount = 0
      } else {
        body.resource_description = form.resourceDescription.trim()
        body.estimated_value = form.estimatedValue.trim() ? parseFloat(form.estimatedValue) : undefined
        body.delivery_preference = form.deliveryPreference || undefined
        body.amount = form.estimatedValue ? parseFloat(form.estimatedValue) : 0
      }

      const res = await fetch('/api/public/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult({ success: false, error: data.error || 'Something went wrong. Please try again.' })
        return
      }

      setResult({ success: true, receiptNumber: data.receipt_number })
    } catch {
      setResult({ success: false, error: 'Network error. Please check your connection and try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setResult(null)
    setSelectedCategoryIndex(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── THANK YOU STATE ─────────────────────────────────── */

  if (result?.success) {
    return (
      <main className="bg-white min-h-screen">
        <DonateNavbar />

        <section
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338CA 50%, #7C3AED 75%, #6d28d9 100%)',
          }}
        >
          {/* Decorative orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-2xl mx-auto px-4 text-center py-32">
            <div
              className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-8"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-300" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Thank You for Your{' '}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                Generosity
              </span>
            </h1>

            <p className="text-lg text-white/80 leading-relaxed mb-6 max-w-lg mx-auto">
              Your {form.donationType === 'money' ? 'donation' : form.donationType === 'time' ? 'volunteer commitment' : 'resource donation'} has been
              recorded. Every act of giving strengthens our ministry and the families we serve.
            </p>

            {result.receiptNumber && (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
                <span className="text-sm text-white/70">Receipt Number:</span>
                <span className="text-sm font-bold text-white">{result.receiptNumber}</span>
              </div>
            )}

            <p className="text-sm text-white/60 mb-10 max-w-md mx-auto">
              A confirmation has been recorded. You will receive a tax-deductible receipt for your records.
              All donations to Sacred Revelation, A Free Church, qualify under IRC Section 170.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-indigo-900 bg-white hover:bg-slate-50 transition-all shadow-lg"
              >
                <Gift className="w-5 h-5" />
                Make Another Donation
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Return Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  /* ── MAIN DONATE FORM ────────────────────────────────── */

  return (
    <main className="bg-white min-h-screen">
      <DonateNavbar />

      {/* ── HERO ──────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338CA 50%, #7C3AED 75%, #6d28d9 100%)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400/5 rounded-full blur-3xl" />
          {/* Floating crosses */}
          {([
            { top: '15%', left: '8%', right: '', size: 'text-3xl', opacity: 'opacity-[0.06]' },
            { top: '25%', left: '', right: '12%', size: 'text-5xl', opacity: 'opacity-[0.04]' },
            { top: '60%', left: '15%', right: '', size: 'text-4xl', opacity: 'opacity-[0.05]' },
            { top: '70%', left: '', right: '20%', size: 'text-3xl', opacity: 'opacity-[0.06]' },
          ] as const).map((cross, i) => (
            <div
              key={i}
              className={`absolute ${cross.size} ${cross.opacity} text-white`}
              style={{ top: cross.top, left: cross.left || undefined, right: cross.right || undefined }}
            >
              &#10014;
            </div>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Heart className="w-4 h-4 text-amber-300" />
            <span className="text-sm font-medium text-white/90">Give with Purpose</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Support Our{' '}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              Ministry
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto">
            Your generosity feeds families, heals communities, and carries God's love forward.
            Every gift, whether money, time, or resources, makes a real difference.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[
              { icon: Leaf, value: '1,000 lbs', label: 'Food Monthly' },
              { icon: Users, value: '150+', label: 'Families Fed' },
              { icon: Church, value: '12', label: 'Partner Churches' },
              { icon: Shield, value: '100%', label: 'Tax-Deductible' },
            ].map((stat, i) => {
              const StatIcon = stat.icon
              return (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <StatIcon className="w-5 h-5 text-amber-300 mx-auto mb-1.5" />
                  <p className="text-xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── DONATION FORM SECTION ─────────────────────── */}
      <section ref={formSectionRef} className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            {/* ── Step 1: Donation Type ──────────────── */}
            <FadeSection className="mb-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
                  <HeartHandshake className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">Step 1</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                  How Would You Like to Give?
                </h2>
                <p className="text-slate-500 max-w-xl mx-auto">
                  Choose the type of donation that suits you best. Every form of giving matters.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {DONATION_TYPES.map((dt) => {
                  const Icon = dt.icon
                  const isSelected = form.donationType === dt.id
                  return (
                    <button
                      key={dt.id}
                      type="button"
                      onClick={() => updateForm({ donationType: dt.id, category: '', amount: null, customAmount: '' })}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 shadow-md shadow-purple-100'
                          : 'border-slate-200 bg-white hover:border-purple-200 hover:shadow-sm'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-purple-900' : 'text-slate-900'}`}>
                        {dt.label}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{dt.description}</p>
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </FadeSection>

            {/* ── Step 2: Category ───────────────────── */}
            <FadeSection className="mb-12" delay={0.1}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                  <Church className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-700">Step 2</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                  Choose a Ministry Program
                </h2>
                <p className="text-slate-500 max-w-xl mx-auto">
                  Direct your {form.donationType === 'money' ? 'gift' : form.donationType === 'time' ? 'volunteer service' : 'resources'} to the area that speaks to your heart.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CATEGORIES.map((cat, i) => {
                  const Icon = cat.icon
                  const isSelected = form.category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id, i)}
                      className={`group relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 shadow-md shadow-purple-100'
                          : 'border-slate-200 bg-white hover:border-purple-200 hover:shadow-sm hover:-translate-y-0.5'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${cat.iconBg}`}
                      >
                        <Icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-purple-900' : 'text-slate-900'}`}>
                        {cat.label}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </FadeSection>

            {/* ── Step 3: Amount / Details ────────────── */}
            <FadeSection className="mb-12" delay={0.15}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
                  {form.donationType === 'money' ? (
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  ) : form.donationType === 'time' ? (
                    <Clock className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Package className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="text-sm font-semibold text-emerald-700">Step 3</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                  {form.donationType === 'money'
                    ? 'Select Your Gift Amount'
                    : form.donationType === 'time'
                    ? 'Volunteer Details'
                    : 'Describe Your Donation'}
                </h2>
              </div>

              <div className="max-w-2xl mx-auto">
                {/* MONEY: amount selection */}
                {form.donationType === 'money' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                    {/* Frequency toggle */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                      <button
                        type="button"
                        onClick={() => updateForm({ frequency: 'one-time' })}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          form.frequency === 'one-time'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Gift className="w-4 h-4" />
                        One-Time
                      </button>
                      <button
                        type="button"
                        onClick={() => updateForm({ frequency: 'recurring' })}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          form.frequency === 'recurring'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Repeat className="w-4 h-4" />
                        Monthly
                      </button>
                    </div>

                    {/* Preset amounts */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {PRESET_AMOUNTS.map((amt) => {
                        const isSelected = form.amount === amt && form.customAmount === ''
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => handleAmountSelect(amt)}
                            className={`py-4 rounded-xl text-center font-bold transition-all duration-200 ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-[1.02]'
                                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                          >
                            ${amt.toLocaleString()}
                          </button>
                        )
                      })}
                    </div>

                    {/* Custom amount */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="Enter amount"
                          value={form.customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="w-full pl-9 pr-4 py-4 rounded-xl border border-slate-200 text-lg font-semibold text-slate-900 placeholder-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {form.frequency === 'recurring' && (
                      <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-800">
                          Recurring donations will be recorded as a monthly pledge. Online auto-billing is coming soon.
                          For now, you can bring your recurring gift to Sunday service each month.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TIME: volunteer form */}
                {form.donationType === 'time' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Hours Per Week You Can Volunteer *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          placeholder="e.g., 4"
                          value={form.volunteerHours}
                          onChange={(e) => updateForm({ volunteerHours: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Skills or Areas of Interest
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about your skills, availability, and how you'd like to help..."
                        value={form.message}
                        onChange={(e) => updateForm({ message: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* RESOURCES: item donation form */}
                {form.donationType === 'resources' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description of Items *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe the items you'd like to donate (food, supplies, equipment, etc.)..."
                        value={form.resourceDescription}
                        onChange={(e) => updateForm({ resourceDescription: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Estimated Value (optional, for tax receipt)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={form.estimatedValue}
                          onChange={(e) => updateForm({ estimatedValue: e.target.value })}
                          className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Delivery Preference
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => updateForm({ deliveryPreference: 'dropoff' })}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                            form.deliveryPreference === 'dropoff'
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                          I'll Drop Off
                        </button>
                        <button
                          type="button"
                          onClick={() => updateForm({ deliveryPreference: 'pickup' })}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                            form.deliveryPreference === 'pickup'
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          <Truck className="w-4 h-4" />
                          Request Pickup
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FadeSection>

            {/* ── Step 4: Your Information ────────────── */}
            <FadeSection className="mb-12" delay={0.2}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-4">
                  <User className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">Step 4</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Your Information</h2>
                <p className="text-slate-500 max-w-xl mx-auto">
                  So we can acknowledge your gift and provide a tax receipt.
                </p>
              </div>

              <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={form.donorName}
                        onChange={(e) => updateForm({ donorName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.donorEmail}
                        onChange={(e) => updateForm({ donorEmail: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone (optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={form.donorPhone}
                        onChange={(e) => updateForm({ donorPhone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  </div>
                  {form.donationType === 'money' && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Message (optional)
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <textarea
                          rows={3}
                          placeholder="Leave a message with your donation, prayer request, or dedication..."
                          value={form.message}
                          onChange={(e) => updateForm({ message: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FadeSection>

            {/* ── Tax Notice + Payment Info ────────────── */}
            <FadeSection className="mb-12" delay={0.25}>
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Tax deduction notice */}
                <div className="flex items-start gap-4 bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm mb-1">Tax-Deductible Giving</h4>
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      All donations to Sacred Revelation, A Free Church, are tax-deductible under IRC Section 170.
                      You will receive an automatic receipt for your records.
                    </p>
                  </div>
                </div>

                {/* Payment processing notice */}
                {form.donationType === 'money' && (
                  <div className="flex items-start gap-4 bg-indigo-50 rounded-2xl border border-indigo-200 p-5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Info className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900 text-sm mb-1">How to Give</h4>
                      <p className="text-sm text-indigo-800 leading-relaxed">
                        Online payment processing coming soon. For now, please bring your donation
                        to Sunday service or mail a check to our ministry address.
                        This form records your donation intent and generates a receipt number.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </FadeSection>

            {/* ── Error message ───────────────────────── */}
            {result?.error && (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="flex items-start gap-3 bg-rose-50 rounded-2xl border border-rose-200 p-5">
                  <Info className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-800">{result.error}</p>
                </div>
              </div>
            )}

            {/* ── Submit Button ───────────────────────── */}
            <FadeSection delay={0.3}>
              <div className="max-w-2xl mx-auto text-center">
                <button
                  type="submit"
                  disabled={!isFormValid || submitting}
                  className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-lg font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                  style={{
                    background: isFormValid && !submitting
                      ? 'linear-gradient(135deg, #7C3AED, #4338CA)'
                      : '#94A3B8',
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      {form.donationType === 'money'
                        ? `Donate${effectiveAmount > 0 ? ` $${effectiveAmount.toLocaleString()}` : ''}`
                        : form.donationType === 'time'
                        ? 'Submit Volunteer Pledge'
                        : 'Submit Resource Donation'}
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-400 mt-4">
                  Your information is kept private and will only be used for donation records and receipts.
                </p>
              </div>
            </FadeSection>
          </form>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #4338CA)' }}
              >
                <span>&#10014;</span>
              </div>
              <div>
                <span className="font-bold text-lg">Sacred Revelation</span>
                <p className="text-xs text-slate-400">Free Church Ministry Trust</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/sign-in" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <a href="mailto:contact@sacredrevelation.org" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Sacred Revelation, A Free Church Ministry Trust. All rights reserved.
            </p>
            <p className="text-xs text-slate-600 mt-1">
              508(c)(1)(A) tax-exempt organization. All donations are tax-deductible under IRC Section 170.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
