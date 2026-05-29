'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8"
         style={{ background: 'linear-gradient(160deg, #f8f6f3, #f0ebe4)' }}>
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200
                        flex items-center justify-center mx-auto mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h2 className="font-cormorant text-[20px] text-warm-700 mb-2">
          오류가 발생했습니다
        </h2>

        <p className="text-[12px] text-warm-500 font-light leading-relaxed mb-1">
          {error.message || '알 수 없는 오류입니다.'}
        </p>

        {error.digest && (
          <p className="text-[10px] text-warm-400 font-light mb-5 font-mono">
            digest: {error.digest}
          </p>
        )}

        <p className="text-[11px] text-warm-400 font-light leading-relaxed mb-6">
          이미지가 매우 크거나 색상 수가 높을 경우 메모리 오류가 발생할 수 있습니다.
          도안 크기를 줄이거나 색상 수를 낮춰보세요.
        </p>

        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-full border border-warm-300 bg-white/80
                     text-[12px] text-warm-600 hover:bg-linen-100 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
