'use client'

import { useState, useRef } from 'react'
import Script from 'next/script'
import Navbar          from '@/components/layout/Navbar'
import UploadZone      from '@/components/pattern/UploadZone'
import SettingsPanel   from '@/components/pattern/SettingsPanel'
import PatternCanvas   from '@/components/pattern/PatternCanvas'
import ThreadList      from '@/components/pattern/ThreadList'
import ProgressOverlay from '@/components/ui/ProgressOverlay'
import { usePatternGenerator } from '@/hooks/usePatternGenerator'
import type { PatternSettings } from '@/types'

const DEFAULT_SETTINGS: PatternSettings = {
  width:         100,
  height:        100,
  colorCount:    40,
  sepLevel:      'medium',
  mode:          'color',
  qualityMode:   'balanced',
  aspectMode:    'fit',
  ditheringMode: 'floyd',
}

export default function HomePage() {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [hasImage,        setHasImage]        = useState(false)
  const [imageDataUrl,    setImageDataUrl]    = useState<string | undefined>(undefined)
  const [settings,        setSettings]        = useState<PatternSettings>(DEFAULT_SETTINGS)
  const [highlightDmcId,  setHighlightDmcId]  = useState<string | null>(null)
  const [replaceSourceId, setReplaceSourceId] = useState<string | null>(null)
  const { state, generate } = usePatternGenerator()

  function handleImageLoad(img: HTMLImageElement) {
    imageRef.current = img
    setHasImage(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      setImageDataUrl(canvas.toDataURL('image/jpeg', 0.92))
    } catch {
      setImageDataUrl(undefined)
    }
  }

  function handleGenerate() {
    const img = imageRef.current
    if (!img) return
    generate(img, settings)
  }

  function handleSettingsChange(next: PatternSettings) {
    setSettings(next)
  }

  const isGenerating = state.status === 'generating'

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="px-4 sm:px-9 flex flex-col lg:flex-row gap-5 items-start">
        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 w-full pb-7">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-linen-300/20">
          {/* Left */}
          <div className="flex flex-col justify-center py-10 sm:py-14 sm:pr-12 sm:border-r border-linen-300/20">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light">
                Photo to Cross Stitch Pattern Generator
              </span>
              <div className="h-px w-12 bg-sage-400/50 hidden sm:block" />
            </div>
            <h1 className="font-playfair text-[32px] sm:text-[40px] leading-[1.2] text-warm-700 mb-2
                           tracking-[-0.01em]">
              사진을<br />
              <em className="text-warm-500 not-italic font-playfair italic">십자수 도안으로</em>
            </h1>
            <p className="font-cormorant text-[16px] sm:text-[17px] italic font-light text-warm-500
                          leading-[1.7] mb-7 sm:mb-9 max-w-xs">
              소중한 순간을 실 한 올로 담아내는<br />
              조용하고 감성적인 도안 작업실
            </p>
            <div className="flex gap-4 sm:gap-5 flex-wrap">
              {['사진 업로드', '옵션 설정', '도안 생성', 'PDF 저장'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="w-[22px] h-[22px] rounded-full border border-linen-300/40
                                   flex items-center justify-center text-[10px] text-warm-500">
                    {i + 1}
                  </span>
                  <span className="text-[11px] text-warm-400 font-light tracking-wide">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — upload */}
          <div className="flex items-center justify-center py-8 sm:py-14 sm:pl-12">
            <UploadZone onImageLoad={handleImageLoad} />
          </div>
        </div>

        {/* ── Main Studio ───────────────────────────────────────────────── */}
        <div className={`mt-7 flex flex-col lg:grid
                        ${state.threads.length > 0 ? 'lg:grid-cols-[280px_1fr_280px]' : 'lg:grid-cols-[280px_1fr]'}
                        border border-linen-300/20 rounded-panel overflow-hidden
                        shadow-linen bg-linen-50/60`}
             style={{ height: 'min(560px, calc(100vh - 200px))' }}>
          {/* Left sidebar — settings */}
          <div className="flex flex-col overflow-y-auto scrollbar-linen
                          border-b lg:border-b-0 lg:border-r border-linen-300/20
                          bg-gradient-to-b from-linen-100/35 to-linen-200/20">
            <SettingsPanel
              settings={settings}
              onChange={handleSettingsChange}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              hasImage={hasImage}
            />
          </div>

          {/* Canvas pane */}
          <div className="relative flex flex-col flex-1 min-h-[280px] lg:h-full">
            <PatternCanvas
              pattern={state.pattern}
              displayMode={settings.mode}
              highlightDmcId={highlightDmcId}
              replaceRequest={replaceSourceId}
              onReplaceClose={() => setReplaceSourceId(null)}
            />

            <ProgressOverlay
              visible={isGenerating}
              progress={state.progress}
              label={state.label}
              sub={state.sub}
            />
          </div>

          {/* Right panel — thread list & PDF options (도안 생성 후 표시) */}
          {state.threads.length > 0 && (
            <div className="flex flex-col overflow-y-auto scrollbar-linen
                            border-t lg:border-t-0 lg:border-l border-linen-300/20
                            bg-gradient-to-b from-linen-100/35 to-linen-200/20"
                 style={{ maxHeight: 'calc(100vh - 140px)' }}>
              <ThreadList
                threads={state.threads}
                pattern={state.pattern}
                imageDataUrl={imageDataUrl}
                onHighlight={setHighlightDmcId}
                highlightDmcId={highlightDmcId}
                onReplaceRequest={setReplaceSourceId}
              />
            </div>
          )}
        </div>
        </div>

        {/* ── 카카오 애드핏 세로형 배너 (데스크탑 전용) ────────────────── */}
        <div className="flex-shrink-0 sticky top-4 pt-2 hidden lg:block">
          <ins
            className="kakao_ad_area"
            style={{ display: 'none' }}
            data-ad-unit="DAN-4Eyf5lz9W8UiuTJa"
            data-ad-width="160"
            data-ad-height="600"
          />
        </div>

        <Script
          src="//t1.kakaocdn.net/kas/static/ba.min.js"
          strategy="afterInteractive"
        />
      </main>
    </div>
  )
}
