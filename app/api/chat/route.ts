// app/api/chat/route.ts
import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

const SYSTEM_PROMPT = `You are a helpful PlayStation customer support agent specializing in PS4 and PS5 consoles. 

Your expertise includes:
- Technical troubleshooting for PS4 and PS5
- Hardware issues (overheating, disk problems, controller issues)
- Software problems (system updates, game installations, network connectivity)
- PlayStation Network account issues
- Game recommendations and compatibility
- Warranty and repair information

Guidelines:
- Be friendly and professional
- Provide step-by-step solutions when possible
- Keep responses concise but helpful
- If unsure, suggest contacting official PlayStation support

Common troubleshooting:
- PS4/PS5 won't turn on: Check power, try safe mode
- Overheating: Clean vents, ensure ventilation
- Network issues: Check settings, restart router
- Game problems: Update system, rebuild database
- Controller issues: Reset, check USB, re-pair`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    const messagesWithSystem = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ]

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192', // Free model, very fast
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 400,
      stream: true,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}