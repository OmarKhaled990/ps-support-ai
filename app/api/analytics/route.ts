// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface AnalyticsEvent {
  event: string
  data: Record<string, unknown>  // Fixed: replaced 'any' with proper type
  timestamp: string
  url: string
  userAgent: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyticsEvent = await request.json()
    
    // Get client IP address
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    // Log analytics event
    console.log('Widget Analytics:', {
      event: body.event,
      data: body.data,
      timestamp: body.timestamp,
      url: body.url,
      userAgent: body.userAgent,
      ip: clientIP,
    })

    // Here you can integrate with your analytics service
    // Examples:
    
    // Google Analytics 4
    // await sendToGA4(body)
    
    // Mixpanel
    // await sendToMixpanel(body)
    
    // Custom analytics database
    // await saveToDatabase(body)
    
    // PostHog
    // await sendToPostHog(body)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to process analytics' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {  // Fixed: removed unused request parameter
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}