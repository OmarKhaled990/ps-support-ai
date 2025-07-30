// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface AnalyticsEvent {
  event: string
  data: any
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

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Example integration functions (uncomment and configure as needed)

/*
// Google Analytics 4
async function sendToGA4(event: AnalyticsEvent) {
  const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID
  const GA4_API_SECRET = process.env.GA4_API_SECRET
  
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) return
  
  const response = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: generateClientId(event.userAgent),
        events: [{
          name: event.event,
          parameters: {
            ...event.data,
            page_location: event.url,
          }
        }]
      })
    }
  )
}

// Mixpanel
async function sendToMixpanel(event: AnalyticsEvent) {
  const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN
  if (!MIXPANEL_TOKEN) return
  
  const trackData = {
    event: event.event,
    properties: {
      token: MIXPANEL_TOKEN,
      distinct_id: generateClientId(event.userAgent),
      time: new Date(event.timestamp).getTime(),
      $current_url: event.url,
      ...event.data
    }
  }
  
  await fetch('https://api.mixpanel.com/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([trackData])
  })
}

// PostHog
async function sendToPostHog(event: AnalyticsEvent) {
  const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY
  const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://app.posthog.com'
  
  if (!POSTHOG_API_KEY) return
  
  await fetch(`${POSTHOG_HOST}/capture/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${POSTHOG_API_KEY}`
    },
    body: JSON.stringify({
      api_key: POSTHOG_API_KEY,
      event: event.event,
      properties: {
        distinct_id: generateClientId(event.userAgent),
        $current_url: event.url,
        timestamp: event.timestamp,
        ...event.data
      }
    })
  })
}

function generateClientId(userAgent: string): string {
  // Simple client ID generation (in production, use a more robust method)
  return btoa(userAgent).substring(0, 32)
}
*/