// components/EnhancedMessage.tsx
'use client'

import { motion } from 'framer-motion'
import { Message as MessageType } from '@/types/chat'
import { User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useState } from 'react'
import PlayStationLogo from './PlayStationLogo'

interface EnhancedMessageProps {
  message: MessageType
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void
}

export default function EnhancedMessage({ message, onFeedback }: EnhancedMessageProps) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)
  const isUser = message.role === 'user'

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type)
    onFeedback?.(message.id, type)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}
    >
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        {/* Avatar - FIXED: White background for PlayStation logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
              : 'bg-white border-2 border-gray-200' // WHITE BACKGROUND FOR PS LOGO
          }`}
        >
          {isUser ? (
            <User size={20} />
          ) : (
            <PlayStationLogo size={20} className="text-gray-800" />
          )}
        </motion.div>

        {/* Message Content */}
        <div className={`relative ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          {/* Message Bubble */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`relative px-4 py-3 rounded-2xl shadow-md ${
              isUser
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
            }`}
          >
            {/* PlayStation branding for bot */}
            {!isUser && (
              <div className="flex items-center mb-2 text-xs text-gray-500">
                <div className="w-5 h-5 bg-white rounded-full mr-2 flex items-center justify-center border border-gray-200">
                  <PlayStationLogo size={12} className="text-gray-800" />
                </div>
                <span className="font-medium">PlayStation Support</span>
              </div>
            )}

            {/* Message text with better typography */}
            <div className={`whitespace-pre-wrap leading-relaxed ${
              isUser ? 'text-white' : 'text-gray-800'
            }`}>
              {message.content}
            </div>

            {/* Message actions (for bot messages) */}
            {!isUser && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded"
                    title="Copy message"
                  >
                    <Copy size={14} />
                  </button>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-green-500 font-medium"
                    >
                      Copied!
                    </motion.span>
                  )}
                </div>

                {/* Feedback buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleFeedback('positive')}
                    className={`p-1 rounded transition-colors ${
                      feedback === 'positive' 
                        ? 'text-green-500 bg-green-50' 
                        : 'text-gray-400 hover:text-green-500'
                    }`}
                    title="Helpful"
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => handleFeedback('negative')}
                    className={`p-1 rounded transition-colors ${
                      feedback === 'negative' 
                        ? 'text-red-500 bg-red-50' 
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Timestamp */}
          <span className={`text-xs mt-1 ${
            isUser ? 'text-gray-400 text-right' : 'text-gray-400'
          }`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </motion.div>
  )
}