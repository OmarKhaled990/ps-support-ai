// utils/sounds.ts
export class PlayStationSounds {
  private static audioContext: AudioContext | null = null
  
  private static getAudioContext() {
    // Only create in browser environment
    if (typeof window === 'undefined') return null
    
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  // PlayStation startup-like sound for sending messages
  static playMessageSent() {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      // PlayStation-like ascending tone
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.3)
    } catch (error) {
      // Silently fail if audio is not available
      console.log('Audio not available')
    }
  }

  // PlayStation notification-like sound for receiving messages
  static playMessageReceived() {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      // PlayStation-like notification tone
      oscillator.frequency.setValueAtTime(600, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.15)
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.4)
    } catch (error) {
      // Silently fail if audio is not available
      console.log('Audio not available')
    }
  }

  // PlayStation error sound
  static playError() {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      // Low error tone
      oscillator.frequency.setValueAtTime(200, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    } catch (error) {
      console.log('Audio not available')
    }
  }
}