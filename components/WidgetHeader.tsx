// components/WidgetHeader.tsx
'use client'

import { motion } from 'framer-motion'
import { Minimize2, X, MessageSquarePlus, History, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import PlayStationLogo from './PlayStationLogo'

interface WidgetHeaderProps {
  onMinimize?: () => void
  onClose?: () => void
  onNewChat?: () => void
  onShowHistory?: () => void
  companyName?: string
  isOnline?: boolean
  currentChatTitle?: string
}

export default function WidgetHeader({ 
  onMinimize, 
  onClose, 
  onNewChat,
  onShowHistory,
  companyName = "PlayStation Support",
  isOnline = true,
  currentChatTitle
}: WidgetHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-4 py-3 rounded-t-2xl shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left: Company branding */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #e5e7eb'
              }}
            >
              <PlayStationLogo size={24} className="" />
            </div>
            {/* Online indicator */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-lg ${
              isOnline ? 'bg-green-400' : 'bg-gray-400'
            }`} />
          </div>
          
          {/* Company info - stacked with same left alignment */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-xs truncate leading-tight">{companyName}</h3>
            {currentChatTitle && (
              <p className="text-xs text-white text-opacity-70 truncate leading-tight">
                {currentChatTitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: All buttons in tight single row */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* New Chat Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewChat}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
            title="New Chat"
          >
            <MessageSquarePlus size={16} />
          </motion.button>

          {/* History Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onShowHistory}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
            title="Chat History"
          >
            <History size={16} />
          </motion.button>

          {/* Menu Button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
              title="More Options"
            >
              <MoreVertical size={16} />
            </motion.button>
            
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 py-2 min-w-[180px] z-50 overflow-hidden"
              >
                <button 
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors"
                >
                  <span className="text-lg">💾</span>
                  <span>Download chat</span>
                </button>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors"
                >
                  <span className="text-lg">🗑️</span>
                  <span>Clear history</span>
                </button>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors"
                >
                  <span className="text-lg">⚙️</span>
                  <span>Settings</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Minimize Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMinimize}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
            title="Minimize"
          >
            <Minimize2 size={16} />
          </motion.button>

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
            title="Close"
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
