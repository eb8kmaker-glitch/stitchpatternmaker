interface ProgressOverlayProps {
  visible:  boolean
  progress: number
  label:    string
  sub:      string
}

export default function ProgressOverlay({
  visible, progress, label, sub,
}: ProgressOverlayProps) {
  if (!visible) return null

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4
                    bg-linen-50/86 backdrop-blur-[6px] animate-fade-in">
      <p className="font-cormorant text-lg italic font-light text-warm-600">
        {label || '도안을 만들고 있어요...'}
      </p>

      {/* Progress bar */}
      <div className="w-48 h-0.5 bg-linen-300/50 rounded-sm overflow-hidden">
        <div
          className="h-full bg-warm-500 rounded-sm transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {sub && (
        <p className="text-[10px] text-warm-400 font-light tracking-wider">{sub}</p>
      )}
    </div>
  )
}
