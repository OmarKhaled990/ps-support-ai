// components/Message.tsx
import { Message as MessageType } from '@/types/chat'

interface MessageProps {
  message: MessageType
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] p-4 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
              PS
            </div>
            <span className="text-sm font-medium text-gray-600">PlayStation Support</span>
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}