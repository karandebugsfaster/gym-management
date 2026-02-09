'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  ...props 
}) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        className={`duration-300 ease-in-out ${
          isLoading ? 'scale-110 blur-lg' : 'scale-100 blur-0'
        }`}
        onLoadingComplete={() => setIsLoading(false)}
        priority={priority}
        {...props}
      />
    </div>
  )
}