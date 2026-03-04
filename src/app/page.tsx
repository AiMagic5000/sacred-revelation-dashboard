'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import {
  Heart,
  Shield,
  Sparkles,
  Music,
  Wheat,
  Leaf,
  GraduationCap,
  Users,
  Church,
  ArrowRight,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Globe,
  BookOpen,
  Crown,
  Zap,
  TrendingUp,
  FileText,
  Play,
} from 'lucide-react'

/* ────────────────────────────────────────────────────────── */
/*  DATA                                                      */
/* ────────────────────────────────────────────────────────── */

const PROGRAMS = [
  {
    icon: Sparkles,
    title: 'Healing Ministry',
    description: 'Prayer, faith-based healing services, and spiritual wellness for body, mind, and spirit.',
    color: 'rose',
    stat: '200+',
    statLabel: 'Prayers Answered',
  },
  {
    icon: Music,
    title: 'Music & Worship',
    description: 'Uplifting worship experiences that bring the congregation together in praise and celebration.',
    color: 'purple',
    stat: '52',
    statLabel: 'Weekly Services',
  },
  {
    icon: GraduationCap,
    title: 'Life Coaching',
    description: 'Biblical life coaching and mentorship programs for personal growth and family development.',
    color: 'sky',
    stat: '85',
    statLabel: 'Lives Impacted',
  },
  {
    icon: Wheat,
    title: 'Food Ministry',
    description: 'Feeding families through aquaponics, vertical gardens, and community food distribution.',
    color: 'amber',
    stat: '1,000',
    statLabel: 'Lbs Monthly',
  },
  {
    icon: Leaf,
    title: '1000 lbs of Food',
    description: 'Our flagship initiative growing 1,000 lbs of fresh food monthly for families in need.',
    color: 'emerald',
    stat: '150+',
    statLabel: 'Families Fed',
  },
  {
    icon: Heart,
    title: 'Community Outreach',
    description: 'Partnering with churches and organizations to extend love, hope, and healing to all.',
    color: 'teal',
    stat: '12',
    statLabel: 'Partner Churches',
  },
]

const TRUST_FEATURES = [
  { icon: Shield, title: 'Tax-Exempt Status', description: 'Automatic tax exemption under IRC 508(c)(1)(A) -- no IRS application required.' },
  { icon: FileText, title: 'No Form 990 Filing', description: 'Free from annual IRS reporting requirements that burden 501(c)(3) organizations.' },
  { icon: BookOpen, title: 'Religious Liberty', description: 'Greater autonomy and freedom from government interference in ministry operations.' },
  { icon: Heart, title: 'Tax-Deductible Giving', description: 'All donations are fully tax-deductible for your faithful supporters and partners.' },
]

const TESTIMONIALS = [
  {
    name: 'Elder James M.',
    role: 'Board Member',
    text: 'Sacred Revelation gave us the structure and freedom to operate our ministry the way God intended -- without the red tape.',
    rating: 5,
  },
  {
    name: 'Sister Patricia W.',
    role: 'Ministry Leader',
    text: 'The food ministry has transformed our community. Families who were struggling now have fresh produce every week.',
    rating: 5,
  },
  {
    name: 'Brother David K.',
    role: 'Volunteer Coordinator',
    text: 'The dashboard makes it simple to manage volunteers, track donations, and stay compliant. Everything in one place.',
    rating: 5,
  },
]

const STATS = [
  { value: '1,000+', label: 'Lbs of Food Monthly', icon: Leaf },
  { value: '150+', label: 'Families Served', icon: Users },
  { value: '12', label: 'Partner Churches', icon: Church },
  { value: '100%', label: 'Tax-Exempt', icon: Shield },
]

const COLOR_MAP: Record<string, { bg: string; text: string; iconBg: string; border: string; gradient: string }> = {
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  iconBg: 'bg-purple-100',  border: 'border-purple-200',  gradient: 'from-purple-500 to-purple-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   iconBg: 'bg-amber-100',   border: 'border-amber-200',   gradient: 'from-amber-500 to-amber-600' },
  rose:    { bg: 'bg-rose-50',     text: 'text-rose-600',     iconBg: 'bg-rose-100',     border: 'border-rose-200',     gradient: 'from-rose-500 to-rose-600' },
  sky:     { bg: 'bg-sky-50',      text: 'text-sky-600',      iconBg: 'bg-sky-100',      border: 'border-sky-200',      gradient: 'from-sky-500 to-sky-600' },
  teal:    { bg: 'bg-teal-50',     text: 'text-teal-600',     iconBg: 'bg-teal-100',     border: 'border-teal-200',     gradient: 'from-teal-500 to-teal-600' },
}

/* ────────────────────────────────────────────────────────── */
/*  COMPONENTS                                                */
/* ────────────────────────────────────────────────────────── */

function Navbar({ isSignedIn }: { isSignedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm" style={{
              background: 'linear-gradient(135deg, #7C3AED, #4338CA)'
            }}>
              <span>&#10014;</span>
            </div>
            <div>
              <span className={`font-bold text-lg ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                Sacred Revelation
              </span>
              <p className={`text-[10px] font-medium leading-none ${scrolled ? 'text-primary-600' : 'text-white/70'}`}>
                Free Church Ministry Trust
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Mission', 'Programs', 'About', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'
                }`}
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA - Auth-aware */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-lg hover:shadow-xl animate-pulse-subtle"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #4338CA)' }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={`text-sm font-medium transition-colors ${
                    scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #4338CA)' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338CA 50%, #7C3AED 75%, #6d28d9 100%)'
      }} />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400/5 rounded-full blur-3xl" />

        {/* Floating crosses */}
        {[
          { top: '15%', left: '8%', size: 'text-3xl', opacity: 'opacity-[0.06]', delay: '0s' },
          { top: '25%', right: '12%', size: 'text-5xl', opacity: 'opacity-[0.04]', delay: '1s' },
          { top: '60%', left: '15%', size: 'text-4xl', opacity: 'opacity-[0.05]', delay: '2s' },
          { top: '70%', right: '20%', size: 'text-3xl', opacity: 'opacity-[0.06]', delay: '0.5s' },
          { top: '40%', left: '80%', size: 'text-6xl', opacity: 'opacity-[0.03]', delay: '1.5s' },
        ].map((cross, i) => (
          <div
            key={i}
            className={`absolute ${cross.size} ${cross.opacity} text-white`}
            style={{ top: cross.top, left: cross.left, right: (cross as { right?: string }).right }}
          >
            &#10014;
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Shield className="w-4 h-4 text-amber-300" />
            <span className="text-sm font-medium text-white/90">508(c)(1)(A) Free Church Ministry Trust</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Love. Hope.{' '}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              Healing.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl">
            Sacred Revelation is a faith-based ministry trust dedicated to feeding the hungry,
            healing the sick, and building a community rooted in love and service.
            We operate under the protection of a 508(c)(1)(A) free church with full religious liberty.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-indigo-900 bg-white hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl"
            >
              Join Our Ministry
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#programs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-all"
            >
              <Play className="w-5 h-5" />
              Explore Our Programs
            </a>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => {
            const StatIcon = stat.icon
            return (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center">
                <StatIcon className="w-6 h-6 text-amber-300 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-sm text-white/60 mt-1">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function MissionSection() {
  return (
    <section id="mission" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-6">
              <Crown className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Our Mission</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              Building a Community{' '}
              <span className="text-primary-600">Rooted in Faith</span>
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Sacred Revelation exists to serve our community through faith-based programs that heal,
              feed, and uplift families. We believe in the power of love to transform lives and
              build a stronger, more compassionate world.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'Grow and distribute 1,000 lbs of fresh food every month',
                'Provide prayer and healing ministry services to those in need',
                'Offer life coaching and mentorship for personal growth',
                'Partner with local churches to extend our reach',
                'Operate with full religious liberty under 508(c)(1)(A) protection',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
            >
              Learn More About Us
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white shadow-lg">
                  <Sparkles className="w-8 h-8 mb-3 text-amber-300" />
                  <p className="text-2xl font-extrabold">200+</p>
                  <p className="text-sm text-white/70">Prayers Answered</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
                  <Leaf className="w-8 h-8 mb-3 text-amber-300" />
                  <p className="text-2xl font-extrabold">1,000 lbs</p>
                  <p className="text-sm text-white/70">Food Monthly</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg">
                  <Users className="w-8 h-8 mb-3 text-white/80" />
                  <p className="text-2xl font-extrabold">150+</p>
                  <p className="text-sm text-white/70">Families Served</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-6 text-white shadow-lg">
                  <Heart className="w-8 h-8 mb-3 text-white/80" />
                  <p className="text-2xl font-extrabold">6</p>
                  <p className="text-sm text-white/70">Active Programs</p>
                </div>
              </div>
            </div>
            {/* Decorative glow */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ProgramsSection() {
  return (
    <section id="programs" className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
            <Heart className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Ministry Programs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            How We Serve Our Community
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Through six active ministry programs, we bring love, hope, and healing
            to families and communities across our region.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROGRAMS.map((program, i) => {
            const Icon = program.icon
            const colors = COLOR_MAP[program.color]
            return (
              <div key={i} className={`bg-white rounded-2xl border ${colors.border} p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${colors.iconBg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-extrabold ${colors.text}`}>{program.stat}</p>
                    <p className="text-[11px] text-slate-400">{program.statLabel}</p>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{program.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{program.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">508(c)(1)(A) Trust</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Protected by a Free Church Ministry Trust
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Our 508(c)(1)(A) status provides automatic tax exemption and religious liberty,
            allowing us to focus entirely on our mission of service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {TRUST_FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className="flex items-start gap-4 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="p-3 rounded-xl bg-indigo-100 flex-shrink-0">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA banner */}
        <div className="mt-16 rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #4338CA 50%, #7C3AED 100%)'
        }}>
          <div className="px-8 py-12 text-center relative">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
            <div className="relative">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Want to start your own 508(c)(1)(A) trust?
              </h3>
              <p className="text-white/70 mb-6 max-w-xl mx-auto">
                Protect your ministry with the same religious liberty framework. Formation services available through Start My Business Inc.
              </p>
              <a
                href="https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white text-indigo-900 hover:bg-slate-50 transition-colors shadow-lg"
              >
                Learn About 508 Services
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-4">
            <Star className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Voices from Our Ministry
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Hear from the elders, volunteers, and community members whose lives have been touched.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{
                  background: `linear-gradient(135deg, ${
                    i === 0 ? '#7C3AED, #4338CA' : i === 1 ? '#10b981, #0d9488' : '#f59e0b, #ea580c'
                  })`
                }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-6" style={{
          background: 'linear-gradient(135deg, #7C3AED, #4338CA)'
        }}>
          <span>&#10014;</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
          {isSignedIn ? 'Welcome Back to Your Ministry' : 'Ready to Join Our Ministry?'}
        </h2>
        <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto">
          {isSignedIn
            ? 'Your dashboard is ready. Manage donations, track compliance, and run your ministry programs.'
            : 'Whether you want to volunteer, donate, or start your own trust, we welcome you with open arms. Sign up for your free dashboard account to get started.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4338CA)' }}
            >
              Open Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #4338CA)' }}
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                Sign In to Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{
                background: 'linear-gradient(135deg, #7C3AED, #4338CA)'
              }}>
                <span>&#10014;</span>
              </div>
              <div>
                <span className="font-bold text-lg">Sacred Revelation</span>
                <p className="text-xs text-slate-400">Free Church Ministry Trust</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">
              A 508(c)(1)(A) faith-based ministry dedicated to love, hope, and healing.
              We serve our community through food outreach, prayer, worship, life coaching,
              and partnership with local churches.
            </p>
            <div className="flex items-center gap-4">
              <a href="mailto:contact@sacredrevelation.org" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                contact@sacredrevelation.org
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Quick Links</h4>
            <div className="space-y-3">
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Sign In', href: '/sign-in' },
                { label: 'Sign Up', href: '/sign-up' },
                { label: '508 Services', href: 'https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into' },
              ].map((link, i) => (
                <a key={i} href={link.href} className="block text-sm text-slate-400 hover:text-white transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Programs</h4>
            <div className="space-y-3">
              {['Healing Ministry', 'Music & Worship', 'Life Coaching', 'Food Ministry', '1000 lbs of Food', 'Community Outreach'].map((program, i) => (
                <a key={i} href="#programs" className="block text-sm text-slate-400 hover:text-white transition-colors">
                  {program}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Sacred Revelation, A Free Church Ministry Trust. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Powered by{' '}
            <a href="https://www.startmybusiness.us" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
              Start My Business Inc.
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  MAIN PAGE                                                 */
/* ────────────────────────────────────────────────────────── */

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  // Auto-redirect signed-in users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #7C3AED, #4338CA)'
          }}>
            <span className="text-white text-2xl font-bold">&#10014;</span>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-white">
      <Navbar isSignedIn={!!isSignedIn} />
      <HeroSection />
      <MissionSection />
      <ProgramsSection />
      <TrustSection />
      <TestimonialsSection />
      <CTASection isSignedIn={!!isSignedIn} />
      <Footer />
    </main>
  )
}
