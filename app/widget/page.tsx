// app/widget/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { Message, ChatSession } from '@/types/chat'
import EnhancedMessage from '@/components/EnhancedMessage'
import ProfessionalChatInput from '@/components/ProfessionalChatInput'
import TypingIndicator from '@/components/TypingIndicator'
import WidgetHeader from '@/components/WidgetHeader'
import ChatHistory from '@/components/ChatHistory'

interface WidgetConfig {
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    companyName?: string
  }
  welcomeMessage?: string
  placeholder?: string
  apiEndpoint?: string
}

function WidgetContent() {
  const searchParams = useSearchParams()
  const [config, setConfig] = useState<WidgetConfig>({})
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const currentSession = chatSessions.find(s => s.id === currentSessionId)
  const messages = currentSession?.messages || []
  const userMessages = messages.filter(msg => msg.role === 'user')
  const hasUserMessages = userMessages.length > 0

  // Parse config from URL params
  useEffect(() => {
    const configParam = searchParams.get('config')
    if (configParam) {
      try {
        const parsedConfig = JSON.parse(decodeURIComponent(configParam))
        setConfig(parsedConfig)
      } catch (error) {
        console.error('Failed to parse widget config:', error)
      }
    }
    createNewChat()
  }, [searchParams])

  // Apply custom CSS from config
  useEffect(() => {
    if (config.theme) {
      const root = document.documentElement
      if (config.theme.primaryColor) root.style.setProperty('--primary-color', config.theme.primaryColor)
      if (config.theme.secondaryColor) root.style.setProperty('--secondary-color', config.theme.secondaryColor)
      if (config.theme.accentColor) root.style.setProperty('--accent-color', config.theme.accentColor)
    }
  }, [config])

  const createNewChat = () => {
    const newSessionId = uuidv4()
    const welcomeMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: config.welcomeMessage || "🎮 Welcome to PlayStation Support! I'm here to help you with your PS4 and PS5. What can I help you with today?",
      timestamp: new Date(),
    }

    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New PlayStation Chat',
      messages: [welcomeMessage],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSessionId)
    setShowHistory(false)
  }

  const updateChatTitle = (sessionId: string, userMessage: string) => {
    setChatSessions(prev => prev.map(session => {
      if (session.id === sessionId && session.title === 'New PlayStation Chat') {
        const title = userMessage.length > 30 
          ? userMessage.slice(0, 30) + '...'
          : userMessage
        return { ...session, title }
      }
      return session
    }))
  }

  const sendMessage = async (content: string) => {
    if (!currentSessionId) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    // Add user message to current session
    setChatSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const updatedSession = {
          ...session,
          messages: [...session.messages, userMessage],
          updatedAt: new Date()
        }
        if (session.title === 'New PlayStation Chat') {
          setTimeout(() => updateChatTitle(currentSessionId, content), 100)
        }
        return updatedSession
      }
      return session
    }))

    setIsLoading(true)

    try {
      // Use custom API endpoint if provided, otherwise use default
      const apiEndpoint = config.apiEndpoint || '/api/chat'
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }

      setChatSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, assistantMessage],
            updatedAt: new Date()
          }
        }
        return session
      }))

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setIsLoading(false)
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantMessage.content += parsed.content
                setChatSessions(prev => prev.map(session => {
                  if (session.id === currentSessionId) {
                    return {
                      ...session,
                      messages: session.messages.map(msg =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: assistantMessage.content }
                          : msg
                      ),
                      updatedAt: new Date()
                    }
                  }
                  return session
                }))
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      
      setChatSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, errorMessage],
            updatedAt: new Date()
          }
        }
        return session
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = (messageId: string, type: 'positive' | 'negative') => {
    console.log(`Feedback for message ${messageId}: ${type}`)
    // Send feedback to parent window if embedded
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'playstation-chat-feedback',
        messageId,
        feedback: type
      }, '*')
    }
  }

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setShowHistory(false)
  }

  const deleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId))
    if (sessionId === currentSessionId) {
      const remaining = chatSessions.filter(s => s.id !== sessionId)
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id)
      } else {
        createNewChat()
      }
    }
  }

  // Minimized state for widget
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-5 py-3 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3 group border border-white border-opacity-20"
          style={{
            background: config.theme?.primaryColor ? `linear-gradient(45deg, ${config.theme.primaryColor}, ${config.theme.secondaryColor || config.theme.primaryColor})` : undefined
          }}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-gray-200">
              <span className="font-bold text-gray-800 text-sm">PS</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
          </div>
          
          <div className="flex flex-col items-start">
            <span className="font-bold text-white text-sm">
              {config.theme?.companyName || 'PlayStation Support'}
            </span>
            <span className="text-xs text-white text-opacity-80 group-hover:text-opacity-100 transition-opacity">
              Click to continue chat
            </span>
          </div>
          
          <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full group-hover:bg-opacity-100 transition-all duration-300" />
        </motion.button>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {showHistory ? (
          <ChatHistory
            key="history"
            sessions={chatSessions}
            currentSessionId={currentSessionId}
            onSelectSession={selectSession}
            onDeleteSession={deleteSession}
            onNewChat={createNewChat}
            onBack={() => setShowHistory(false)}
          />
        ) : (
          <div key="chat" className="flex flex-col h-full">
            <WidgetHeader 
              onMinimize={() => setIsMinimized(true)}
              onClose={() => setIsMinimized(true)}
              onNewChat={createNewChat}
              onShowHistory={() => setShowHistory(true)}
              companyName={config.theme?.companyName || "PlayStation Support"}
              isOnline={true}
              currentChatTitle={currentSession?.title}
            />
            
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
              <AnimatePresence>
                {messages.map((message) => (
                  <EnhancedMessage 
                    key={message.id} 
                    message={message} 
                    onFeedback={handleFeedback}
                  />
                ))}
                {isLoading && <TypingIndicator />}
              </AnimatePresence>
            </div>
            
            <ProfessionalChatInput 
              onSendMessage={sendMessage} 
              isLoading={isLoading} 
              hasMessages={hasUserMessages}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function WidgetPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <WidgetContent />
    </Suspense>
  )
}