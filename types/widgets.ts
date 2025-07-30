// types/widget.ts
export interface WidgetConfig {
  apiEndpoint: string
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    companyName: string
    companyLogo?: string
  }
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size: 'small' | 'medium' | 'large'
  welcomeMessage: string
  placeholder: string
  enableSounds: boolean
  enableHistory: boolean
  customCSS?: string
}

export const defaultConfig: WidgetConfig = {
  apiEndpoint: '/api/chat',
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6', 
    accentColor: '#ec4899',
    companyName: 'PlayStation Support'
  },
  position: 'bottom-right',
  size: 'medium',
  welcomeMessage: '🎮 Welcome to PlayStation Support! How can I help you today?',
  placeholder: 'Ask about your PlayStation issue...',
  enableSounds: true,
  enableHistory: true
}