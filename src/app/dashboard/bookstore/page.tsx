'use client'

import { useState } from 'react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  Book,
  Plus,
  Search,
  ShoppingCart,
  ExternalLink,
  Star,
  Edit2,
  Trash2,
  DollarSign,
  Package,
  TrendingUp,
} from 'lucide-react'

interface BookItem {
  id: string
  title: string
  author: string
  description: string
  price: number
  amazonAsin?: string
  category: 'devotional' | 'bible_study' | 'theology' | 'leadership' | 'youth' | 'children'
  image?: string
  rating: number
  inStock: boolean
  featured: boolean
}

const mockBooks: BookItem[] = [
  {
    id: '1',
    title: 'The Purpose Driven Life',
    author: 'Rick Warren',
    description: 'A groundbreaking manifesto on the meaning of life.',
    price: 16.99,
    amazonAsin: 'B000FCJZMI',
    category: 'devotional',
    rating: 4.8,
    inStock: true,
    featured: true
  },
  {
    id: '2',
    title: 'Mere Christianity',
    author: 'C.S. Lewis',
    description: 'One of the most popular introductions to Christian faith.',
    price: 14.99,
    amazonAsin: 'B002BD2URY',
    category: 'theology',
    rating: 4.9,
    inStock: true,
    featured: true
  },
  {
    id: '3',
    title: 'The Case for Christ',
    author: 'Lee Strobel',
    description: 'A journalist investigates the evidence for Jesus.',
    price: 15.99,
    amazonAsin: 'B00BATG1MO',
    category: 'theology',
    rating: 4.7,
    inStock: true,
    featured: false
  },
  {
    id: '4',
    title: 'Jesus Calling',
    author: 'Sarah Young',
    description: 'Daily devotions with words of encouragement.',
    price: 12.99,
    amazonAsin: 'B00AR1TD2A',
    category: 'devotional',
    rating: 4.8,
    inStock: true,
    featured: true
  },
  {
    id: '5',
    title: 'Boundaries',
    author: 'Henry Cloud & John Townsend',
    description: 'When to say yes and how to say no.',
    price: 17.99,
    amazonAsin: 'B002BXRCWM',
    category: 'leadership',
    rating: 4.6,
    inStock: true,
    featured: false
  },
  {
    id: '6',
    title: 'The Jesus Storybook Bible',
    author: 'Sally Lloyd-Jones',
    description: 'Every story whispers His name.',
    price: 18.99,
    amazonAsin: 'B003TO6KN2',
    category: 'children',
    rating: 4.9,
    inStock: true,
    featured: true
  }
]

const categoryLabels = {
  devotional: 'Devotional',
  bible_study: 'Bible Study',
  theology: 'Theology',
  leadership: 'Leadership',
  youth: 'Youth',
  children: 'Children'
}

const categoryColors = {
  devotional: 'bg-purple-100 text-purple-800',
  bible_study: 'bg-blue-100 text-blue-800',
  theology: 'bg-indigo-100 text-indigo-800',
  leadership: 'bg-green-100 text-green-800',
  youth: 'bg-amber-100 text-amber-800',
  children: 'bg-pink-100 text-pink-800'
}

export default function BookstorePage() {
  return (
    <ThemeProvider>
      {(theme) => <BookstoreContent theme={theme} />}
    </ThemeProvider>
  )
}

function BookstoreContent({ theme }: { theme: DashboardTheme }) {
  const classes = getThemeClasses(theme)

  // Default affiliate tag for static demo (production will use dynamic values from Cognabase)
  const affiliateTag = 'ministry-20'

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredBooks = mockBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const featuredBooks = mockBooks.filter(b => b.featured)

  const getAmazonLink = (asin: string) => {
    return `https://www.amazon.com/dp/${asin}?tag=${affiliateTag}`
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          'w-4 h-4',
          i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        )}
      />
    ))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Church Bookstore</h1>
          <p className="text-gray-600 mt-1">Recommend books and earn affiliate commissions for your ministry</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium',
            classes.bgPrimary,
            'hover:opacity-90 transition-opacity'
          )}
        >
          <Plus className="w-5 h-5" />
          Add Book
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Book className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockBooks.length}</p>
              <p className="text-sm text-gray-600">Books Listed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">$342.50</p>
              <p className="text-sm text-gray-600">Affiliate Earnings</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-100">
              <ShoppingCart className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">127</p>
              <p className="text-sm text-gray-600">Books Purchased</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">23%</p>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Books */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Recommendations</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredBooks.map(book => (
            <div key={book.id} className={cn(
              'bg-white rounded-xl shadow-sm border-2 p-4 relative overflow-hidden',
              'border-yellow-300'
            )}>
              <div className="absolute top-2 right-2">
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  Featured
                </span>
              </div>
              <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <Book className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{book.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{book.author}</p>
              <div className="flex items-center gap-1 mb-2">
                {renderStars(book.rating)}
                <span className="text-xs text-gray-500 ml-1">{book.rating}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">${book.price}</span>
                {book.amazonAsin && (
                  <a
                    href={getAmazonLink(book.amazonAsin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'text-xs px-2 py-1 rounded font-medium',
                      classes.bgPrimary,
                      'text-white hover:opacity-90'
                    )}
                  >
                    Buy on Amazon
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* All Books */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">All Books</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredBooks.map(book => (
            <div key={book.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-16 h-20 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                <Book className="w-8 h-8 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{book.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        categoryColors[book.category]
                      )}>
                        {categoryLabels[book.category]}
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(book.rating)}
                      </div>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        book.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      )}>
                        {book.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">${book.price}</p>
                    {book.amazonAsin && (
                      <a
                        href={getAmazonLink(book.amazonAsin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                      >
                        Amazon <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 hover:bg-gray-100 rounded">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliate Info */}
      <div className={cn('mt-6 rounded-xl p-6', classes.bgLight)}>
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-lg', classes.bgPrimary)}>
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Amazon Affiliate Program</h3>
            <p className="text-sm text-gray-600 mb-3">
              Your ministry earns a commission on every book purchased through your bookstore links.
              The average commission rate is 4-8% depending on the category.
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-900">Your Affiliate Tag:</span>{' '}
              <code className="bg-white px-2 py-0.5 rounded text-sm">{affiliateTag}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
