// components/ProfessionalChatInput.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Paperclip, Smile } from 'lucide-react'

interface ProfessionalChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  hasMessages?: boolean // Track if chat has started
}

export default function ProfessionalChatInput({ 
  onSendMessage, 
  isLoading, 
  hasMessages = false 
}: ProfessionalChatInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const playstationQuickActions = [
    "Console won't turn on",
    "Overheating issues", 
    "Controller problems",
    "Network connectivity",
    "Game installation issues",
    "System update problems"
  ]

  const handleQuickAction = (action: string) => {
    // Instead of setting message, directly send it
    onSendMessage(action)
  }

  // FIXED: Quick actions should only show when no user has sent ANY messages yet
  const shouldShowQuickActions = !hasMessages && !isLoading

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-4">
      {/* PlayStation Quick action buttons - FIXED LOGIC */}
      <AnimatePresence>
        {shouldShowQuickActions && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-2 mb-3"
          >
            {playstationQuickActions.map((action, index) => (
              <motion.button
                key={action}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(action)}
                className="px-3 py-2 text-sm bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-gray-700 rounded-full transition-all border border-blue-200"
              >
                {action}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center bg-gray-50 rounded-2xl border-2 transition-all duration-200 ${
          isFocused ? 'border-purple-300 bg-white shadow-lg' : 'border-gray-200'
        }`}>
          {/* Text input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask about your PlayStation issue..."
            className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
            disabled={isLoading}
          />

          {/* Input actions */}
          <div className="flex items-center gap-2 px-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-purple-600 transition-colors rounded-full hover:bg-purple-50"
              title="Attach screenshot"
            >
              <Paperclip size={18} />
            </button>
            
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-purple-600 transition-colors rounded-full hover:bg-purple-50"
              title="Voice message"
            >
              <Mic size={18} />
            </button>

            <button
              type="button"
              className="p-2 text-gray-400 hover:text-purple-600 transition-colors rounded-full hover:bg-purple-50"
              title="Emoji"
            >
              <Smile size={18} />
            </button>

            {/* PlayStation themed Send button */}
            <motion.button
              type="submit"
              disabled={isLoading || !message.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full transition-all duration-200 ${
                message.trim() && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>

        {/* Character count for long messages */}
        {message.length > 100 && (
          <div className="text-xs text-purple-400 mt-1 text-right">
            {message.length}/500
          </div>
        )}
      </form>
    </div>
  )
}