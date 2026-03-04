import { NextRequest, NextResponse } from 'next/server'
import { getCurrentOrganization, createServerClient } from '@/lib/supabase-server'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  role: 'user' | 'assistant'
  content: string
}

type ActionType =
  | 'record_donation'
  | 'add_volunteer'
  | 'create_event'
  | 'update_compliance'
  | 'add_partner'
  | 'log_healing_session'
  | 'log_music_event'
  | 'log_coaching_session'
  | 'create_resolution'
  | 'log_production'
  | 'log_distribution'

interface ActionResult {
  type: ActionType
  success: boolean
  data: Record<string, unknown>
  description: string
  link?: string
}

// ---------------------------------------------------------------------------
// Receipt Number Generator
// ---------------------------------------------------------------------------

function generateReceiptNumber(): string {
  return `RCP-${Date.now().toString(36).toUpperCase()}`
}

function generateResolutionNumber(): string {
  const yr = new Date().getFullYear()
  const seq = Math.floor(Math.random() * 900 + 100)
  return `RES-${yr}-${seq}`
}

// ---------------------------------------------------------------------------
// System Prompt with Action Markers
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are the Sacred Revelation Ministry Trust Assistant. You help trustees, elders, and administrators manage their 508(c)(1)(A) Free Church Ministry Trust.

About the Trust:
- Name: Sacred Revelation, A Free Church
- Type: 508(c)(1)(A) Free Church Ministry Trust
- Formation Date: August 7, 2025
- Presiding Elder: Patricia Kay Ward
- Location: Sacramento, California
- EIN: 39-7070XX
- Programs: Healing Ministry, Music & Worship, Life Coaching, Food Ministry (1000 lbs of Food), Community Outreach

Your role:
1. Help trustees understand and manage their 508(c)(1)(A) trust
2. Guide them through compliance requirements (IRS 14-factor test, record keeping)
3. Assist with recording donations, generating receipts, and financial tracking
4. Help manage ministry programs and volunteer coordination
5. Provide guidance on elder board governance and meeting minutes
6. Answer questions about 508(c)(1)(A) benefits and requirements
7. Help with food ministry operations (aquaponics, vertical gardens, food forest)

Key 508(c)(1)(A) Facts:
- Automatic tax exemption -- no IRS application required
- No Form 990 filing requirement
- Donations are tax-deductible under IRC Section 170
- Greater religious liberty than 501(c)(3)
- Must maintain the 14-factor test for church status

IMPORTANT - ACTION SYSTEM:
When the user asks you to perform a database action (record, add, create, log, update), and you have enough information to do it, include an ACTION MARKER in your response using this exact format:

[ACTION:action_type]{"field":"value","field2":"value2"}[/ACTION]

Supported action types and their required/optional fields:

1. record_donation - REQUIRED: donor_name, amount. OPTIONAL: donor_email, type (tithe/offering/special/building_fund/missions/benevolence), payment_method (cash/check/card/online/other), notes
2. add_volunteer - REQUIRED: name. OPTIONAL: email, phone, skills (comma-separated), status (active/inactive)
3. create_event - REQUIRED: title, start_date (YYYY-MM-DD). OPTIONAL: description, end_date, location, event_type (worship/meeting/outreach/fellowship/training/other), recurring (true/false)
4. update_compliance - REQUIRED: title, status (pending/in_progress/completed/overdue). OPTIONAL: notes
5. add_partner - REQUIRED: name. OPTIONAL: email, phone, role, status (active/inactive)
6. log_healing_session - REQUIRED: session_type, session_date (YYYY-MM-DD). OPTIONAL: facilitator_name, attendees_count, location, notes, prayer_requests (comma-separated)
7. log_music_event - REQUIRED: event_name, event_date (YYYY-MM-DD). OPTIONAL: event_type (worship_service/concert/rehearsal/recording/praise_night/choir_practice/other), musicians (comma-separated), songs_performed (comma-separated), duration_minutes, location
8. log_coaching_session - REQUIRED: coach_name, client_name, session_date (YYYY-MM-DD). OPTIONAL: session_type, duration_minutes, status (scheduled/completed/cancelled), notes
9. create_resolution - REQUIRED: title, proposed_by. OPTIONAL: description, seconded_by, vote_result (passed/failed/tabled), resolution_date (YYYY-MM-DD), status (draft/proposed/passed/failed/tabled)
10. log_production - REQUIRED: record_type, title. OPTIONAL: description, quantity, unit, production_date (YYYY-MM-DD), notes
11. log_distribution - REQUIRED: recipient_name, items_distributed. OPTIONAL: recipient_contact, quantity, distribution_date (YYYY-MM-DD), location, notes

RULES FOR ACTIONS:
- Only include an action marker when you have the REQUIRED fields from the user's message
- If the user is missing required fields, ask them for those fields conversationally -- do NOT include an action marker
- Never fabricate data -- only use what the user explicitly provided
- The amount field for donations must be a number (e.g., 500, not "$500")
- Dates should be in YYYY-MM-DD format
- After the action marker, include a friendly confirmation message

RULES FOR CONVERSATION:
- Be warm, supportive, and faith-affirming
- Keep responses concise but thorough
- Reference specific dashboard pages when relevant
- If you don't know something specific, suggest checking with legal counsel or Start My Business Inc.

Example user: "Record a $500 tithe from John Smith"
Example response: "I've recorded a $500 tithe donation from John Smith. A receipt has been generated for your records.

[ACTION:record_donation]{"donor_name":"John Smith","amount":500,"type":"tithe"}[/ACTION]

You can view all donations on the **Donations & Giving** page. Would you like to record another donation?"

Example user: "Record a donation from Sarah"
Example response: "I'd be happy to help record a donation from Sarah! Could you tell me the donation amount? Also, if you know the type (tithe, offering, special, etc.) that would be helpful too."`

// ---------------------------------------------------------------------------
// LLM Provider Chain
// ---------------------------------------------------------------------------

const CF_ACCOUNT_ID = '82f3c6e0ba2e585cd0fe3492151de1a0'

async function callCloudflareAI(messages: Message[]): Promise<string | null> {
  const cfApiKey = process.env.CF_API_KEY
  const cfEmail = process.env.CF_EMAIL

  if (!cfApiKey || !cfEmail) return null

  const cfMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: 'POST',
        headers: {
          'X-Auth-Email': cfEmail,
          'X-Auth-Key': cfApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: cfMessages, max_tokens: 1024 }),
      }
    )

    if (!res.ok) return null

    const data = await res.json()
    if (data?.success && data?.result?.response) {
      return data.result.response
    }
    return null
  } catch {
    return null
  }
}

async function callGemini(messages: Message[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const geminiMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: geminiMessages,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024, topP: 0.9 },
        }),
      }
    )

    if (!res.ok) return null

    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Action Marker Parser
// ---------------------------------------------------------------------------

interface ParsedAction {
  type: ActionType
  data: Record<string, unknown>
}

function parseActionMarkers(text: string): { cleanText: string; actions: ParsedAction[] } {
  const actionRegex = /\[ACTION:(\w+)\]([\s\S]*?)\[\/ACTION\]/g
  const actions: ParsedAction[] = []
  let match

  while ((match = actionRegex.exec(text)) !== null) {
    const actionType = match[1] as ActionType
    const jsonStr = match[2].trim()
    try {
      const data = JSON.parse(jsonStr)
      actions.push({ type: actionType, data })
    } catch {
      // Malformed JSON -- skip this action
    }
  }

  // Strip action markers from the text the user sees
  const cleanText = text
    .replace(/\[ACTION:\w+\][\s\S]*?\[\/ACTION\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { cleanText, actions }
}

// ---------------------------------------------------------------------------
// Backup Intent Detection (keyword/regex fallback)
// ---------------------------------------------------------------------------

interface DetectedIntent {
  type: ActionType
  data: Record<string, unknown>
}

function detectIntentFromText(text: string): DetectedIntent | null {
  const lower = text.toLowerCase()

  // --- record_donation ---
  const donationPatterns = [
    /(?:record|log|add|enter)\s+(?:a\s+)?\$?([\d,]+(?:\.\d{2})?)\s+(?:donation|tithe|offering|gift)\s+(?:from|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /(?:record|log|add|enter)\s+(?:a\s+)?(?:donation|tithe|offering|gift)\s+(?:of\s+)?\$?([\d,]+(?:\.\d{2})?)\s+(?:from|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /(?:donation|tithe|offering)\s+(?:of\s+)?\$?([\d,]+(?:\.\d{2})?)\s+(?:from|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:gave|donated|tithed)\s+\$?([\d,]+(?:\.\d{2})?)/i,
  ]

  for (const pattern of donationPatterns) {
    const m = text.match(pattern)
    if (m) {
      // Figure out which capture group is amount vs name
      const g1 = m[1]
      const g2 = m[2]
      const isG1Amount = /^[\d,]+(\.\d{2})?$/.test(g1.replace(/,/g, ''))
      const amount = isG1Amount ? parseFloat(g1.replace(/,/g, '')) : parseFloat(g2.replace(/,/g, ''))
      const donor_name = isG1Amount ? g2 : g1

      if (amount > 0 && donor_name) {
        const data: Record<string, unknown> = { donor_name, amount }

        // Detect type from text
        if (lower.includes('tithe')) data.type = 'tithe'
        else if (lower.includes('offering')) data.type = 'offering'
        else if (lower.includes('building')) data.type = 'building_fund'
        else if (lower.includes('mission')) data.type = 'missions'
        else if (lower.includes('benevolen')) data.type = 'benevolence'
        else if (lower.includes('special')) data.type = 'special'

        // Detect payment method
        if (lower.includes('cash')) data.payment_method = 'cash'
        else if (lower.includes('check')) data.payment_method = 'check'
        else if (lower.includes('card') || lower.includes('credit') || lower.includes('debit')) data.payment_method = 'card'
        else if (lower.includes('online') || lower.includes('zelle') || lower.includes('venmo') || lower.includes('paypal')) data.payment_method = 'online'

        return { type: 'record_donation', data }
      }
    }
  }

  // --- add_volunteer ---
  const volunteerMatch = text.match(
    /(?:add|register|sign up|create)\s+(?:a\s+)?(?:new\s+)?volunteer\s+(?:named?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  )
  if (volunteerMatch) {
    const data: Record<string, unknown> = { name: volunteerMatch[1], status: 'active' }
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
    if (emailMatch) data.email = emailMatch[0]
    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
    if (phoneMatch) data.phone = phoneMatch[0]
    return { type: 'add_volunteer', data }
  }

  // --- create_event ---
  const eventMatch = text.match(
    /(?:schedule|create|add|plan)\s+(?:a\s+|an\s+)?(?:new\s+)?(?:event|service|meeting|outreach|fellowship)\s+(?:called\s+|named\s+|titled\s+)?["']?([^"'\n]+?)["']?\s+(?:on|for)\s+(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2}(?:,?\s+\d{4})?)/i
  )
  if (eventMatch) {
    const data: Record<string, unknown> = { title: eventMatch[1].trim() }
    const dateStr = eventMatch[2]
    // Try to parse date
    const parsedDate = new Date(dateStr)
    if (!isNaN(parsedDate.getTime())) {
      data.start_date = parsedDate.toISOString().split('T')[0]
    } else {
      data.start_date = dateStr
    }
    if (lower.includes('worship')) data.event_type = 'worship'
    else if (lower.includes('meeting')) data.event_type = 'meeting'
    else if (lower.includes('outreach')) data.event_type = 'outreach'
    else if (lower.includes('fellowship')) data.event_type = 'fellowship'
    else if (lower.includes('training')) data.event_type = 'training'
    return { type: 'create_event', data }
  }

  // --- add_partner ---
  const partnerMatch = text.match(
    /(?:add|register|create)\s+(?:a\s+)?(?:new\s+)?partner(?:\s+church)?\s+(?:called\s+|named?\s+)?["']?([A-Z][^"'\n]{2,})["']?/i
  )
  if (partnerMatch) {
    const data: Record<string, unknown> = { name: partnerMatch[1].trim(), status: 'active' }
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
    if (emailMatch) data.email = emailMatch[0]
    return { type: 'add_partner', data }
  }

  // --- log_healing_session ---
  if (lower.includes('healing') && (lower.includes('session') || lower.includes('service') || lower.includes('prayer'))) {
    const actionWords = ['log', 'record', 'add', 'create']
    if (actionWords.some((w) => lower.includes(w))) {
      const data: Record<string, unknown> = { session_type: 'prayer_healing' }
      const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/)
      data.session_date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]
      const attendeesMatch = text.match(/(\d+)\s*(?:attendees|people|participants|members)/)
      if (attendeesMatch) data.attendees_count = parseInt(attendeesMatch[1])
      const facilitatorMatch = text.match(/(?:led by|facilitator|facilitated by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)
      if (facilitatorMatch) data.facilitator_name = facilitatorMatch[1]
      return { type: 'log_healing_session', data }
    }
  }

  // --- log_music_event ---
  if ((lower.includes('music') || lower.includes('worship') || lower.includes('choir') || lower.includes('praise')) &&
      (lower.includes('log') || lower.includes('record') || lower.includes('add'))) {
    const nameMatch = text.match(/(?:called|named|titled)\s+["']?([^"'\n]+?)["']?\s*(?:on|for|$)/i)
    const data: Record<string, unknown> = {
      event_name: nameMatch ? nameMatch[1].trim() : 'Worship Service',
    }
    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/)
    data.event_date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]
    if (lower.includes('rehearsal')) data.event_type = 'rehearsal'
    else if (lower.includes('concert')) data.event_type = 'concert'
    else if (lower.includes('recording')) data.event_type = 'recording'
    else if (lower.includes('choir')) data.event_type = 'choir_practice'
    else if (lower.includes('praise night')) data.event_type = 'praise_night'
    else data.event_type = 'worship_service'
    return { type: 'log_music_event', data }
  }

  // --- log_coaching_session ---
  if (lower.includes('coaching') && (lower.includes('log') || lower.includes('record') || lower.includes('add'))) {
    const coachMatch = text.match(/coach(?:ed by)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
    const clientMatch = text.match(/(?:client|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
    if (coachMatch && clientMatch) {
      const data: Record<string, unknown> = {
        coach_name: coachMatch[1],
        client_name: clientMatch[1],
        session_date: new Date().toISOString().split('T')[0],
        status: 'completed',
      }
      return { type: 'log_coaching_session', data }
    }
  }

  // --- log_production ---
  if ((lower.includes('harvest') || lower.includes('production') || lower.includes('grew') || lower.includes('produced')) &&
      (lower.includes('log') || lower.includes('record') || lower.includes('add'))) {
    const qtyMatch = text.match(/(\d+)\s*(lbs?|pounds?|kg|gallons?|units?|heads?|bunches?|boxes?)/i)
    const data: Record<string, unknown> = {
      record_type: 'harvest',
      title: 'Farm Harvest',
      production_date: new Date().toISOString().split('T')[0],
    }
    if (qtyMatch) {
      data.quantity = parseInt(qtyMatch[1])
      data.unit = qtyMatch[2].toLowerCase()
    }
    return { type: 'log_production', data }
  }

  // --- log_distribution ---
  if ((lower.includes('distribute') || lower.includes('distribution') || lower.includes('gave food') || lower.includes('delivered')) &&
      (lower.includes('log') || lower.includes('record') || lower.includes('add') || lower.includes('to '))) {
    const recipientMatch = text.match(/(?:to|for|recipient)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
    const itemsMatch = text.match(/(\d+)\s*(lbs?|pounds?|boxes?|bags?|meals?|items?)\s+(?:of\s+)?(\w+(?:\s+\w+)?)/i)
    if (recipientMatch) {
      const data: Record<string, unknown> = {
        recipient_name: recipientMatch[1],
        items_distributed: itemsMatch ? `${itemsMatch[1]} ${itemsMatch[2]} of ${itemsMatch[3]}` : 'Food package',
        distribution_date: new Date().toISOString().split('T')[0],
      }
      if (itemsMatch) data.quantity = parseInt(itemsMatch[1])
      return { type: 'log_distribution', data }
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Action Executor
// ---------------------------------------------------------------------------

const ACTION_CONFIG: Record<ActionType, { table: string; link: string; descriptionFn: (data: Record<string, unknown>) => string }> = {
  record_donation: {
    table: 'donations',
    link: '/dashboard/donations',
    descriptionFn: (d) => `Donation of $${d.amount} from ${d.donor_name} recorded (${d.receipt_number || 'receipt pending'})`,
  },
  add_volunteer: {
    table: 'volunteers',
    link: '/dashboard/volunteers',
    descriptionFn: (d) => `Volunteer ${d.name} added to the ministry team`,
  },
  create_event: {
    table: 'events',
    link: '/dashboard/events',
    descriptionFn: (d) => `Event "${d.title}" created for ${d.start_date}`,
  },
  update_compliance: {
    table: 'compliance_items',
    link: '/dashboard/compliance',
    descriptionFn: (d) => `Compliance item "${d.title}" updated to ${d.status}`,
  },
  add_partner: {
    table: 'partners',
    link: '/dashboard/partner-churches',
    descriptionFn: (d) => `Partner "${d.name}" added to the directory`,
  },
  log_healing_session: {
    table: 'healing_sessions',
    link: '/dashboard/healing-ministry',
    descriptionFn: (d) => `Healing session (${d.session_type}) logged for ${d.session_date}`,
  },
  log_music_event: {
    table: 'music_events',
    link: '/dashboard/music-worship',
    descriptionFn: (d) => `Music event "${d.event_name}" logged for ${d.event_date}`,
  },
  log_coaching_session: {
    table: 'coaching_sessions',
    link: '/dashboard/life-coaching',
    descriptionFn: (d) => `Coaching session: ${d.coach_name} with ${d.client_name} logged`,
  },
  create_resolution: {
    table: 'elder_board_resolutions',
    link: '/dashboard/elder-board',
    descriptionFn: (d) => `Resolution "${d.title}" (${d.resolution_number || ''}) created`,
  },
  log_production: {
    table: 'production_records',
    link: '/dashboard/farm-production',
    descriptionFn: (d) => `Production record: ${d.quantity || ''} ${d.unit || ''} ${d.title} logged`,
  },
  log_distribution: {
    table: 'distribution_records',
    link: '/dashboard/distribution',
    descriptionFn: (d) => `Distribution to ${d.recipient_name}: ${d.items_distributed}`,
  },
}

async function executeAction(
  action: ParsedAction,
  organizationId: string
): Promise<ActionResult> {
  const config = ACTION_CONFIG[action.type]
  if (!config) {
    return {
      type: action.type,
      success: false,
      data: action.data,
      description: `Unknown action type: ${action.type}`,
    }
  }

  const supabase = createServerClient()
  const enrichedData: Record<string, unknown> = { ...action.data, organization_id: organizationId }

  // Type-specific enrichment
  if (action.type === 'record_donation') {
    enrichedData.receipt_number = generateReceiptNumber()
    enrichedData.status = enrichedData.status || 'completed'
    // Normalize amount to number
    if (typeof enrichedData.amount === 'string') {
      enrichedData.amount = parseFloat((enrichedData.amount as string).replace(/[,$]/g, ''))
    }
  }

  if (action.type === 'add_volunteer') {
    enrichedData.status = enrichedData.status || 'active'
    enrichedData.total_hours = enrichedData.total_hours || 0
    // Convert comma-separated skills to array
    if (typeof enrichedData.skills === 'string') {
      enrichedData.skills = (enrichedData.skills as string).split(',').map((s: string) => s.trim())
    }
  }

  if (action.type === 'create_resolution') {
    enrichedData.resolution_number = enrichedData.resolution_number || generateResolutionNumber()
    enrichedData.status = enrichedData.status || 'draft'
    enrichedData.resolution_date = enrichedData.resolution_date || new Date().toISOString().split('T')[0]
  }

  if (action.type === 'log_healing_session') {
    if (typeof enrichedData.prayer_requests === 'string') {
      enrichedData.prayer_requests = (enrichedData.prayer_requests as string).split(',').map((s: string) => s.trim())
    }
    if (typeof enrichedData.attendees_count === 'string') {
      enrichedData.attendees_count = parseInt(enrichedData.attendees_count as string)
    }
  }

  if (action.type === 'log_music_event') {
    if (typeof enrichedData.musicians === 'string') {
      enrichedData.musicians = (enrichedData.musicians as string).split(',').map((s: string) => s.trim())
    }
    if (typeof enrichedData.songs_performed === 'string') {
      enrichedData.songs_performed = (enrichedData.songs_performed as string).split(',').map((s: string) => s.trim())
    }
    if (typeof enrichedData.duration_minutes === 'string') {
      enrichedData.duration_minutes = parseInt(enrichedData.duration_minutes as string)
    }
  }

  if (action.type === 'log_coaching_session') {
    if (typeof enrichedData.duration_minutes === 'string') {
      enrichedData.duration_minutes = parseInt(enrichedData.duration_minutes as string)
    }
  }

  if (action.type === 'log_production') {
    if (typeof enrichedData.quantity === 'string') {
      enrichedData.quantity = parseInt(enrichedData.quantity as string)
    }
  }

  if (action.type === 'log_distribution') {
    if (typeof enrichedData.quantity === 'string') {
      enrichedData.quantity = parseInt(enrichedData.quantity as string)
    }
  }

  try {
    if (action.type === 'update_compliance') {
      // Update existing compliance item by title
      const { data: existing } = await supabase
        .from('compliance_items')
        .select('id')
        .eq('organization_id', organizationId)
        .ilike('title', `%${enrichedData.title}%`)
        .limit(1)
        .single()

      if (existing) {
        const updatePayload: Record<string, unknown> = { status: enrichedData.status }
        if (enrichedData.status === 'completed') {
          updatePayload.completed_at = new Date().toISOString()
        }
        const { error } = await supabase
          .from('compliance_items')
          .update(updatePayload)
          .eq('id', existing.id)

        if (error) throw error

        // Log activity
        await logActivity(supabase, organizationId, action.type, config.descriptionFn(enrichedData), enrichedData)

        return {
          type: action.type,
          success: true,
          data: { ...enrichedData, id: existing.id },
          description: config.descriptionFn(enrichedData),
          link: config.link,
        }
      } else {
        return {
          type: action.type,
          success: false,
          data: enrichedData,
          description: `Could not find compliance item matching "${enrichedData.title}"`,
        }
      }
    }

    // Standard insert for all other actions
    const { data: inserted, error } = await supabase
      .from(config.table)
      .insert(enrichedData)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await logActivity(supabase, organizationId, action.type, config.descriptionFn(enrichedData), enrichedData)

    return {
      type: action.type,
      success: true,
      data: { ...enrichedData, id: inserted?.id },
      description: config.descriptionFn(enrichedData),
      link: config.link,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database operation failed'
    return {
      type: action.type,
      success: false,
      data: enrichedData,
      description: `Failed to execute ${action.type}: ${message}`,
    }
  }
}

async function logActivity(
  supabase: ReturnType<typeof createServerClient>,
  organizationId: string,
  action: string,
  description: string,
  metadata: Record<string, unknown>
) {
  try {
    await supabase.from('activity_logs').insert({
      organization_id: organizationId,
      action,
      description,
      metadata,
    })
  } catch {
    // Activity logging should never block the main operation
  }
}

// ---------------------------------------------------------------------------
// Fallback Response Generator (unchanged from original)
// ---------------------------------------------------------------------------

function getFallbackResponse(query: string): string {
  const q = query.toLowerCase()

  if (q.includes('compliance') || q.includes('compliant') || q.includes('irs')) {
    return `Great question about compliance! Here's what you need to know:\n\n**IRS 14-Factor Test** - Your 508(c)(1)(A) trust must maintain church characteristics. Go to the **Compliance** page in your dashboard to see your current status.\n\n**Key requirements:**\n1. Regular worship services\n2. Ordained ministers/elders\n3. Organization of ordained ministers\n4. Regular congregants\n5. Established place of worship\n\nYour dashboard tracks all 14 factors. Items marked with a green check are complete. Yellow items need attention.\n\nWould you like help with a specific compliance requirement?`
  }

  if (q.includes('donation') || q.includes('tithe') || q.includes('offering') || q.includes('giving')) {
    return `I can help you with donations! Here's how:\n\n**To record a donation:**\nJust tell me the donor name and amount, and I'll record it for you right here. For example: "Record a $500 tithe from John Smith"\n\n**Or do it manually:**\n1. Go to the **Donations & Giving** page\n2. Click "Record Donation"\n3. Enter the donor name, amount, date, and category\n\n**Donation categories available:**\n- General Fund / Tithes\n- Building Fund\n- Missions\n- Benevolence\n- Special Offerings\n\n**Tax receipts:** All donations to Sacred Revelation are tax-deductible under IRC Section 170.\n\nWould you like to record a donation now? Just tell me the donor name and amount.`
  }

  if (q.includes('food') || q.includes('aquapon') || q.includes('garden') || q.includes('1000')) {
    return `The 1000 lbs of Food ministry is one of your most impactful programs!\n\n**Your food systems:**\n- **Aquaponics** - Fish tanks + growing beds (check water quality daily)\n- **Vertical Tower Gardens** - 10 towers producing leafy greens\n- **Food Forest** - Permaculture with fruit trees, shrubs, and ground cover\n\n**I can help you:**\n- Log production records ("Log 50 lbs lettuce harvest")\n- Record distributions ("Distribute 20 lbs vegetables to Maria Garcia")\n\n**Current goal:** Grow and distribute 1,000 lbs of fresh food monthly to 150+ families.\n\nWould you like to log a harvest or distribution?`
  }

  if (q.includes('meeting') || q.includes('minutes') || q.includes('board') || q.includes('elder')) {
    return `I can help with elder board management!\n\n**I can do these for you:**\n- Create resolutions ("Create a resolution titled 'Annual Budget Approval' proposed by Patricia Ward")\n- Schedule events ("Schedule a board meeting on 2026-04-15")\n\n**For meeting minutes:**\n1. Use the **Meeting Recorder** to capture audio\n2. AI will transcribe and generate structured minutes\n3. Minutes include action items, decisions, and attendance\n\n**Board requirements:**\n- Minimum 3 board members\n- Regular meetings (quarterly minimum)\n- All meetings must have documented minutes for compliance\n\nWould you like to create a resolution or schedule a meeting?`
  }

  if (q.includes('trust') || q.includes('508') || q.includes('tax')) {
    return `Here's what makes your 508(c)(1)(A) trust special:\n\n**Key Benefits:**\n- **Automatic tax exemption** - No IRS application needed\n- **No Form 990** - No annual reporting to the IRS\n- **Tax-deductible donations** - Under IRC Section 170\n- **Religious liberty** - Greater autonomy than 501(c)(3)\n\n**Your trust details:**\n- Name: Sacred Revelation, A Free Church\n- EIN: 39-7070XX\n- Formation: August 7, 2025\n- State: California\n\nView all trust details on the **Trust Data** page.\n\nWould you like to know more about maintaining your trust status?`
  }

  if (q.includes('volunteer') || q.includes('member')) {
    return `I can help manage volunteers!\n\n**To add a volunteer, just tell me:**\n"Add volunteer Jane Doe" -- and I'll create the record.\n\nYou can also include details:\n"Add volunteer Jane Doe, email jane@email.com, skills: cooking, gardening"\n\n**Or do it manually:**\n1. Go to **Volunteers** in the sidebar\n2. Click "Add Volunteer"\n3. Enter their information and availability\n\nWould you like to add a new volunteer?`
  }

  if (q.includes('report') || q.includes('financial') || q.includes('income') || q.includes('expense')) {
    return `I can help with financial reports!\n\n**To generate a report:**\n1. Go to **Financial Reports** in the sidebar\n2. Select report type: Income Summary, Expense Breakdown, or Giving Statement\n3. Choose a date range\n4. Click "Generate" to create a downloadable PDF\n\n**Available reports:**\n- **Income Summary** - All donations and revenue by category\n- **Expense Breakdown** - Program costs, operations, missions\n- **Giving Statement** - Per-donor giving totals (for tax receipts)\n- **Budget vs Actual** - Track spending against your ministry budget\n\nWould you like to generate a specific report?`
  }

  if (q.includes('heal') || q.includes('prayer') || q.includes('worship') || q.includes('music')) {
    return `Your ministry programs are the heart of Sacred Revelation!\n\n**I can log activities for you:**\n- "Log a healing prayer session with 12 attendees"\n- "Record a worship service called Sunday Praise"\n\n**Healing Ministry:**\n- Go to **Healing Ministry** in the sidebar\n- Schedule prayer sessions, track testimonies, manage healing service events\n\n**Music & Worship:**\n- Go to **Music & Worship** in the sidebar\n- Schedule worship services, concerts, praise nights, and recording sessions\n\nWould you like to log a session or event?`
  }

  if (q.includes('coach') || q.includes('life coaching') || q.includes('mentoring')) {
    return `I can help with life coaching records!\n\n**To log a session, tell me:**\n"Log coaching session with coach Patricia Ward and client John Doe"\n\n**Or manage manually:**\n1. Go to **Life Coaching** in the sidebar\n2. Add new sessions, track progress, manage client relationships\n\nWould you like to log a coaching session?`
  }

  return `Welcome! I'm your Sacred Revelation Trust Assistant. I can help you with:\n\n1. **Record donations** - "Record a $500 tithe from John Smith"\n2. **Add volunteers** - "Add volunteer Jane Doe"\n3. **Schedule events** - "Create an event called Sunday Service on 2026-04-20"\n4. **Log ministry activities** - Healing sessions, music events, coaching\n5. **Food ministry** - Log production, record distributions\n6. **Elder board** - Create resolutions, schedule meetings\n7. **Compliance** - Check and update IRS 14-factor status\n8. **Financial reports** - Generate income summaries\n\nJust tell me what you need, and I'll take care of it!`
}

// ---------------------------------------------------------------------------
// Main API Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body as { messages: Message[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // Authenticate and get organization
    let organizationId: string | null = null
    try {
      const org = await getCurrentOrganization()
      organizationId = org.id
    } catch {
      // Continue without auth -- actions will be disabled but conversation still works
    }

    const lastUserMessage = messages[messages.length - 1]?.content || ''

    // Try LLM providers in order: Cloudflare -> Gemini -> Fallback
    let rawResponse: string | null = null

    rawResponse = await callCloudflareAI(messages)
    if (!rawResponse) {
      rawResponse = await callGemini(messages)
    }
    if (!rawResponse) {
      rawResponse = getFallbackResponse(lastUserMessage)
    }

    // Parse action markers from LLM response
    const { cleanText, actions } = parseActionMarkers(rawResponse)

    // If LLM produced no action markers, try backup intent detection
    let detectedAction: ParsedAction | null = null
    if (actions.length === 0) {
      const intent = detectIntentFromText(lastUserMessage)
      if (intent) {
        detectedAction = intent
      }
    }

    const allActions = actions.length > 0 ? actions : detectedAction ? [detectedAction] : []

    // Execute actions if we have auth and actions to run
    if (organizationId && allActions.length > 0) {
      // Execute the first action (most requests will have a single action)
      const actionResult = await executeAction(allActions[0], organizationId)

      // If this was from backup detection and the LLM didn't mention it,
      // append a confirmation to the response text
      let responseText = cleanText
      if (actions.length === 0 && detectedAction && actionResult.success) {
        // The LLM response may not have mentioned the action, so we augment it
        const augment = actionResult.type === 'record_donation'
          ? `\n\nI've gone ahead and recorded that donation. Receipt number: **${actionResult.data.receipt_number}**. You can view it on the **Donations & Giving** page.`
          : `\n\nI've gone ahead and completed that for you. You can view the record on the relevant dashboard page.`
        responseText = responseText + augment
      }

      return NextResponse.json({
        response: responseText,
        action: {
          type: actionResult.type,
          success: actionResult.success,
          data: actionResult.data,
          description: actionResult.description,
          link: actionResult.link,
        },
      })
    }

    // No actions to execute -- return plain response
    return NextResponse.json({ response: cleanText })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to process your request: ${message}` },
      { status: 500 }
    )
  }
}
