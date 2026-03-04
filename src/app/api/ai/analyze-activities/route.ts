import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { activities, query, mode } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      // Return demo response when API key not configured
      return NextResponse.json({
        success: true,
        demo: true,
        result: getDemoResponse(mode, query),
      })
    }

    const systemPrompt = `You are an AI assistant for a 508(c)(1)(A) faith-based ministry management dashboard.
You help analyze ministry activities, donations, volunteer work, compliance tasks, and organizational operations.
Be concise, helpful, and provide actionable insights. Format responses in a clear, readable way.
Focus on patterns, trends, and recommendations that help the ministry operate more effectively.`

    let userPrompt = ''

    switch (mode) {
      case 'summarize':
        userPrompt = `Summarize the following ministry activities in 2-3 sentences, highlighting key actions and any notable patterns:

${JSON.stringify(activities, null, 2)}`
        break

      case 'insights':
        userPrompt = `Analyze these ministry activities and provide 3-5 actionable insights or recommendations:

${JSON.stringify(activities, null, 2)}

Format as a bulleted list with brief explanations.`
        break

      case 'query':
        userPrompt = `Based on these ministry activities:

${JSON.stringify(activities, null, 2)}

Answer this question: ${query}

Be specific and reference the actual activities when relevant.`
        break

      case 'trends':
        userPrompt = `Identify trends and patterns in these ministry activities:

${JSON.stringify(activities, null, 2)}

Focus on:
1. Activity frequency by type
2. User engagement patterns
3. Areas needing attention
4. Positive momentum areas`
        break

      default:
        userPrompt = `Analyze these ministry activities: ${JSON.stringify(activities)}`
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const content = message.content[0]
    const result = content.type === 'text' ? content.text : ''

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze activities' },
      { status: 500 }
    )
  }
}

function getDemoResponse(mode: string, query?: string): string {
  switch (mode) {
    case 'summarize':
      return `📊 **Activity Summary**

This week saw strong engagement across multiple areas. Key highlights include new donation records, volunteer profile updates, and completed compliance items. The team is actively maintaining documentation and scheduling distributions, showing healthy organizational operations.`

    case 'insights':
      return `💡 **AI Insights**

• **Strong Documentation Practices**: Regular uploads and compliance completions indicate good record-keeping habits.

• **Active Volunteer Management**: Profile updates suggest engaged volunteer coordination.

• **Donation Momentum**: New donation records and partner additions show growth in community support.

• **Recommended Focus**: Consider scheduling regular check-ins with new partners to strengthen relationships.

• **Compliance Health**: All annual requirements appear on track - maintain current momentum.`

    case 'trends':
      return `📈 **Activity Trends**

**By Type:**
- Donations & Partners: 20% of activities (growing)
- Volunteer Management: 25% of activities (stable)
- Compliance & Documentation: 35% of activities (strong)
- Events & Distribution: 20% of activities (seasonal)

**Engagement Patterns:**
- Peak activity hours: 9 AM - 3 PM
- Most active users: John Smith, Mary Johnson
- Weekend activity: Lower (as expected)

**Areas of Strength:**
- Consistent compliance tracking
- Regular financial documentation

**Watch Items:**
- Distribution scheduling could be more frequent
- Consider adding more volunteer training events`

    case 'query':
      return `Based on the activity log, ${query ? `regarding "${query}": ` : ''}

The dashboard shows active management across all ministry areas. Recent activities include donation processing, volunteer coordination, and compliance tracking. The team appears well-organized with regular updates and documentation.

*Note: This is a demo response. Connect your Anthropic API key for live AI analysis.*`

    default:
      return 'Activity analysis complete. Connect your Anthropic API key for detailed AI insights.'
  }
}
