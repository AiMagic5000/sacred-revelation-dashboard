import { NextRequest, NextResponse } from 'next/server'

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
- Must keep financial records for internal governance

When guiding someone through a process, give clear step-by-step instructions. Reference specific dashboard pages when relevant (e.g., "Go to the Donations page" or "Check the Compliance dashboard").

Be warm, supportive, and faith-affirming. Use a tone that reflects a ministry context. Keep responses concise but thorough. If you don't know something specific to their trust, suggest they check with their legal counsel or Start My Business Inc. (the trust formation service).`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body as { messages: Message[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      // Fallback: return a helpful static response when no API key is configured
      return NextResponse.json({
        response: getFallbackResponse(messages[messages.length - 1]?.content || ''),
      })
    }

    // Call Google Gemini API
    const geminiMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const geminiPayload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.9,
      },
    }

    const model = 'gemini-2.0-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini API error:', errText)
      return NextResponse.json({
        response: getFallbackResponse(messages[messages.length - 1]?.content || ''),
      })
    }

    const geminiData = await geminiRes.json()
    const responseText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I apologize, but I was unable to generate a response. Please try again or rephrase your question.'

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error('Assistant API error:', error)
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    )
  }
}

function getFallbackResponse(query: string): string {
  const q = query.toLowerCase()

  if (q.includes('compliance') || q.includes('compliant') || q.includes('irs')) {
    return `Great question about compliance! Here's what you need to know:\n\n**IRS 14-Factor Test** - Your 508(c)(1)(A) trust must maintain church characteristics. Go to the **Compliance** page in your dashboard to see your current status.\n\n**Key requirements:**\n1. Regular worship services\n2. Ordained ministers/elders\n3. Organization of ordained ministers\n4. Regular congregants\n5. Established place of worship\n\nYour dashboard tracks all 14 factors. Items marked with a green check are complete. Yellow items need attention.\n\nWould you like help with a specific compliance requirement?`
  }

  if (q.includes('donation') || q.includes('tithe') || q.includes('offering') || q.includes('giving')) {
    return `I can help you with donations! Here's how:\n\n**To record a donation:**\n1. Go to the **Donations & Giving** page\n2. Click "Record Donation"\n3. Enter the donor name, amount, date, and category\n4. The receipt generates automatically\n\n**Donation categories available:**\n- General Fund / Tithes\n- Building Fund\n- Missions\n- Benevolence\n- Special Offerings\n\n**Tax receipts:** All donations to Sacred Revelation are tax-deductible under IRC Section 170. End-of-year statements can be generated from the **Tax Documents** page.\n\nWould you like to record a donation now?`
  }

  if (q.includes('food') || q.includes('aquapon') || q.includes('garden') || q.includes('1000')) {
    return `The 1000 lbs of Food ministry is one of your most impactful programs!\n\n**Your food systems:**\n- **Aquaponics** - Fish tanks + growing beds (check water quality daily)\n- **Vertical Tower Gardens** - 10 towers producing leafy greens\n- **Food Forest** - Permaculture with fruit trees, shrubs, and ground cover\n\n**To manage operations:**\n1. Go to **1000 lbs of Food** in the sidebar\n2. Use the tabs: Overview, Fish, Towers, Forest, SOPs\n3. Follow the **Daily SOPs** checklist each morning\n\n**Current goal:** Grow and distribute 1,000 lbs of fresh food monthly to 150+ families.\n\nWould you like help with a specific food system?`
  }

  if (q.includes('meeting') || q.includes('minutes') || q.includes('board') || q.includes('elder')) {
    return `I can help with elder board management!\n\n**To schedule a board meeting:**\n1. Go to **Elder Board** in the sidebar\n2. Click "Schedule Meeting"\n3. Set the date, time, and agenda items\n\n**For meeting minutes:**\n1. Use the **Meeting Recorder** to capture audio\n2. AI will transcribe and generate structured minutes\n3. Minutes include action items, decisions, and attendance\n\n**Board requirements:**\n- Minimum 3 board members (currently 2 active, 1 pending)\n- Regular meetings (quarterly minimum)\n- All meetings must have documented minutes for compliance\n\nWould you like to schedule a meeting or review past minutes?`
  }

  if (q.includes('trust') || q.includes('508') || q.includes('tax')) {
    return `Here's what makes your 508(c)(1)(A) trust special:\n\n**Key Benefits:**\n- **Automatic tax exemption** - No IRS application needed\n- **No Form 990** - No annual reporting to the IRS\n- **Tax-deductible donations** - Under IRC Section 170\n- **Religious liberty** - Greater autonomy than 501(c)(3)\n\n**Your trust details:**\n- Name: Sacred Revelation, A Free Church\n- EIN: 39-7070XX\n- Formation: August 7, 2025\n- State: California\n\nView all trust details on the **Trust Data** page.\n\nWould you like to know more about maintaining your trust status?`
  }

  if (q.includes('volunteer') || q.includes('member')) {
    return `Managing volunteers and members is easy!\n\n**To add a volunteer:**\n1. Go to **Volunteers** in the sidebar\n2. Click "Add Volunteer"\n3. Enter their information and availability\n\n**To manage members:**\n1. Go to **Members** in the sidebar\n2. Add new members or update existing records\n3. Track attendance and participation\n\nYou currently have active volunteers serving across your ministry programs.\n\nWould you like to add a new volunteer or member?`
  }

  return `Welcome! I'm your Sacred Revelation Trust Assistant. I can help you with:\n\n1. **Trust Management** - View and update your 508(c)(1)(A) trust data\n2. **Donations** - Record giving, generate tax receipts\n3. **Compliance** - Check IRS 14-factor status, manage documents\n4. **Food Ministry** - Manage aquaponics, gardens, food forest operations\n5. **Elder Board** - Schedule meetings, record minutes, manage governance\n6. **Volunteers & Members** - Add and manage your ministry team\n7. **Financial Reports** - Generate income summaries and giving statements\n\nWhat would you like to work on today? Just type your question or select one of the suggested actions below.`
}
