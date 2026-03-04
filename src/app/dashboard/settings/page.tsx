'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Save,
  Upload,
  Palette,
  Building2,
  Globe,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { DashboardTheme, getThemeClasses, themes } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface BrandingSettings {
  ministryName: string
  tagline: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  subdomain: string
  customDomain: string
}

interface SaveStatus {
  type: 'idle' | 'saving' | 'success' | 'error'
  message?: string
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<DashboardTheme>('sacred')
  const [loading, setLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ type: 'idle' })
  const [ministryId, setMinistryId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [settings, setSettings] = useState<BrandingSettings>({
    ministryName: '',
    tagline: '',
    logoUrl: null,
    primaryColor: themes.sacred.primary,
    secondaryColor: themes.sacred.secondary,
    accentColor: themes.sacred.accent,
    fontFamily: 'Inter',
    subdomain: '',
    customDomain: '',
  })

  // Load ministry data from Cognabase
  useEffect(() => {
    async function loadMinistryData() {
      setLoading(true)

      // Get ministry ID from localStorage (set by MinistryContext)
      const savedMinistryId = localStorage.getItem('current-ministry-id')
      const savedTheme = localStorage.getItem('dashboard-theme') as DashboardTheme

      if (savedTheme && (savedTheme === 'sacred' || savedTheme === 'kingdom')) {
        setTheme(savedTheme)
      }

      if (savedMinistryId) {
        setMinistryId(savedMinistryId)

        try {
          const { data, error } = await supabase
            .from('ministries')
            .select('*')
            .eq('id', savedMinistryId)
            .single()

          if (error) throw error

          if (data) {
            setSettings({
              ministryName: data.name || '',
              tagline: data.tagline || '',
              logoUrl: data.logo_url || null,
              primaryColor: data.primary_color || themes[savedTheme || 'sacred'].primary,
              secondaryColor: data.secondary_color || themes[savedTheme || 'sacred'].secondary,
              accentColor: data.accent_color || themes[savedTheme || 'sacred'].accent,
              fontFamily: data.font_family || 'Inter',
              subdomain: data.subdomain || '',
              customDomain: data.custom_domain || '',
            })

            // Update theme if set in database
            if (data.theme) {
              setTheme(data.theme as DashboardTheme)
            }
          }
        } catch (error) {
          console.error('Error loading ministry data:', error)
          // Use defaults if no ministry found
          setSettings(prev => ({
            ...prev,
            ministryName: 'Your Ministry Name',
            tagline: 'Your tagline here',
            primaryColor: themes[savedTheme || 'sacred'].primary,
            secondaryColor: themes[savedTheme || 'sacred'].secondary,
            accentColor: themes[savedTheme || 'sacred'].accent,
          }))
        }
      } else {
        // No ministry ID - use demo mode defaults
        setSettings(prev => ({
          ...prev,
          ministryName: 'Demo Ministry',
          tagline: 'Create or connect a ministry to customize',
          primaryColor: themes[savedTheme || 'sacred'].primary,
          secondaryColor: themes[savedTheme || 'sacred'].secondary,
          accentColor: themes[savedTheme || 'sacred'].accent,
        }))
      }

      setLoading(false)
    }

    loadMinistryData()
  }, [])

  const classes = getThemeClasses(theme)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSaveStatus({ type: 'error', message: 'Please upload an image file' })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSaveStatus({ type: 'error', message: 'File size must be less than 2MB' })
      return
    }

    setUploadProgress(0)
    setSaveStatus({ type: 'saving', message: 'Uploading logo...' })

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${ministryId || 'demo'}-${Date.now()}.${fileExt}`
      const filePath = `ministry-logos/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      setSettings(prev => ({
        ...prev,
        logoUrl: urlData.publicUrl,
      }))

      setUploadProgress(100)
      setSaveStatus({ type: 'success', message: 'Logo uploaded! Remember to save changes.' })

      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus({ type: 'idle' }), 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setSaveStatus({ type: 'error', message: 'Failed to upload logo. Please try again.' })
    }
  }

  const handleSave = async () => {
    setSaveStatus({ type: 'saving', message: 'Saving settings...' })

    try {
      if (ministryId) {
        // Update existing ministry record in Cognabase
        const { error } = await supabase
          .from('ministries')
          .update({
            name: settings.ministryName,
            tagline: settings.tagline,
            logo_url: settings.logoUrl,
            primary_color: settings.primaryColor,
            secondary_color: settings.secondaryColor,
            accent_color: settings.accentColor,
            font_family: settings.fontFamily,
            subdomain: settings.subdomain,
            custom_domain: settings.customDomain || null,
            theme: theme,
            updated_at: new Date().toISOString(),
          })
          .eq('id', ministryId)

        if (error) throw error

        // Update localStorage theme
        localStorage.setItem('dashboard-theme', theme)

        setSaveStatus({ type: 'success', message: 'Settings saved successfully!' })

        // Refresh the page to apply branding changes
        setTimeout(() => {
          setSaveStatus({ type: 'idle' })
        }, 2000)
      } else {
        // Demo mode - create new ministry
        const { data, error } = await supabase
          .from('ministries')
          .insert({
            name: settings.ministryName,
            tagline: settings.tagline,
            logo_url: settings.logoUrl,
            primary_color: settings.primaryColor,
            secondary_color: settings.secondaryColor,
            accent_color: settings.accentColor,
            font_family: settings.fontFamily,
            subdomain: settings.subdomain,
            custom_domain: settings.customDomain || null,
            theme: theme,
            status: 'active',
            created_by: 'demo-user', // Placeholder for demo mode
          })
          .select()
          .single()

        if (error) throw error

        // Save new ministry ID
        if (data) {
          setMinistryId(data.id)
          localStorage.setItem('current-ministry-id', data.id)
          localStorage.setItem('dashboard-theme', theme)
        }

        setSaveStatus({ type: 'success', message: 'Ministry created and settings saved!' })
        setTimeout(() => setSaveStatus({ type: 'idle' }), 2000)
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save settings. Please try again.'
      })
    }
  }

  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Playfair Display',
    'Merriweather',
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Customize your ministry dashboard branding and preferences
        </p>
      </div>

      {/* Status Message */}
      {saveStatus.type !== 'idle' && (
        <div className={cn(
          'flex items-center gap-3 p-4 rounded-lg',
          saveStatus.type === 'saving' && 'bg-blue-50 text-blue-700',
          saveStatus.type === 'success' && 'bg-green-50 text-green-700',
          saveStatus.type === 'error' && 'bg-red-50 text-red-700'
        )}>
          {saveStatus.type === 'saving' && (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          {saveStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {saveStatus.type === 'error' && <AlertCircle className="w-5 h-5" />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Branding Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={cn('p-2 rounded-lg', classes.bgLight)}>
            <Palette className={cn('w-5 h-5', classes.textPrimary)} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
            <p className="text-sm text-gray-500">
              Customize your ministry's visual identity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ministry Logo
            </label>
            <div className="flex items-center gap-6">
              <div
                className={cn(
                  'w-24 h-24 rounded-xl flex items-center justify-center border-2 border-dashed',
                  settings.logoUrl ? 'border-transparent' : 'border-gray-300'
                )}
              >
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Ministry logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saveStatus.type === 'saving'}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                    classes.buttonSecondary
                  )}
                >
                  <Upload className="w-4 h-4" />
                  {saveStatus.type === 'saving' && saveStatus.message?.includes('logo')
                    ? 'Uploading...'
                    : 'Upload Logo'}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG or SVG. Max 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Ministry Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ministry Name
            </label>
            <input
              type="text"
              value={settings.ministryName}
              onChange={(e) =>
                setSettings({ ...settings, ministryName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent"
              style={{ '--tw-ring-color': themes[theme].primary } as React.CSSProperties}
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) =>
                setSettings({ ...settings, tagline: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent"
              style={{ '--tw-ring-color': themes[theme].primary } as React.CSSProperties}
            />
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, primaryColor: e.target.value })
                }
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, primaryColor: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg uppercase"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, secondaryColor: e.target.value })
                }
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, secondaryColor: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg uppercase"
              />
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) =>
                setSettings({ ...settings, fontFamily: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themes[theme].primary } as React.CSSProperties}
            >
              {fontOptions.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Domain Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={cn('p-2 rounded-lg', classes.bgLight)}>
            <Globe className={cn('w-5 h-5', classes.textPrimary)} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Domain Settings</h2>
            <p className="text-sm text-gray-500">
              Configure your ministry's web presence
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subdomain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subdomain
            </label>
            <div className="flex">
              <input
                type="text"
                value={settings.subdomain}
                onChange={(e) =>
                  setSettings({ ...settings, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                }
                className="flex-1 px-4 py-2 border border-r-0 border-gray-300 rounded-l-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themes[theme].primary } as React.CSSProperties}
              />
              <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-r-lg text-gray-500">
                .508ministry.org
              </span>
            </div>
          </div>

          {/* Custom Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Domain (Optional)
            </label>
            <input
              type="text"
              value={settings.customDomain}
              onChange={(e) =>
                setSettings({ ...settings, customDomain: e.target.value })
              }
              placeholder="www.yourministry.org"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themes[theme].primary } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* Organization Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={cn('p-2 rounded-lg', classes.bgLight)}>
            <Building2 className={cn('w-5 h-5', classes.textPrimary)} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              508(c)(1)(A) Information
            </h2>
            <p className="text-sm text-gray-500">
              Your organization's tax-exempt status details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Organization Type</p>
            <p className="font-medium text-gray-900">
              {theme === 'sacred' ? 'Sacred Ministry' : 'Kingdom Trust'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Tax Status</p>
            <p className="font-medium text-gray-900">508(c)(1)(A) Tax Exempt</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Ministry ID</p>
            <p className="font-medium text-gray-900 font-mono text-sm">
              {ministryId || 'Not connected'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Database Status</p>
            <p className="font-medium text-gray-900 flex items-center gap-2">
              <span className={cn(
                'w-2 h-2 rounded-full',
                ministryId ? 'bg-green-500' : 'bg-yellow-500'
              )} />
              {ministryId ? 'Connected to Cognabase' : 'Demo Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saveStatus.type === 'saving'}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors',
            classes.buttonPrimary
          )}
        >
          <Save className="w-5 h-5" />
          {saveStatus.type === 'saving' ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
