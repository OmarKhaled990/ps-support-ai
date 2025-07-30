// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { Message, ChatSession } from '@/types/chat'
import EnhancedMessage from '@/components/EnhancedMessage'
import ProfessionalChatInput from '@/components/ProfessionalChatInput'
import TypingIndicator from '@/components/TypingIndicator'
import WidgetHeader from '@/components/WidgetHeader'
import ChatHistory from '@/components/ChatHistory'
import PlayStationLogo from '@/components/PlayStationLogo'

export default function Home() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const currentSession = chatSessions.find(s => s.id === currentSessionId)
  const messages = currentSession?.messages || []
  
  // Better user message tracking
  const userMessages = messages.filter(msg => msg.role === 'user')
  const hasUserMessages = userMessages.length > 0

  // Load saved sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        if (typeof window !== 'undefined') {
          const { ChatStorage: Storage } = await import('@/utils/storage')
          const savedSessions = Storage.loadSessions()
          if (savedSessions.length > 0) {
            setChatSessions(savedSessions)
            setCurrentSessionId(savedSessions[0].id)
          } else {
            createNewChat()
          }
        } else {
          createNewChat()
        }
      } catch (error) {
        console.error('Failed to load sessions:', error)
        createNewChat()
      }
    }
    
    loadSessions()
  }, [])

  // Save sessions whenever they change
  useEffect(() => {
    const saveSessions = async () => {
      try {
        if (chatSessions.length > 0 && typeof window !== 'undefined') {
          const { ChatStorage: Storage } = await import('@/utils/storage')
          Storage.saveSessions(chatSessions)
        }
      } catch (error) {
        console.error('Failed to save sessions:', error)
      }
    }
    
    saveSessions()
  }, [chatSessions])

  // Create new chat session
  const createNewChat = () => {
    const newSessionId = uuidv4()
    const welcomeMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: "🎮 Welcome to PlayStation Support! I'm here to help you with your PS4 and PS5. Whether you're experiencing technical issues, need game recommendations, or have questions about your console, I'm ready to assist. What can I help you with today?",
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

  // Auto-generate chat titles based on first user message
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

    // Play sound effect when sending
    try {
      if (typeof window !== 'undefined') {
        const { PlayStationSounds: Sounds } = await import('@/utils/sounds')
        Sounds.playMessageSent()
      }
    } catch (error) {
      console.log('Sound not available')
    }

    // Add user message to current session
    setChatSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const updatedSession = {
          ...session,
          messages: [...session.messages, userMessage],
          updatedAt: new Date()
        }
        // Update title if this is the first user message
        if (session.title === 'New PlayStation Chat') {
          setTimeout(() => updateChatTitle(currentSessionId, content), 100)
        }
        return updatedSession
      }
      return session
    }))

    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
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

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }

      // Add empty assistant message to show typing
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

      let isFirstChunk = true

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
                // Play sound only for the first chunk of response
                if (isFirstChunk) {
                  try {
                    if (typeof window !== 'undefined') {
                      const { PlayStationSounds: Sounds } = await import('@/utils/sounds')
                      Sounds.playMessageReceived()
                    }
                  } catch (error) {
                    console.log('Sound not available')
                  }
                  isFirstChunk = false
                }

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
    // Here you would send feedback to your analytics service
  }

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setShowHistory(false)
  }

  const deleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId))
    if (sessionId === currentSessionId) {
      // If deleting current session, switch to most recent or create new
      const remaining = chatSessions.filter(s => s.id !== sessionId)
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id)
      } else {
        createNewChat()
      }
    }
  }

  const clearAllChats = async () => {
    try {
      if (typeof window !== 'undefined') {
        const { ChatStorage: Storage } = await import('@/utils/storage')
        Storage.clearAllSessions()
      }
    } catch (error) {
      console.error('Failed to clear sessions:', error)
    }
    setChatSessions([])
    setCurrentSessionId(null)
    createNewChat()
  }

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
        >
          {/* DEBUG: Force white background for logo */}
          <div className="relative">
            <div 
              style={{
                backgroundColor: '#ffffff !important',
                background: 'white !important',
                border: '3px solid #000000', // Black border to see it
                borderRadius: '12px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 10
              }}
            >
              {/* Inner white container */}
              <div 
                style={{
                  backgroundColor: '#ffffff',
                  background: 'white',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px'
                }}
              >
                {/* Debug: Show text instead of logo temporarily */}
                <span style={{ color: '#000000', fontWeight: 'bold', fontSize: '12px' }}>PS</span>
                {/* Uncomment this when we fix the container: */}
                {/* <PlayStationLogo size={24} className="" /> */}
              </div>
            </div>
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
          </div>
          
          {/* Text */}
          <div className="flex flex-col items-start">
            <span className="font-bold text-white text-sm">PlayStation Support</span>
            <span className="text-xs text-white text-opacity-80 group-hover:text-opacity-100 transition-opacity">
              Click to continue chat
            </span>
          </div>
          
          {/* Hover indicator */}
          <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full group-hover:bg-opacity-100 transition-all duration-300" />
        </motion.button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50">
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
              companyName="PlayStation Support"
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