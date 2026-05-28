'use client'

import { useEffect, useRef } from 'react'

interface AdUnitProps {
  slot: string
  style?: React.CSSProperties
  wrapperStyle?: React.CSSProperties
}

export default function AdUnit({ slot, style, wrapperStyle }: AdUnitProps) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {}
  }, [])

  return (
    <div style={{ width: '100%', overflow: 'hidden', ...wrapperStyle }}>
      <span style={{
        display: 'block',
        fontSize: 10,
        color: 'var(--text-muted, #bbb)',
        textAlign: 'center',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginBottom: 4,
      }}>
        advertisement
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', border: 'none', outline: 'none', ...style }}
        data-ad-client="ca-pub-8254204287118850"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
