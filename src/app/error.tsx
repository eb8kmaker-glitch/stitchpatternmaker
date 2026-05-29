'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="max-w-sm">
        <p className="font-cormorant text-xl text-warm-700 mb-2">
          오류가 발생했습니다
        </p>
        <p className="text-xs text-warm-400 font-light leading-relaxed mb-6">
          {error.message || '알 수 없는 오류입니다. 페이지를 새로고침하거나 다시 시도해 주세요.'}
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-warm-600 text-linen-50 rounded-chip text-sm font-light
                     hover:bg-warm-700 transition-colors cursor-pointer"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
