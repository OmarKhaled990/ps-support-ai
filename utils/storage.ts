// utils/storage.ts
import { ChatSession } from '@/types/chat'

const STORAGE_KEY = 'playstation-chat-sessions'

export class ChatStorage {
  static saveSessions(sessions: ChatSession[]) {
    try {
      // Only save in browser environment
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
      }
    } catch (error) {
      console.error('Failed to save chat sessions:', error)
    }
  }

  static loadSessions(): ChatSession[] {
    try {
      // Only load in browser environment
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const sessions = JSON.parse(stored)
          // Convert date strings back to Date objects
          return sessions.map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
    }
    return []
  }

  static clearAllSessions() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('Failed to clear chat sessions:', error)
    }
  }
}