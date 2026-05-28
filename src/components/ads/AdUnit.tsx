'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  className?: string
  label?: boolean
}

export default function AdUnit({
  slot,
  format = 'auto',
  className = '',
  label = true,
}: AdUnitProps) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // adsbygoogle not ready yet
    }
  }, [])

  return (
    <div className={`ad-wrap ${className}`}>
      {label && <p className="ad-label">광고</p>}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8254204287118850"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
