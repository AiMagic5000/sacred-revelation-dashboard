/**
 * Dashboard Theme Configuration
 *
 * Sacred Revelation ministry trust theme system
 * Features rich multi-color palette inspired by Harvest Hope
 * Purple/Gold primary with emerald, rose, sky, teal, amber accents
 */

export type DashboardTheme = 'sacred' | 'kingdom'

export interface ThemeColors {
  primary: string
  primaryHover: string
  primaryLight: string
  secondary: string
  accent: string
  gradient: string
  bgLight: string
  bgDark: string
  border: string
}

export const themes: Record<DashboardTheme, ThemeColors> = {
  sacred: {
    primary: '#7C3AED',
    primaryHover: '#6B21A8',
    primaryLight: '#F3E8FF',
    secondary: '#D4A84B',
    accent: '#B8860B',
    gradient: 'from-primary-700 via-indigo-700 to-primary-900',
    bgLight: '#FAF5FF',
    bgDark: '#3B0764',
    border: '#E9D5FF',
  },
  kingdom: {
    primary: '#1E3A5F',
    primaryHover: '#152D4A',
    primaryLight: '#DBEAFE',
    secondary: '#C0C0C0',
    accent: '#A0AEC0',
    gradient: 'from-slate-800 to-blue-950',
    bgLight: '#F8FAFC',
    bgDark: '#0F172A',
    border: '#CBD5E1',
  },
}

export interface DashboardConfig {
  theme: DashboardTheme
  title: string
  subtitle: string
  icon: string
  features: string[]
}

export const dashboardConfigs: Record<DashboardTheme, DashboardConfig> = {
  sacred: {
    theme: 'sacred',
    title: 'Sacred Revelation Dashboard',
    subtitle: '508(c)(1)(A) Free Church Ministry Trust',
    icon: '\u2726',
    features: [
      'Trust Administration',
      'Ministry Compliance Tracking',
      'Financial Stewardship',
      'Elder & Trustee Management',
      'Tax-Exempt Documentation',
      'Donation & Tithe Records',
    ],
  },
  kingdom: {
    theme: 'kingdom',
    title: 'Kingdom Trust Dashboard',
    subtitle: '508(c)(1)(A) Institutional Ministry Trust',
    icon: '\u269C',
    features: [
      'Institutional Governance',
      'Trustee Board Management',
      'Asset Protection Oversight',
      'Regulatory Compliance',
      'Financial Audit Trails',
      'Ministry Operations',
    ],
  },
}

/** Stat card color variants for visual variety */
export type StatColor = 'purple' | 'emerald' | 'amber' | 'rose' | 'sky' | 'teal' | 'gold' | 'indigo'

export const statColorConfig: Record<StatColor, {
  bg: string
  text: string
  iconBg: string
  iconText: string
  gradient: string
  border: string
  badge: string
}> = {
  purple: {
    bg: 'bg-primary-50',
    text: 'text-primary-700',
    iconBg: 'bg-primary-100',
    iconText: 'text-primary-600',
    gradient: 'from-primary-500 to-primary-700',
    border: 'border-primary-200',
    badge: 'bg-primary-100 text-primary-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    gradient: 'from-emerald-500 to-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    gradient: 'from-amber-500 to-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-600',
    gradient: 'from-rose-500 to-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
  },
  sky: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    iconBg: 'bg-sky-100',
    iconText: 'text-sky-600',
    gradient: 'from-sky-500 to-sky-700',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-700',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-600',
    gradient: 'from-teal-500 to-teal-700',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
  },
  gold: {
    bg: 'bg-gold-50',
    text: 'text-gold-700',
    iconBg: 'bg-gold-100',
    iconText: 'text-gold-600',
    gradient: 'from-gold-500 to-gold-700',
    border: 'border-gold-200',
    badge: 'bg-gold-100 text-gold-700',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-600',
    gradient: 'from-indigo-500 to-indigo-700',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
  },
}

export function getThemeClasses(theme: DashboardTheme) {
  if (theme === 'kingdom') {
    return {
      buttonPrimary: 'bg-slate-800 hover:bg-slate-900 text-white',
      buttonSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
      bgPrimary: 'bg-slate-800',
      bgLight: 'bg-slate-50',
      bgGradient: 'bg-gradient-to-r from-slate-800 to-blue-950',
      textPrimary: 'text-slate-800',
      textSecondary: 'text-slate-900',
      borderPrimary: 'border-slate-300',
      borderAccent: 'border-slate-800',
      ringPrimary: 'ring-slate-800',
    }
  }

  return {
    buttonPrimary: 'bg-primary-700 hover:bg-primary-800 text-white',
    buttonSecondary: 'bg-primary-50 hover:bg-primary-100 text-primary-700',
    bgPrimary: 'bg-primary-700',
    bgLight: 'bg-primary-50',
    bgGradient: 'bg-gradient-to-r from-primary-700 via-indigo-700 to-primary-900',
    textPrimary: 'text-primary-700',
    textSecondary: 'text-primary-900',
    borderPrimary: 'border-primary-200',
    borderAccent: 'border-primary-700',
    ringPrimary: 'ring-primary-700',
  }
}
