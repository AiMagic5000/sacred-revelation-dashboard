/**
 * Dashboard Theme Configuration
 *
 * Two main themes for Sacred Revelation ministry trust:
 * - Sacred: Deep Purple & Gold (regal kingdom aesthetic)
 * - Kingdom: Deep Blue & Silver (authoritative institutional)
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
    primary: '#6B21A8',      // Purple-700
    primaryHover: '#581C87', // Purple-800
    primaryLight: '#F3E8FF', // Purple-100
    secondary: '#B8860B',    // Dark Goldenrod
    accent: '#D4A84B',       // Warm Gold
    gradient: 'from-purple-700 to-indigo-900',
    bgLight: '#FAF5FF',      // Purple-50
    bgDark: '#3B0764',       // Purple-950
    border: '#E9D5FF',       // Purple-200
  },
  kingdom: {
    primary: '#1E3A5F',      // Deep Navy
    primaryHover: '#152D4A', // Darker Navy
    primaryLight: '#DBEAFE', // Blue-100
    secondary: '#C0C0C0',    // Silver
    accent: '#A0AEC0',       // Cool Silver
    gradient: 'from-slate-800 to-blue-950',
    bgLight: '#F8FAFC',      // Slate-50
    bgDark: '#0F172A',       // Slate-900
    border: '#CBD5E1',       // Slate-300
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

  // Default: sacred theme
  return {
    buttonPrimary: 'bg-purple-700 hover:bg-purple-800 text-white',
    buttonSecondary: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
    bgPrimary: 'bg-purple-700',
    bgLight: 'bg-purple-50',
    bgGradient: 'bg-gradient-to-r from-purple-700 to-indigo-900',
    textPrimary: 'text-purple-700',
    textSecondary: 'text-purple-900',
    borderPrimary: 'border-purple-200',
    borderAccent: 'border-purple-700',
    ringPrimary: 'ring-purple-700',
  }
}
