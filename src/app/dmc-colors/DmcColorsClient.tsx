'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { DMC_COLORS } from '@/lib/dmc/database'
import { deltaE, contrastColor } from '@/lib/color/lab'
import type { DmcColor } from '@/types'

// ── Color group helpers ───────────────────────────────────────────────────────

type GroupId = 'all' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'brown' | 'neutral'

const GROUPS: { id: GroupId; label: string; dot: string }[] = [
  { id: 'all',     label: '전체',       dot: '#A8B2A1' },
  { id: 'red',     label: '빨강·핑크',  dot: '#D85060' },
  { id: 'orange',  label: '주황·피치',  dot: '#E87828' },
  { id: 'yellow',  label: '노랑·골드',  dot: '#F0C020' },
  { id: 'green',   label: '초록',       dot: '#409858' },
  { id: 'blue',    label: '파랑·청록',  dot: '#3878B0' },
  { id: 'purple',  label: '보라·라벤더', dot: '#8050A8' },
  { id: 'brown',   label: '브라운',     dot: '#906040' },
  { id: 'neutral', label: '중성·무채색', dot: '#A8A8A0' },
]

function getColorGroup(hex: string, name: string): GroupId {
  const n = name.toLowerCase()

  if (/gray|grey|white|black|blanc|ecru|cream|pearl|silver|snow|winter white/.test(n)) return 'neutral'
  if (/\btan\b|brown|mocha|coffee|mahogany|cocoa|hazelnut|drab|beige brown|khaki|rosewood/.test(n)) return 'brown'
  if (/beige gray|beige beige|pewter|ash gray|beaver gray|shell gray|brown gray/.test(n)) return 'neutral'
  if (/raspberry|garnet|cranberry|dusty rose|shell pink|geranium|melon|mauve|antique mauve/.test(n)) return 'red'
  if (/\bred\b|rose|pink|salmon|coral|carnation/.test(n)) return 'red'
  if (/orange|pumpkin|spice|terra cotta|tawny|apricot|tangerine|peach|copper|burnt|autumn gold/.test(n)) return 'orange'
  if (/straw|topaz|gold|lemon|yellow|canary|mustard|chartreuse|old gold/.test(n)) return 'yellow'
  if (/green|jade|emerald|pistachio|moss|fern|avocado|nile|parrot|hunter|celadon|teal|forest/.test(n)) return 'green'
  if (/blue|navy|wedgwood|delft|cornflower|sky|turquoise|aquamarine|sea green|electric|peacock/.test(n)) return 'blue'
  if (/lavender blue/.test(n)) return 'blue'
  if (/violet|purple|lavender|plum|grape|antique violet/.test(n)) return 'purple'

  // Fallback: hue-based
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : l > 0.5 ? d / (2 - max - min) : d / (max + min)

  if (s < 0.1 || l > 0.92 || l < 0.08) return 'neutral'

  let h = 0
  if (d > 0) {
    if (max === r) h = (((g - b) / d) % 6) * 60
    else if (max === g) h = ((b - r) / d + 2) * 60
    else h = ((r - g) / d + 4) * 60
    if (h < 0) h += 360
  }

  if (h < 30 || h >= 330) return 'red'
  if (h < 60) return s < 0.55 && l < 0.55 ? 'brown' : 'orange'
  if (h < 80) return 'yellow'
  if (h < 165) return 'green'
  if (h < 255) return 'blue'
  return 'purple'
}

// Pre-compute groups once
const COLORS_WITH_GROUP = DMC_COLORS.map(c => ({
  ...c,
  group: getColorGroup(c.hex, c.name),
}))

const POPULAR_IDS = ['blanc', 'ecru', '310', '321', '666', '740', '744', '700', '336', '553', '433', '899']
const POPULAR_COLORS = POPULAR_IDS
  .map(id => COLORS_WITH_GROUP.find(c => c.id === id))
  .filter(Boolean) as typeof COLORS_WITH_GROUP

// ── Component ─────────────────────────────────────────────────────────────────

export default function DmcColorsClient() {
  const [search, setSearch]               = useState('')
  const [activeGroup, setActiveGroup]     = useState<GroupId>('all')
  const [selectedColor, setSelectedColor] = useState<typeof COLORS_WITH_GROUP[0] | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return COLORS_WITH_GROUP.filter(c => {
      const matchGroup = activeGroup === 'all' || c.group === activeGroup
      if (!matchGroup) return false
      if (!q) return true
      return c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
    })
  }, [search, activeGroup])

  const similarColors = useMemo(() => {
    if (!selectedColor) return []
    return COLORS_WITH_GROUP
      .filter(c => c.id !== selectedColor.id)
      .map(c => ({ ...c, dist: deltaE(selectedColor.lab, c.lab) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 8)
  }, [selectedColor])

  const handleCardClick = useCallback((c: typeof COLORS_WITH_GROUP[0]) => {
    setSelectedColor(c)
  }, [])

  const closeModal = useCallback(() => setSelectedColor(null), [])

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 pt-10 pb-8 border-b border-linen-300/20">
        <nav className="flex items-center gap-2 mb-5 text-[11px] text-warm-400 font-light">
          <Link href="/" className="hover:text-warm-600 transition-colors">홈</Link>
          <span>/</span>
          <span className="text-warm-600">DMC 색상표</span>
        </nav>

        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light">DMC Color Chart</span>
          <div className="h-px w-10 bg-sage-400/50" />
        </div>
        <h1 className="font-playfair text-[34px] md:text-[40px] text-warm-700 mb-3 tracking-[-0.01em]">
          DMC 실 색상표
        </h1>
        <p className="text-[14px] text-warm-500 font-light leading-relaxed max-w-xl">
          DMC 자수실 전체 색상을 번호·이름으로 검색하고 색상군별로 탐색하세요.
          색상 카드를 클릭하면 HEX·RGB 값과 유사색을 확인할 수 있습니다.
        </p>

        {/* About DMC */}
        <div className="mt-6 p-5 bg-linen-50/80 border border-linen-300/20 rounded-card max-w-2xl">
          <p className="text-[12px] text-warm-500 font-light leading-relaxed">
            <strong className="text-warm-600">DMC(Dollfus-Mieg &amp; Compagnie)</strong>는 1746년 프랑스에서 창립된 세계 최대 자수실 브랜드입니다.
            전 세계 동일한 번호 체계를 사용하기 때문에 어느 나라에서 구매해도 같은 색상을 얻을 수 있습니다.
            현재 약 500가지 이상의 색상이 출시되어 있으며, 십자수·자수·퀼팅 등 다양한 공예에 사용됩니다.
          </p>
        </div>
      </div>

      {/* ── Popular colors ──────────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 pt-8 pb-6 border-b border-linen-300/15">
        <p className="text-[10px] uppercase tracking-[0.14em] text-sage-400 mb-4">자주 쓰는 인기 색상</p>
        <div className="flex flex-wrap gap-3">
          {POPULAR_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => handleCardClick(c)}
              className="flex items-center gap-2.5 px-3 py-2
                         bg-linen-50/80 border border-linen-300/25 rounded-btn
                         hover:border-linen-300/50 hover:shadow-linen
                         transition-all duration-150 cursor-pointer"
            >
              <span
                className="w-5 h-5 rounded-full flex-shrink-0 border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-[12px] text-warm-600 font-light">
                {c.id === 'blanc' || c.id === 'ecru' ? c.id : `DMC ${c.id}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Beginner set ────────────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 pt-6 pb-6 border-b border-linen-300/15
                      bg-gradient-to-r from-sage-400/5 to-transparent">
        <p className="text-[10px] uppercase tracking-[0.14em] text-sage-400 mb-3">십자수 초보 추천 기본 세트</p>
        <p className="text-[12px] text-warm-400 font-light mb-4 max-w-lg">
          처음 십자수를 시작할 때 갖춰두면 유용한 색상 조합입니다.
          대부분의 입문 도안을 커버할 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(['blanc', 'ecru', '310', '321', '666', '415', '318', '317', '700', '703', '336', '797', '553', '209', '433', '436', '898', '3371', '760', '957'].map(id => {
            const c = COLORS_WITH_GROUP.find(x => x.id === id)
            if (!c) return null
            return (
              <button
                key={c.id}
                onClick={() => handleCardClick(c)}
                title={`DMC ${c.id} — ${c.name}`}
                className="w-8 h-8 rounded-full border-2 border-white/80 shadow-sm
                           hover:scale-125 transition-transform duration-150 cursor-pointer"
                style={{ backgroundColor: c.hex }}
              />
            )
          }))}
        </div>
      </div>

      {/* ── Sticky search + filter ──────────────────────────────────────────── */}
      <div className="sticky top-[68px] z-40 bg-linen-50/95 backdrop-blur-md
                      border-b border-linen-300/20 px-6 md:px-12 py-3 shadow-sm">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="번호 또는 색상 이름으로 검색 (예: 310, Red, Sage...)"
          className="w-full max-w-md px-4 py-2 text-[13px] font-light text-warm-600
                     bg-linen-50 border border-linen-300/40 rounded-chip
                     outline-none focus:border-sage-400/60 focus:ring-2 focus:ring-sage-400/20
                     placeholder:text-warm-400 mb-3 font-noto"
        />

        {/* Group tabs */}
        <div className="flex flex-wrap gap-1.5">
          {GROUPS.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-light
                         rounded-pill border transition-all duration-150 cursor-pointer
                         ${activeGroup === g.id
                           ? 'bg-warm-600 text-linen-50 border-warm-600'
                           : 'bg-linen-50 text-warm-500 border-linen-300/30 hover:border-warm-400/40'
                         }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: g.dot }}
              />
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Color grid ──────────────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 py-6">
        <p className="text-[11px] text-warm-400 font-light mb-4">
          {filtered.length.toLocaleString()}가지 색상
        </p>
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-warm-400 font-light text-[14px]">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {filtered.map(c => (
              <ColorCard key={c.id} color={c} onClick={handleCardClick} />
            ))}
          </div>
        )}
      </div>

      {/* ── Color tips ──────────────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 pt-4 pb-12 border-t border-linen-300/20">
        <p className="text-[10px] uppercase tracking-[0.14em] text-sage-400 mb-5 mt-8">색상 조합 팁</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          {[
            {
              title: '유사색으로 깊이감 연출',
              desc: '같은 색상군의 밝은 색과 어두운 색을 함께 사용하면 자연스러운 그러데이션과 입체감을 표현할 수 있습니다. 예: 703 → 701 → 699',
            },
            {
              title: '중성색으로 조화',
              desc: 'ecru, blanc, 415(연회색), 644(베이지 그레이)는 어떤 색상과도 잘 어울리는 중간자 역할을 합니다. 배경이나 하이라이트에 활용하세요.',
            },
            {
              title: '윤곽선에 310 또는 3371',
              desc: '310(검정)은 강한 윤곽선에, 3371(블랙 브라운)은 부드러운 윤곽 표현에 적합합니다. 어두운 색상 옆에는 3371이 더 자연스러운 경우가 많습니다.',
            },
          ].map(tip => (
            <div key={tip.title} className="p-5 bg-linen-50/80 border border-linen-300/20 rounded-card">
              <h3 className="font-cormorant text-[15px] text-warm-600 mb-2">{tip.title}</h3>
              <p className="text-[12px] text-warm-400 font-light leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 text-[13px] text-sage-500
                       hover:text-sage-600 transition-colors font-light no-underline"
          >
            ← 십자수 입문 가이드 보기
          </Link>
        </div>
      </div>

      <footer className="border-t border-linen-300/20 py-8 text-center">
        <p className="text-[11px] text-warm-400 font-light">
          © 2025 Cotton &amp; Bloom Studio —{' '}
          <Link href="/guide" className="hover:text-warm-600 transition-colors">가이드</Link>
          {' · '}
          <Link href="/" className="hover:text-warm-600 transition-colors">도안 만들기</Link>
        </p>
      </footer>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {selectedColor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(54,50,46,0.55)' }}
          onClick={closeModal}
        >
          <div
            className="bg-linen-50 rounded-panel w-full max-w-sm shadow-linen-lg
                       overflow-hidden animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Color swatch */}
            <div
              className="h-40 w-full flex items-end p-4"
              style={{ backgroundColor: selectedColor.hex }}
            >
              <span
                className="text-[11px] px-2.5 py-1 rounded-pill border"
                style={{
                  color: contrastColor(selectedColor.hex),
                  borderColor: contrastColor(selectedColor.hex) === '#ffffff' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
                  backgroundColor: contrastColor(selectedColor.hex) === '#ffffff' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.35)',
                }}
              >
                {selectedColor.id === 'blanc' || selectedColor.id === 'ecru' || selectedColor.id === 'b5200'
                  ? selectedColor.id
                  : `DMC ${selectedColor.id}`}
              </span>
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-cormorant text-[22px] text-warm-700 leading-snug">
                    {selectedColor.name}
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-sage-400 mt-0.5">
                    {GROUPS.find(g => g.id === selectedColor.group)?.label ?? ''}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-warm-400 hover:text-warm-600 transition-colors
                             text-[18px] leading-none p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Color values */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <ColorValue label="HEX" value={selectedColor.hex.toUpperCase()} />
                <ColorValue label="R" value={String(selectedColor.rgb[0])} />
                <ColorValue label="G" value={String(selectedColor.rgb[1])} />
                <ColorValue label="B" value={String(selectedColor.rgb[2])} />
                <ColorValue label="L*" value={selectedColor.lab[0].toFixed(1)} />
                <ColorValue label="a*" value={selectedColor.lab[1].toFixed(1)} />
              </div>

              {/* Similar colors */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-warm-400 mb-2.5">유사색</p>
                <div className="flex flex-wrap gap-1.5">
                  {similarColors.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedColor(c)}
                      title={`DMC ${c.id} — ${c.name}`}
                      className="flex flex-col items-center gap-1 cursor-pointer group"
                    >
                      <span
                        className="w-8 h-8 rounded-full border-2 border-white/80 shadow-sm
                                   group-hover:scale-110 transition-transform duration-150"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[9px] text-warm-400">{c.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={closeModal}
                className="mt-5 w-full py-2.5 text-[12px] text-warm-500 font-light
                           border border-linen-300/30 rounded-btn
                           hover:bg-linen-100/50 transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ColorCard({
  color,
  onClick,
}: {
  color: typeof COLORS_WITH_GROUP[0]
  onClick: (c: typeof COLORS_WITH_GROUP[0]) => void
}) {
  return (
    <button
      onClick={() => onClick(color)}
      className="group flex flex-col overflow-hidden rounded-card border border-linen-300/20
                 hover:border-linen-300/50 hover:shadow-linen hover:-translate-y-0.5
                 transition-all duration-150 cursor-pointer bg-linen-50/80 text-left w-full"
    >
      {/* Swatch */}
      <div
        className="w-full aspect-square group-hover:scale-105 transition-transform duration-200 origin-top"
        style={{ backgroundColor: color.hex }}
      />
      {/* Info */}
      <div className="px-2 py-2">
        <p className="text-[10px] text-sage-500 font-normal tabular-nums leading-none mb-0.5">
          {color.id === 'blanc' || color.id === 'ecru' || color.id === 'b5200'
            ? color.id
            : color.id}
        </p>
        <p className="text-[10px] text-warm-500 font-light leading-tight truncate">
          {color.name}
        </p>
        <p className="text-[9px] text-warm-400/80 font-light mt-0.5 tracking-wide">
          {color.hex.toUpperCase()}
        </p>
      </div>
    </button>
  )
}

function ColorValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-linen-100/50 border border-linen-300/20 rounded-chip px-2 py-1.5 text-center">
      <p className="text-[9px] uppercase tracking-wider text-sage-400 mb-0.5">{label}</p>
      <p className="text-[12px] text-warm-600 font-normal tabular-nums">{value}</p>
    </div>
  )
}
