'use client'

import type { PatternSettings, SepLevel, DisplayMode, SizePrefixPreset, QualityMode } from '@/types'

interface SettingsPanelProps {
  settings:    PatternSettings
  onChange:    (s: PatternSettings) => void
  onGenerate:  () => void
  isGenerating: boolean
  hasImage:    boolean
}

const PRESETS: { label: string; value: SizePrefixPreset; w: number; h: number }[] = [
  { label: '50 × 50',   value: '50x50',   w: 50,  h: 50  },
  { label: '100 × 100', value: '100x100', w: 100, h: 100 },
  { label: '150 × 200', value: '150x200', w: 150, h: 200 },
  { label: '200 × 200', value: '200x200', w: 200, h: 200 },
  { label: '직접 입력', value: 'custom',  w: 0,   h: 0   },
]

const COLOR_COUNTS = [
  { label: '20색 — 단순',  value: 20 },
  { label: '40색 — 균형',  value: 40 },
  { label: '60색 — 세밀',  value: 60 },
  { label: '80색 — 정교',  value: 80 },
]

const QUALITY_MODES: { label: string; value: QualityMode; hint: string }[] = [
  { label: 'Sharp',   value: 'sharp',   hint: '플랫 컬러 — 선명한 경계선' },
  { label: 'Smooth',  value: 'smooth',  hint: '디더링 — 부드러운 그라데이션' },
  { label: 'Vibrant', value: 'vibrant', hint: '채도 강화 — 풍부하고 선명한 색감' },
]

const SEP_LEVELS: { label: string; value: SepLevel; hint: string }[] = [
  { label: 'OFF',   value: 'off',    hint: '유사색 분리 OFF' },
  { label: '약하게', value: 'weak',   hint: 'ΔE < 8 보정' },
  { label: '보통',  value: 'medium', hint: 'ΔE < 15 보정' },
  { label: '강하게', value: 'strong', hint: 'ΔE < 25 보정' },
]

const DISPLAY_MODES: { label: string; value: DisplayMode; icon: React.ReactNode }[] = [
  { label: '컬러',   value: 'color',  icon: <ColorIcon /> },
  { label: '기호',   value: 'symbol', icon: <SymbolIcon /> },
  { label: '혼합',   value: 'mixed',  icon: <MixedIcon /> },
]

export default function SettingsPanel({
  settings, onChange, onGenerate, isGenerating, hasImage,
}: SettingsPanelProps) {
  const [preset, setPreset] = useState<SizePrefixPreset>('100x100')

  function handlePreset(v: SizePrefixPreset) {
    setPreset(v)
    const p = PRESETS.find(p => p.value === v)
    if (p && v !== 'custom') {
      onChange({ ...settings, width: p.w, height: p.h })
    }
  }

  return (
    <aside className="bg-linen-sidebar border-r border-linen-300/20 overflow-y-auto max-h-full scrollbar-linen">
      {/* Header */}
      <div className="px-5 py-4 border-b border-linen-300/18">
        <h2 className="font-cormorant text-[15px] text-warm-600 tracking-wide flex items-center gap-2">
          <SliderIcon />
          도안 설정
        </h2>
      </div>

      {/* Size */}
      <Section label="도안 크기">
        <label className="form-lbl">프리셋</label>
        <select
          className="input-linen mb-2"
          value={preset}
          onChange={e => handlePreset(e.target.value as SizePrefixPreset)}
        >
          {PRESETS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {preset === 'custom' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="form-lbl">가로 (칸)</label>
              <input type="number" className="input-linen" min={10} max={500}
                     value={settings.width}
                     onChange={e => onChange({ ...settings, width: +e.target.value })} />
            </div>
            <div>
              <label className="form-lbl">세로 (칸)</label>
              <input type="number" className="input-linen" min={10} max={500}
                     value={settings.height}
                     onChange={e => onChange({ ...settings, height: +e.target.value })} />
            </div>
          </div>
        )}
      </Section>

      {/* Colors */}
      <Section label="색상 설정">
        <div className="mb-2">
          <label className="form-lbl">실 브랜드</label>
          <select className="input-linen">
            <option>DMC</option>
            <option disabled>Anchor (준비 중)</option>
          </select>
        </div>
        <div>
          <label className="form-lbl">최대 색상 수</label>
          <select className="input-linen"
                  value={settings.colorCount}
                  onChange={e => onChange({ ...settings, colorCount: +e.target.value })}>
            {COLOR_COUNTS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </Section>

      {/* Quality mode */}
      <Section label="렌더링 품질">
        <p className="text-[10px] text-warm-400 font-light leading-relaxed mb-2.5">
          색감 표현 방식과<br />디더링 알고리즘을 선택합니다
        </p>
        <div className="flex gap-1 mb-2">
          {QUALITY_MODES.map(q => (
            <button
              key={q.value}
              onClick={() => onChange({ ...settings, qualityMode: q.value })}
              className={`flex-1 py-1.5 text-[10px] rounded-chip border cursor-pointer
                         transition-all duration-150 font-noto tracking-wide
                         ${settings.qualityMode === q.value
                           ? 'bg-warm-600 text-linen-50 border-warm-600'
                           : 'bg-linen-50/60 text-warm-400 border-linen-300/35 hover:bg-linen-100/70'
                         }`}
            >
              {q.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-sage-400 font-light">
          {QUALITY_MODES.find(q => q.value === settings.qualityMode)?.hint}
        </p>
      </Section>

      {/* Separation */}
      <Section label="유사색 자동 분리">
        <p className="text-[10px] text-warm-400 font-light leading-relaxed mb-2.5">
          인접 유사색을 자동 보정해<br />작업 난이도를 낮춥니다
        </p>
        <div className="flex gap-1 mb-2">
          {SEP_LEVELS.map(s => (
            <button
              key={s.value}
              onClick={() => onChange({ ...settings, sepLevel: s.value })}
              className={`flex-1 py-1.5 text-[10px] rounded-chip border cursor-pointer
                         transition-all duration-150 font-noto tracking-wide
                         ${settings.sepLevel === s.value
                           ? 'bg-warm-600 text-linen-50 border-warm-600'
                           : 'bg-linen-50/60 text-warm-400 border-linen-300/35 hover:bg-linen-100/70'
                         }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-sage-400 font-light">
          {SEP_LEVELS.find(s => s.value === settings.sepLevel)?.hint}
        </p>
      </Section>

      {/* Display mode */}
      <Section label="표시 모드">
        <div className="grid grid-cols-3 gap-1.5">
          {DISPLAY_MODES.map(m => (
            <button
              key={m.value}
              onClick={() => onChange({ ...settings, mode: m.value })}
              className={`py-2 px-1 text-[9px] rounded-[10px] border cursor-pointer
                         flex flex-col items-center gap-1 transition-all duration-150
                         font-noto leading-snug
                         ${settings.mode === m.value
                           ? 'bg-sage-400/15 border-sage-400/35 text-sage-500'
                           : 'bg-linen-50/60 border-linen-300/35 text-warm-400 hover:bg-linen-100/50'
                         }`}
            >
              <span className={settings.mode === m.value ? 'text-sage-500' : 'text-warm-400'}>
                {m.icon}
              </span>
              {m.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Generate button */}
      <div className="px-4 py-4">
        <button
          className="btn-primary w-full"
          onClick={onGenerate}
          disabled={!hasImage || isGenerating}
        >
          {isGenerating ? (
            <>
              <SpinIcon />
              생성 중...
            </>
          ) : (
            <>
              <WandIcon />
              도안 생성
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-[18px] py-3.5 border-b border-linen-300/12">
      <p className="sec-label">{label}</p>
      {children}
    </div>
  )
}

// ── Tiny inline SVG icons ─────────────────────────────────────────────────────
function SliderIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="#A8B2A1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="6" r="2" fill="#A8B2A1" stroke="none"/>
      <circle cx="15" cy="12" r="2" fill="#A8B2A1" stroke="none"/>
      <circle cx="9" cy="18" r="2" fill="#A8B2A1" stroke="none"/>
    </svg>
  )
}

function ColorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"/>
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"/>
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"/>
    </svg>
  )
}

function SymbolIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/>
      <line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  )
}

function MixedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/>
      <rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>
    </svg>
  )
}

function WandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4V2m0 14v-2M8 9H2m14 0h-2m-.6-3.6L12 4m1.4 7.4L12 13M5.6 5.6 4 4"/><line x1="4" y1="20" x2="14" y2="10"/>
    </svg>
  )
}

function SpinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
         style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}

// useState import
import { useState } from 'react'
