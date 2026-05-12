'use client'

import { useRef, useState, useCallback } from 'react'

interface UploadZoneProps {
  onImageLoad: (img: HTMLImageElement, file: File) => void
}

export default function UploadZone({ onImageLoad }: UploadZoneProps) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const [drag, setDrag]     = useState(false)
  const [loaded, setLoaded] = useState<{ name: string; size: string } | null>(null)

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        setLoaded({
          name: file.name,
          size: `${img.width} × ${img.height}px`,
        })
        onImageLoad(img, file)
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [onImageLoad])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  return (
    <div
      className={`
        relative w-full max-w-sm mx-auto cursor-pointer select-none
        border-[1.5px] border-dashed rounded-panel p-9 text-center
        bg-linen-100/40 transition-all duration-300
        ${drag
          ? 'border-sage-400/60 bg-linen-100/70 shadow-linen'
          : 'border-sage-400/30 hover:border-sage-400/55 hover:bg-linen-100/60 hover:shadow-linen'
        }
      `}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
    >
      {/* Inner decorative border */}
      <div className="pointer-events-none absolute inset-2.5 rounded-[18px] border border-sage-400/12" />

      {/* Icon */}
      <div className={`
        w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center
        border transition-all duration-300
        ${loaded
          ? 'bg-sage-400/15 border-sage-400/25'
          : 'bg-linen-100/60 border-sage-400/20'
        }
        ${drag ? 'scale-105' : 'hover:scale-[1.03]'}
      `}>
        {loaded
          ? <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                 fill="none" stroke="#7E8A78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                 fill="none" stroke="#7E8A78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
        }
      </div>

      {loaded ? (
        <>
          <p className="font-cormorant text-base italic text-warm-600 mb-1">{loaded.name}</p>
          <p className="text-xs text-warm-400 font-light">{loaded.size}</p>
          <p className="text-[10px] text-sage-400 mt-2 font-light tracking-wide">
            클릭하여 다른 사진으로 교체
          </p>
        </>
      ) : (
        <>
          <p className="font-cormorant text-base italic text-warm-600 mb-1.5">
            사진을 올려주세요
          </p>
          <p className="text-xs text-warm-400 font-light leading-relaxed">
            드래그하거나 클릭하여<br />이미지를 불러오세요
          </p>
          <div className="flex justify-center gap-2 mt-4">
            {['JPG', 'PNG'].map(t => (
              <span key={t} className="text-[10px] px-2.5 py-1 rounded-full
                                       bg-sage-400/10 border border-sage-400/18
                                       text-sage-500 tracking-wide">
                {t}
              </span>
            ))}
          </div>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }}
      />
    </div>
  )
}
