'use client'

import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  HelpCircle,
  Book,
  MessageCircle,
  Phone,
  Mail,
  Video,
  FileText,
  ChevronRight,
  ExternalLink,
  Search,
} from 'lucide-react'

interface HelpTopic {
  id: string
  title: string
  description: string
  icon: typeof HelpCircle
  articles: number
}

const helpTopics: HelpTopic[] = [
  { id: '1', title: 'Getting Started', description: 'Learn the basics of managing your ministry dashboard', icon: Book, articles: 8 },
  { id: '2', title: '508(c)(1)(A) Compliance', description: 'Understanding tax-exempt religious organization requirements', icon: FileText, articles: 12 },
  { id: '3', title: 'Ministry Programs', description: 'Managing healing ministry, worship, life coaching, and food outreach', icon: HelpCircle, articles: 15 },
  { id: '4', title: 'Donations & Finances', description: 'Tracking donations, tithes, and financial records', icon: HelpCircle, articles: 10 },
  { id: '5', title: 'Volunteers & Members', description: 'Managing your ministry team and membership', icon: HelpCircle, articles: 6 },
  { id: '6', title: 'Documents & Records', description: 'Storing and organizing ministry documents', icon: FileText, articles: 5 },
]

const faqItems = [
  {
    question: 'What is a 508(c)(1)(A) organization?',
    answer: 'A 508(c)(1)(A) organization is a mandatory exception religious organization that is automatically tax-exempt without needing to apply for 501(c)(3) status from the IRS.'
  },
  {
    question: 'Do I need to file Form 990?',
    answer: 'No. 508(c)(1)(A) organizations are not required to file Form 990 or any annual information returns with the IRS.'
  },
  {
    question: 'How do I manage ministry programs?',
    answer: 'Use the Ministry Services dashboard to track and manage your ministry programs including healing ministry, music & worship, life coaching, food ministry, and community outreach initiatives.'
  },
  {
    question: 'Can I accept tax-deductible donations?',
    answer: 'Yes. Donations to 508(c)(1)(A) organizations are tax-deductible for donors, just like donations to 501(c)(3) organizations.'
  },
]

export default function HelpPage() {
  return (
    <ThemeProvider>
      {(theme) => <HelpContent theme={theme} />}
    </ThemeProvider>
  )
}

function HelpContent({ theme }: { theme: DashboardTheme }) {
  const classes = getThemeClasses(theme)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className={cn('w-7 h-7', classes.textPrimary)} />
          Help Center
        </h1>
        <p className="text-gray-500 mt-1">Find answers, tutorials, and support resources</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">How can we help you?</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Help Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {helpTopics.map((topic) => {
          const Icon = topic.icon
          return (
            <div
              key={topic.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className={cn('inline-flex p-3 rounded-lg mb-4', classes.bgLight)}>
                <Icon className={cn('w-6 h-6', classes.textPrimary)} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{topic.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{topic.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{topic.articles} articles</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {faqItems.map((faq, i) => (
            <div key={i} className="p-4">
              <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className={cn('inline-flex p-4 rounded-full mb-4', classes.bgLight)}>
            <MessageCircle className={cn('w-8 h-8', classes.textPrimary)} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-500 mb-4">Chat with our support team in real-time</p>
          <button className={cn(
            'w-full py-2 px-4 rounded-lg text-white font-medium',
            classes.bgPrimary,
            'hover:opacity-90 transition-opacity'
          )}>
            Start Chat
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="inline-flex p-4 rounded-full bg-blue-100 mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
          <p className="text-sm text-gray-500 mb-4">Get help via email within 24 hours</p>
          <a
            href="mailto:support@508ministry.com"
            className="block w-full py-2 px-4 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Send Email
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="inline-flex p-4 rounded-full bg-green-100 mb-4">
            <Video className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
          <p className="text-sm text-gray-500 mb-4">Watch step-by-step video guides</p>
          <button className="w-full py-2 px-4 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            Watch Videos
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className={cn('rounded-xl p-6', classes.bgLight)}>
        <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'User Guide', href: '#' },
            { label: 'API Documentation', href: '#' },
            { label: 'Release Notes', href: '#' },
            { label: 'Community Forum', href: '#' },
          ].map((link, i) => (
            <a
              key={i}
              href={link.href}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <ChevronRight className="w-4 h-4" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
