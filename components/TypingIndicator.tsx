// components/TypingIndicator.tsx
'use client'

import { motion } from 'framer-motion'
import PlayStationLogo from './PlayStationLogo'

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-6"
    >
      <div className="flex items-start gap-3 max-w-[85%]">
        {/* FIXED: White background for PlayStation logo */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg">
          <PlayStationLogo size={20} className="text-gray-800" />
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
          <div className="flex items-center mb-2 text-xs text-gray-500">
            <div className="w-5 h-5 bg-white rounded-full mr-2 flex items-center justify-center border border-gray-200">
              <PlayStationLogo size={12} className="text-gray-800" />
            </div>
            <span className="font-medium">PlayStation Support</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Thinking</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)'
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}