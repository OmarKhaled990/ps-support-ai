// components/ChatHistory.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChatSession } from '@/types/chat'
import { ArrowLeft, Trash2, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ChatHistoryProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onNewChat: () => void
  onBack: () => void
}

export default function ChatHistory({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onDeleteSession, 
  onNewChat,
  onBack 
}: ChatHistoryProps) {
  const sortedSessions = sessions.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="w-full h-full bg-white flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-semibold">Chat History</h2>
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-b">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          <MessageSquare size={20} />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto">
        {sortedSessions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No chat history yet</p>
            <p className="text-sm">Start a conversation to see it here</p>
          </div>
        ) : (
          <div className="p-2">
            <AnimatePresence>
              {sortedSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`group relative mb-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    session.id === currentSessionId
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {session.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {session.messages.length} messages
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      title="Delete chat"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Preview of last message */}
                  {session.messages.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      {session.messages[session.messages.length - 1].content}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}