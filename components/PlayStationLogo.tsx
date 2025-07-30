// components/PlayStationLogo.tsx
import { useState } from 'react'

interface PlayStationLogoProps {
  size?: number
  className?: string
}

export default function PlayStationLogo({ size = 24, className = "" }: PlayStationLogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    // Fallback if SVG fails to load
    return (
      <div 
        className={`inline-flex items-center justify-center font-black ${className}`}
        style={{ 
          fontSize: size * 0.6,
          width: size,
          height: size,
          fontFamily: 'Arial, sans-serif',
          background: 'linear-gradient(135deg, #0066cc, #004499)',
          color: 'white',
          borderRadius: '6px',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          letterSpacing: '-1px'
        }}
      >
        PS
      </div>
    )
  }

  return (
    <img 
      src="/ps-logo.svg" 
      alt="PlayStation"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => {
        console.error('PlayStation SVG logo failed to load from /ps-logo.svg')
        setImageError(true)
      }}
      onLoad={() => {
        console.log('PlayStation SVG logo loaded successfully')
      }}
      style={{ 
        width: size,
        height: size,
        // Remove the filter for SVG - let it show in its original colors first
        // filter: 'brightness(0) invert(1)', 
      }}
    />
  )
}