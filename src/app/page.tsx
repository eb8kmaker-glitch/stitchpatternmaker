'use client'

import { useState, useRef } from 'react'
import Navbar          from '@/components/layout/Navbar'
import UploadZone      from '@/components/pattern/UploadZone'
import SettingsPanel   from '@/components/pattern/SettingsPanel'
import PatternCanvas   from '@/components/pattern/PatternCanvas'
import ThreadList      from '@/components/pattern/ThreadList'
import ProgressOverlay from '@/components/ui/ProgressOverlay'
import PaletteShowcase from '@/components/ui/PaletteShowcase'
import { usePatternGenerator } from '@/hooks/usePatternGenerator'
import type { PatternSettings } from '@/types'

const DEFAULT_SETTINGS: PatternSettings = {
  width:      100,
  height:     100,
  colorCount: 40,
  sepLevel:   'medium',
  mode:       'color',
}

export default function HomePage() {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [hasImage,  setHasImage]  = useState(false)
  const [settings,  setSettings]  = useState<PatternSettings>(DEFAULT_SETTINGS)
  const { state, generate } = usePatternGenerator()

  function handleImageLoad(img: HTMLImageElement) {
    imageRef.current = img
    setHasImage(true)
  }

  function handleGenerate() {
    const img = imageRef.current
    if (!img) return
    generate(img, settings)
  }

  function handleSettingsChange(next: PatternSettings) {
    setSettings(next)
    // If mode changed and pattern exists, re-render handled by PatternCanvas effect
  }

  const isGenerating = state.status === 'generating'

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="px-9 pb-16">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 min-h-[400px] border-b border-linen-300/20">
          {/* Left */}
          <div className="flex flex-col justify-center py-14 pr-12 border-r border-linen-300/20">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light">
                Handmade Pattern Studio
              </span>
              <div className="h-px w-12 bg-sage-400/50" />
            </div>
            <h1 className="font-playfair text-[40px] leading-[1.2] text-warm-700 mb-2
                           tracking-[-0.01em]">
              사진을<br />
              <em className="text-warm-500 not-italic font-playfair italic">십자수 도안으로</em>
            </h1>
            <p className="font-cormorant text-[17px] italic font-light text-warm-500
                          leading-[1.7] mb-9 max-w-xs">
              소중한 순간을 실 한 올로 담아내는<br />
              조용하고 감성적인 도안 작업실
            </p>
            <div className="flex gap-5 flex-wrap">
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
          <div className="flex items-center justify-center py-14 pl-12">
            <UploadZone onImageLoad={handleImageLoad} />
          </div>
        </div>

        {/* ── Main Studio ───────────────────────────────────────────────── */}
        <div className="mt-7 grid grid-cols-[280px_1fr] min-h-[560px]
                        border border-linen-300/20 rounded-panel overflow-hidden
                        shadow-linen bg-linen-50/60">
          {/* Sidebar */}
          <div className="flex flex-col max-h-[640px] overflow-y-auto scrollbar-linen
                          border-r border-linen-300/20
                          bg-gradient-to-b from-linen-100/35 to-linen-200/20">
            <div className="px-5 py-4 border-b border-linen-300/18">
              <h2 className="font-cormorant text-[15px] text-warm-600 tracking-wide">
                도안 설정
              </h2>
            </div>

            <SettingsPanel
              settings={settings}
              onChange={handleSettingsChange}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              hasImage={hasImage}
            />

            {state.threads.length > 0 && (
              <div className="border-t border-linen-300/18 mt-auto">
                <ThreadList
                  threads={state.threads}
                  pattern={state.pattern}
                />
              </div>
            )}
          </div>

          {/* Canvas pane */}
          <div className="relative flex flex-col">
            <PatternCanvas
              pattern={state.pattern}
              displayMode={settings.mode}
            />

            <ProgressOverlay
              visible={isGenerating}
              progress={state.progress}
              label={state.label}
              sub={state.sub}
            />
          </div>
        </div>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <div className="mt-7 grid grid-cols-4 gap-3.5">
          {FEATURES.map(f => (
            <div key={f.title}
                 className="bg-linen-50/80 border border-linen-300/20 rounded-card p-5
                            shadow-linen hover:shadow-linen-md hover:border-linen-300/35
                            transition-all duration-250">
              <div className="w-9 h-9 rounded-full bg-sage-400/12 border border-sage-400/20
                              flex items-center justify-center mb-3 text-sage-500">
                {f.icon}
              </div>
              <h4 className="font-cormorant text-[14px] text-warm-600 mb-1.5 tracking-wide">
                {f.title}
              </h4>
              <p className="text-[11px] text-warm-400 font-light leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Palette showcase ──────────────────────────────────────────── */}
        <PaletteShowcase />
      </main>
    </div>
  )
}

const FEATURES = [
  {
    title: 'LAB 색공간 매핑',
    desc:  '사람 눈 기준으로 가장 가까운 DMC 실 색상을 ΔE 거리로 정확하게 매핑합니다',
    icon: <LabIcon />,
  },
  {
    title: '유사색 자동 분리',
    desc:  '인접 색상의 ΔE를 검사해 자동 보정, 구분하기 어려운 배치를 예방합니다',
    icon: <WandIcon />,
  },
  {
    title: '인쇄용 PDF 출력',
    desc:  '실 목록, 페이지 분할, DMC 번호가 포함된 고해상도 도안을 내보냅니다',
    icon: <PrintIcon />,
  },
  {
    title: '브라우저 전용 처리',
    desc:  '업로드한 사진은 서버로 전송되지 않아 개인 사진도 안전합니다',
    icon: <ShieldIcon />,
  },
]

function LabIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
}
function WandIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2m0 14v-2M8 9H2m14 0h-2"/><line x1="4" y1="20" x2="14" y2="10"/></svg>
}
function PrintIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
}
function ShieldIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
