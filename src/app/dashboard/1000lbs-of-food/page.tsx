'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Fish,
  Sprout,
  TreeDeciduous,
  Calendar,
  Waves,
  Droplets,
  CheckCircle,
  Layers,
  Clock,
  Home,
  Leaf,
  ThermometerSun,
  AlertCircle,
  Sun,
  Zap,
} from 'lucide-react'

const WATER_PARAMETERS = [
  { label: 'Temperature', value: '82\u00B0F', optimal: '75-85\u00B0F', status: 'good', icon: ThermometerSun },
  { label: 'pH Level', value: '7.0', optimal: '6.8-7.2', status: 'good', icon: Droplets },
  { label: 'Ammonia', value: '0.2 ppm', optimal: '< 0.5 ppm', status: 'good', icon: AlertCircle },
  { label: 'Nitrite', value: '0.1 ppm', optimal: '< 0.5 ppm', status: 'good', icon: Zap },
  { label: 'Nitrate', value: '45 ppm', optimal: '5-150 ppm', status: 'good', icon: Leaf },
  { label: 'Dissolved O2', value: '6.2 ppm', optimal: '> 5 ppm', status: 'good', icon: Waves },
] as const

const DAILY_SOPS = [
  { time: '6:00 AM', task: 'Check water temperature and pH levels', category: 'Water Quality' },
  { time: '6:30 AM', task: 'Feed fish (morning feeding - 2% body weight)', category: 'Fish Care' },
  { time: '7:00 AM', task: 'Inspect vertical tower water flow and drippers', category: 'Tower Maintenance' },
  { time: '7:30 AM', task: 'Harvest ready produce from towers and beds', category: 'Harvest' },
  { time: '8:00 AM', task: 'Check grow beds for plant health and pests', category: 'Plant Care' },
  { time: '10:00 AM', task: 'Test ammonia, nitrite, and nitrate levels', category: 'Water Quality' },
  { time: '12:00 PM', task: 'Second fish feeding', category: 'Fish Care' },
  { time: '2:00 PM', task: 'Check shade cloth and irrigation in food forest', category: 'Food Forest' },
  { time: '4:00 PM', task: 'Record daily production weights and observations', category: 'Documentation' },
  { time: '5:00 PM', task: 'Evening fish feeding and system check', category: 'Fish Care' },
  { time: '6:00 PM', task: 'Verify pumps, aerators, and backup power status', category: 'Equipment' },
] as const

const SOP_CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Water Quality': { bg: 'bg-sky-100', text: 'text-sky-700' },
  'Fish Care': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Tower Maintenance': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Harvest': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Plant Care': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'Food Forest': { bg: 'bg-green-100', text: 'text-green-700' },
  'Documentation': { bg: 'bg-primary-100', text: 'text-primary-700' },
  'Equipment': { bg: 'bg-rose-100', text: 'text-rose-700' },
}

type TabId = 'overview' | 'fish' | 'towers' | 'forest' | 'sops'

export default function FoodProductionPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const tabs: { id: TabId; label: string; icon: typeof Layers }[] = [
    { id: 'overview', label: 'System Overview', icon: Layers },
    { id: 'fish', label: 'Fish Production', icon: Fish },
    { id: 'towers', label: 'Vertical Towers', icon: Sprout },
    { id: 'forest', label: 'Food Forest', icon: TreeDeciduous },
    { id: 'sops', label: 'Daily SOPs', icon: Clock },
  ]

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="animate-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-emerald-100">
            <Leaf className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              1,000+ lbs of Food Production
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Sacred Revelation outdoor vertical farming, aquaponics & food forest system
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Colorful gradient cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in-delay-1">
        <div className="rounded-2xl p-5 text-white text-center shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 cursor-pointer" style={{
          background: 'linear-gradient(135deg, #0284C7, #0EA5E9)'
        }}>
          <Fish className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <p className="text-3xl font-bold">0 lbs</p>
          <p className="text-sm opacity-80 mt-1">Fish per Month</p>
        </div>
        <div className="rounded-2xl p-5 text-white text-center shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 cursor-pointer" style={{
          background: 'linear-gradient(135deg, #059669, #10B981)'
        }}>
          <Sprout className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <p className="text-3xl font-bold">0 lbs</p>
          <p className="text-sm opacity-80 mt-1">Vertical Gardens</p>
        </div>
        <div className="rounded-2xl p-5 text-white text-center shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 cursor-pointer" style={{
          background: 'linear-gradient(135deg, #D97706, #F59E0B)'
        }}>
          <TreeDeciduous className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <p className="text-3xl font-bold">0 lbs</p>
          <p className="text-sm opacity-80 mt-1">Food Forest (avg)</p>
        </div>
        <div className="rounded-2xl p-5 text-white text-center shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 cursor-pointer" style={{
          background: 'linear-gradient(135deg, #7C3AED, #A855F7)'
        }}>
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm opacity-80 mt-1">Days Growing</p>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2 animate-in-delay-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'fish' && <FishTab />}
      {activeTab === 'towers' && <TowersTab />}
      {activeTab === 'forest' && <ForestTab />}
      {activeTab === 'sops' && <SOPsTab />}
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SystemCard
          icon={Waves}
          iconColor="text-sky-600"
          iconBg="bg-sky-100"
          title="Aquaponics System"
          items={[
            '1,100+ gallon fish tank system (4 IBC totes)',
            'Tilapia primary - 100 lbs/month harvest potential',
            '4 grow beds (4x8 ft) for bio-filtration',
            'Backup generator for storm season',
          ]}
        />
        <SystemCard
          icon={Sprout}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
          title="Vertical Gardens"
          items={[
            '25 vertical towers (5 ft each)',
            '200+ active plant sites',
            'Leafy greens & herbs primary crops',
            '50% shade cloth for California sun',
          ]}
        />
        <SystemCard
          icon={TreeDeciduous}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
          title="Food Forest"
          items={[
            'Fruit trees, citrus, nut varieties',
            'Moringa, perennial herbs & spinach',
            'Sweet potato, ground cover crops',
            '40 lbs average monthly (seasonal variation)',
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-sky-100">
              <Droplets className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Water Quality Parameters</h3>
              <p className="text-xs text-slate-500">All readings within optimal range</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WATER_PARAMETERS.map((param) => {
              const Icon = param.icon
              return (
                <div key={param.label} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500">{param.label}</span>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-lg font-bold text-slate-900">{param.value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Optimal: {param.optimal}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-primary-100">
              <Home className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Space Allocation</h3>
          </div>
          <div className="space-y-4">
            <SpaceRow label="Fish Tanks" value="200 sq ft" percent={13} color="bg-sky-500" />
            <SpaceRow label="Vertical Towers" value="400 sq ft" percent={27} color="bg-emerald-500" />
            <SpaceRow label="Food Forest" value="800+ sq ft" percent={53} color="bg-amber-500" />
            <SpaceRow label="Walkways/Utility" value="100 sq ft" percent={7} color="bg-slate-400" />
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-800">Total</span>
              <span className="font-bold text-primary-600 text-lg">2,500 sq ft</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FishTab() {
  return (
    <div className="space-y-5 animate-in">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-sky-100">
            <Fish className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Aquaponics Fish Production</h2>
            <p className="text-sm text-slate-500">Tilapia-based system with bio-filtration grow beds</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">System Specifications</h3>
            <ul className="space-y-2.5">
              {[
                'Total water volume: 1,100+ gallons',
                '4 IBC tote tanks (275 gallons each)',
                'Stocking density: 1 fish per 2 gallons',
                'Target harvest: 100 lbs/month',
                'Species: Tilapia (Nile variety)',
                'Fingerlings to harvest: 6-8 months',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Feeding Schedule</h3>
            <ul className="space-y-2.5">
              {[
                'Morning feed: 6:30 AM (1% body weight)',
                'Midday feed: 12:00 PM (0.5% body weight)',
                'Evening feed: 5:00 PM (0.5% body weight)',
                'Fry feed: 4-6 times daily (starter crumble)',
                'Feed type: 32% protein floating pellets',
                'Water temp maintained: 75-85\u00B0F',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function TowersTab() {
  return (
    <div className="space-y-5 animate-in">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-100">
            <Sprout className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Vertical Tower Gardens</h2>
            <p className="text-sm text-slate-500">25 towers with 200+ active plant sites</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Current Crops</h3>
            <ul className="space-y-2.5">
              {[
                'Lettuce varieties (romaine, butter, red leaf)',
                'Kale & Swiss chard',
                'Basil, cilantro, parsley, mint',
                'Cherry tomatoes (limited towers)',
                'Strawberries (seasonal)',
                'Microgreens (indoor trays)',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Leaf className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Maintenance</h3>
            <ul className="space-y-2.5">
              {[
                'Check water flow daily at each tower',
                'pH adjustment: weekly or as needed',
                'Nutrient solution: replace every 2 weeks',
                'Clean drippers monthly',
                'Replace shade cloth annually',
                'Inspect for pests twice weekly',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function ForestTab() {
  return (
    <div className="space-y-5 animate-in">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-100">
            <TreeDeciduous className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Food Forest</h2>
            <p className="text-sm text-slate-500">Permaculture-based multi-layer growing system</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <Sun className="w-4 h-4" /> Canopy Layer
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li>Fruit trees (citrus, stone fruit)</li>
              <li>Nut trees (almond, walnut)</li>
              <li>Shade providers for understory</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <h3 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
              <Sprout className="w-4 h-4" /> Shrub Layer
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li>Moringa (superfood tree)</li>
              <li>Katuk & longevity spinach</li>
              <li>Berry bushes (seasonal)</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
            <h3 className="text-sm font-semibold text-teal-800 mb-2 flex items-center gap-2">
              <Leaf className="w-4 h-4" /> Ground Cover
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li>Sweet potato vines</li>
              <li>Perennial peanut</li>
              <li>Herb ground covers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function SOPsTab() {
  return (
    <div className="space-y-5 animate-in">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-primary-100">
            <Clock className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daily Standard Operating Procedures</h2>
            <p className="text-sm text-slate-500">Complete daily checklist for food production operations</p>
          </div>
        </div>
        <div className="space-y-2">
          {DAILY_SOPS.map((sop, i) => {
            const colors = SOP_CATEGORY_COLORS[sop.category] || { bg: 'bg-slate-100', text: 'text-slate-600' }
            return (
              <div
                key={i}
                className="flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-sm font-mono font-semibold text-slate-400 w-16 flex-shrink-0">
                  {sop.time}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{sop.task}</p>
                </div>
                <span className={cn('px-2.5 py-1 text-[11px] font-semibold rounded-lg flex-shrink-0', colors.bg, colors.text)}>
                  {sop.category}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SystemCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  items,
}: {
  icon: typeof Waves
  iconColor: string
  iconBg: string
  title: string
  items: string[]
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('p-2 rounded-xl', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SpaceRow({
  label,
  value,
  percent,
  color,
}: {
  label: string
  value: string
  percent: number
  color: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
