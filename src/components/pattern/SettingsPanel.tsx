'use client'

import { useState } from 'react'
import { useLang } from '@/lib/i18n/context'
import type {
  PatternSettings, SepLevel, DisplayMode, SizePrefixPreset,
  QualityMode, AspectMode, DitheringMode,
} from '@/types'
import AdUnit from '@/components/ui/AdUnit'

interface SettingsPanelProps {
  settings:     PatternSettings
  onChange:     (s: PatternSettings) => void
  onGenerate:   () => void
  isGenerating: boolean
  hasImage:     boolean
}

const MAX_CELLS = 90_000   // 300×300 — safe upper bound

export default function SettingsPanel({
  settings, onChange, onGenerate, isGenerating, hasImage,
}: SettingsPanelProps) {
  const { t } = useLang()
  const PRESETS_DEFS = [
    { label: '50 × 50',   value: '50x50'  as SizePrefixPreset, w: 50,  h: 50  },
    { label: '100 × 100', value: '100x100' as SizePrefixPreset, w: 100, h: 100 },
    { label: '150 × 200', value: '150x200' as SizePrefixPreset, w: 150, h: 200 },
    { label: '200 × 200', value: '200x200' as SizePrefixPreset, w: 200, h: 200 },
    { label: t.settings.size.custom, value: 'custom' as SizePrefixPreset, w: 0, h: 0 },
  ]
  const COLOR_COUNTS_DEFS = [
    { label: t.settings.color.counts[0], value: 20 },
    { label: t.settings.color.counts[1], value: 40 },
    { label: t.settings.color.counts[2], value: 60 },
    { label: t.settings.color.counts[3], value: 80 },
  ]
  const QUALITY_MODES_DEFS = [
    { label: 'Fast',     value: 'fast'     as QualityMode, hint: t.settings.quality.fast.hint },
    { label: 'Balanced', value: 'balanced' as QualityMode, hint: t.settings.quality.balanced.hint },
    { label: 'HQ',       value: 'hq'       as QualityMode, hint: t.settings.quality.hq.hint },
  ]
  const ASPECT_MODES_DEFS = [
    { label: t.settings.aspect.fit.label,     value: 'fit'     as AspectMode, hint: t.settings.aspect.fit.hint },
    { label: t.settings.aspect.crop.label,    value: 'crop'    as AspectMode, hint: t.settings.aspect.crop.hint },
    { label: t.settings.aspect.stretch.label, value: 'stretch' as AspectMode, hint: t.settings.aspect.stretch.hint },
  ]
  const DITHERING_MODES_DEFS = [
    { label: 'None',     value: 'none'     as DitheringMode, hint: t.settings.dither.none.hint },
    { label: 'Floyd',    value: 'floyd'    as DitheringMode, hint: t.settings.dither.floyd.hint },
    { label: 'Atkinson', value: 'atkinson' as DitheringMode, hint: t.settings.dither.atkinson.hint },
    { label: 'Ordered',  value: 'ordered'  as DitheringMode, hint: t.settings.dither.ordered.hint },
  ]
  const SEP_LEVELS_DEFS = [
    { label: t.settings.sep.off.label,    value: 'off'    as SepLevel, hint: t.settings.sep.off.hint },
    { label: t.settings.sep.weak.label,   value: 'weak'   as SepLevel, hint: t.settings.sep.weak.hint },
    { label: t.settings.sep.medium.label, value: 'medium' as SepLevel, hint: t.settings.sep.medium.hint },
    { label: t.settings.sep.strong.label, value: 'strong' as SepLevel, hint: t.settings.sep.strong.hint },
  ]
  const DISPLAY_MODES_DEFS = [
    { label: t.settings.display.color,  value: 'color'  as DisplayMode, icon: <ColorIcon /> },
    { label: t.settings.display.symbol, value: 'symbol' as DisplayMode, icon: <SymbolIcon /> },
    { label: t.settings.display.mixed,  value: 'mixed'  as DisplayMode, icon: <MixedIcon /> },
  ]

  const [preset, setPreset] = useState<SizePrefixPreset>('100x100')

  const totalCells = settings.width * settings.height
  const overLimit  = totalCells > MAX_CELLS

  function handlePreset(v: SizePrefixPreset) {
    setPreset(v)
    const p = PRESETS_DEFS.find(p => p.value === v)
    if (p && v !== 'custom') {
      onChange({ ...settings, width: p.w, height: p.h })
    }
  }

  return (
    <aside className="bg-linen-sidebar border-r border-linen-300/20 overflow-y-auto scrollbar-linen" style={{ maxHeight: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-linen-300/18">
        <h2 className="font-cormorant text-[15px] text-warm-600 tracking-wide flex items-center gap-2">
          <SliderIcon />
          {t.settings.panelTitle}
        </h2>
      </div>

      {/* Size */}
      <Section label={t.settings.size.section}>
        <label className="form-lbl">{t.settings.size.preset}</label>
        <select
          className="input-linen mb-2"
          value={preset}
          onChange={e => handlePreset(e.target.value as SizePrefixPreset)}
        >
          {PRESETS_DEFS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {preset === 'custom' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="form-lbl">{t.settings.size.width}</label>
                <input type="number"
                       className={`input-linen ${overLimit ? 'border-red-400 focus:border-red-400' : ''}`}
                       min={10} max={300}
                       value={settings.width}
                       onChange={e => onChange({ ...settings, width: +e.target.value })} />
              </div>
              <div>
                <label className="form-lbl">{t.settings.size.height}</label>
                <input type="number"
                       className={`input-linen ${overLimit ? 'border-red-400 focus:border-red-400' : ''}`}
                       min={10} max={300}
                       value={settings.height}
                       onChange={e => onChange({ ...settings, height: +e.target.value })} />
              </div>
            </div>
            {overLimit && (
              <p className="mt-1.5 text-[10px] text-red-400 leading-snug">
                {t.settings.size.overLimit}
              </p>
            )}
          </>
        )}
      </Section>

      {/* Aspect mode */}
      <Section label={t.settings.aspect.section}>
        <p className="text-[10px] text-warm-400 font-light leading-relaxed mb-2.5">
          {t.settings.aspect.desc.split('\n').map((ln, i) => (<span key={i}>{ln}{i===0&&<br/>}</span>))}
        </p>
        <div className="flex gap-1 mb-2">
          {ASPECT_MODES_DEFS.map(a => (
            <button
              key={a.value}
              onClick={() => onChange({ ...settings, aspectMode: a.value })}
              className={`flex-1 py-1.5 text-[10px] rounded-chip border cursor-pointer
                         transition-all duration-150 font-noto tracking-wide
                         ${settings.aspectMode === a.value
                           ? 'bg-warm-600 text-linen-50 border-warm-600'
                           : 'bg-linen-50/60 text-warm-400 border-linen-300/35 hover:bg-linen-100/70'
                         }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-sage-400 font-light">
          {ASPECT_MODES_DEFS.find(a => a.value === settings.aspectMode)?.hint}
        </p>
      </Section>

      {/* Image adjustments */}
      <Section label={t.settings.adjust.section}>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-warm-400">☾</span>
              <span className="form-lbl mb-0">{t.settings.adjust.brightness}</span>
              <span className="text-[13px] text-warm-500">☀</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-mono ${settings.brightness !== 0 ? 'text-sage-500' : 'text-warm-400'}`}>
                {settings.brightness > 0 ? `+${settings.brightness}` : settings.brightness}
              </span>
              {settings.brightness !== 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sage-400/12 border border-sage-400/20 text-sage-500 tracking-wide cursor-pointer"
                      onClick={e => { e.stopPropagation(); onChange({ ...settings, brightness: 0 }) }}>
                  {t.settings.adjust.defaultBadge}
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <input
              type="range" min={-100} max={100} step={1}
              value={settings.brightness}
              style={{ touchAction: 'none' }}
              className={`w-full h-1 rounded-full appearance-none cursor-pointer
                         ${settings.brightness !== 0 ? 'accent-sage-500' : 'accent-warm-400'}`}
              onChange={e => onChange({ ...settings, brightness: +e.target.value })}
            />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                             w-px h-2 bg-warm-400/40 pointer-events-none" />
          </div>
        </div>

        <div className="mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-warm-400">○</span>
              <span className="form-lbl mb-0">{t.settings.adjust.contrast}</span>
              <span className="text-[13px] text-warm-500">◑</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-mono ${settings.contrast !== 0 ? 'text-sage-500' : 'text-warm-400'}`}>
                {settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}
              </span>
              {settings.contrast !== 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sage-400/12 border border-sage-400/20 text-sage-500 tracking-wide cursor-pointer"
                      onClick={e => { e.stopPropagation(); onChange({ ...settings, contrast: 0 }) }}>
                  {t.settings.adjust.defaultBadge}
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <input
              type="range" min={-100} max={100} step={1}
              value={settings.contrast}
              style={{ touchAction: 'none' }}
              className={`w-full h-1 rounded-full appearance-none cursor-pointer
                         ${settings.contrast !== 0 ? 'accent-sage-500' : 'accent-warm-400'}`}
              onChange={e => onChange({ ...settings, contrast: +e.target.value })}
            />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                             w-px h-2 bg-warm-400/40 pointer-events-none" />
          </div>
        </div>

        {(settings.brightness !== 0 || settings.contrast !== 0) && (
          <button
            className="mt-1 w-full py-1 text-[10px] text-warm-400 border border-linen-300/30
                       rounded-chip hover:bg-linen-100/50 transition-all duration-150 cursor-pointer"
            onClick={() => onChange({ ...settings, brightness: 0, contrast: 0 })}
          >
            {t.settings.adjust.reset}
          </button>
        )}
      </Section>

      {/* Colors */}
      <Section label={t.settings.color.section}>
        <div className="mb-2">
          <label className="form-lbl">{t.settings.color.brand}</label>
          <select className="input-linen">
            <option>DMC</option>
            <option disabled>{t.settings.color.anchorHint}</option>
          </select>
        </div>
        <div>
          <label className="form-lbl">{t.settings.color.count}</label>
          <select className="input-linen"
                  value={settings.colorCount}
                  onChange={e => onChange({ ...settings, colorCount: +e.target.value })}>
            {COLOR_COUNTS_DEFS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </Section>

      {/* Quality mode */}
      <Section label={t.settings.quality.section}>
        <p className="text-[10px] text-warm-400 font-light leading-relaxed mb-2.5">
          {t.settings.quality.desc.split('\n').map((ln, i) => (<span key={i}>{ln}{i===0&&<br/>}</span>))}
        </p>
        <div className="flex gap-1 mb-2">
          {QUALITY_MODES_DEFS.map(q => (
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
          {QUALITY_MODES_DEFS.find(q => q.value === settings.qualityMode)?.hint}
        </p>
      </Section>

      {/* Dithering mode */}
      <Section label={t.settings.dither.section}>
        <p className="text-[10px] text-warm-400 font-light leading-relaxed mb-2.5">
          {t.settings.dither.desc.split('\n').map((ln, i) => (<span key={i}>{ln}{i===0&&<br/>}</span>))}
        </p>
        <div className="flex gap-1 mb-2">
          {DITHERING_MODES_DEFS.map(d => (
            <button
              key={d.value}
              onClick={() => onChange({ ...settings, ditheringMode: d.value })}
              className={`flex-1 py-1.5 text-[10px] rounded-chip border cursor-pointer
                         transition-all duration-150 font-noto tracking-wide
                         ${settings.ditheringMode === d.value
                           ? 'bg-warm-600 text-linen-50 border-warm-600'
                           : 'bg-linen-50/60 text-warm-400 border-linen-300/35 hover:bg-linen-100/70'
                         }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-sage-400 font-light">
          {DITHERING_MODES_DEFS.find(d => d.value === settings.ditheringMode)?.hint}
        </p>
      </Section>

      {/* Separation */}
      <Section label={t.settings.sep.section}>
        <p className="text-[10px] text-warm-400 font-light leading-relaxed mb-2.5">
          {t.settings.sep.desc.split('\n').map((ln, i) => (<span key={i}>{ln}{i===0&&<br/>}</span>))}
        </p>
        <div className="flex gap-1 mb-2">
          {SEP_LEVELS_DEFS.map(s => (
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
          {SEP_LEVELS_DEFS.find(s => s.value === settings.sepLevel)?.hint}
        </p>
      </Section>

      {/* Display mode */}
      <Section label={t.settings.display.section}>
        <div className="grid grid-cols-3 gap-1.5">
          {DISPLAY_MODES_DEFS.map(m => (
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
          disabled={!hasImage || isGenerating || overLimit}
        >
          {isGenerating ? (
            <>
              <SpinIcon />
              {t.settings.generating}
            </>
          ) : (
            <>
              <WandIcon />
              {t.settings.generate}
            </>
          )}
        </button>
      </div>

      {/* stitch-sidebar-bottom */}
      <AdUnit slot="1955905061" wrapperStyle={{ padding: '0 16px 16px', marginTop: 8 }} />
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
