'use client'

import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { useLang } from '@/lib/i18n/context'
import { useLocalePath } from '@/hooks/useLocalePath'

const IMG_ASPECT_MODES = [
  { value: 'fit',     img: '/gallery/aspect/freeset(300x300)-DMC-20-fast-none-off-color-fit.png' },
  { value: 'crop',    img: '/gallery/aspect/freeset(300x300)-DMC-20-fast-none-off-color-crop.png' },
  { value: 'stretch', img: '/gallery/aspect/freeset(300x300)-DMC-20-fast-none-off-color-stretch.png' },
]
const IMG_COLOR_COUNTS = [
  { value: 20, img: '/gallery/color-count/freeset(600x315)-fit-DMC-fast-none-off-color-20.png' },
  { value: 40, img: '/gallery/color-count/freeset(600x315)-fit-DMC-fast-none-off-color-40.png' },
  { value: 60, img: '/gallery/color-count/freeset(600x315)-fit-DMC-fast-none-off-color-60.png' },
  { value: 80, img: '/gallery/color-count/freeset(600x315)-fit-DMC-fast-none-off-color-80.png' },
]
const IMG_QUALITY_MODES = [
  { value: 'fast',     img: '/gallery/quality/freeset(600x315)-fit-DMC-20-none-off-color-fast.png' },
  { value: 'balanced', img: '/gallery/quality/freeset(600x315)-fit-DMC-20-none-off-color-balanced.png' },
  { value: 'hq',       img: '/gallery/quality/freeset(600x315)-fit-DMC-20-none-off-color-hq.png' },
]
const IMG_DITHERING_MODES = [
  { value: 'none',     img: '/gallery/dithering/freeset(600x315)-fit-DMC-20-fast-off-color-none.png' },
  { value: 'floyd',    img: '/gallery/dithering/freeset(600x315)-fit-DMC-20-fast-off-color-floyd.png' },
  { value: 'atkinson', img: '/gallery/dithering/freeset(600x315)-fit-DMC-20-fast-off-color-atkinson.png' },
  { value: 'ordered',  img: '/gallery/dithering/freeset(600x315)-fit-DMC-20-fast-off-color-ordered.png' },
]
const IMG_SEP_LEVELS = [
  { value: 'off',    img: '/gallery/sep/freeset(600x315)-fit-DMC-20-fast-none-color-off.png' },
  { value: 'weak',   img: '/gallery/sep/freeset(600x315)-fit-DMC-20-fast-none-color-mild.png' },
  { value: 'medium', img: '/gallery/sep/freeset(600x315)-fit-DMC-20-fast-none-color-normal.png' },
  { value: 'strong', img: '/gallery/sep/freeset(600x315)-fit-DMC-20-fast-none-color-strong.png' },
]
const IMG_DISPLAY_MODES = [
  { value: 'color',  img: '/gallery/display/freeset(600x315)-fit-DMC-20-fast-none-off-color.png' },
  { value: 'symbol', img: '/gallery/display/freeset(600x315)-fit-DMC-20-fast-none-off-symbol.png' },
  { value: 'mixed',  img: '/gallery/display/freeset(600x315)-fit-DMC-20-fast-none-off-combined.png' },
]

export default function GalleryContent() {
  const { t } = useLang()
  const homePath = useLocalePath('/')

  const SECTIONS = [
    {
      id: 'aspect',
      title: t.settings.aspect.section,
      subtitle: t.gallery.sectionSubtitles.aspect,
      items: IMG_ASPECT_MODES.map(({ value, img }, i) => {
        const opts = [t.settings.aspect.fit, t.settings.aspect.crop, t.settings.aspect.stretch]
        return { label: opts[i].label, desc: opts[i].hint, img, value }
      }),
      tag: 'AspectMode',
      square: true,
    },
    {
      id: 'color-count',
      title: t.settings.color.section,
      subtitle: t.gallery.sectionSubtitles.colorCount,
      items: IMG_COLOR_COUNTS.map(({ value, img }, i) => ({
        label: t.settings.color.counts[i].split(' — ')[0],
        desc:  t.settings.color.counts[i],
        img,
        value: String(value),
      })),
      tag: 'colorCount',
      square: false,
    },
    {
      id: 'quality',
      title: t.settings.quality.section,
      subtitle: t.gallery.sectionSubtitles.quality,
      items: IMG_QUALITY_MODES.map(({ value, img }) => {
        const opts: Record<string, { label: string; hint: string }> = {
          fast:     { label: 'Fast',     hint: t.settings.quality.fast.hint },
          balanced: { label: 'Balanced', hint: t.settings.quality.balanced.hint },
          hq:       { label: 'HQ',       hint: t.settings.quality.hq.hint },
        }
        return { label: opts[value].label, desc: opts[value].hint, img, value }
      }),
      tag: 'QualityMode',
      square: false,
    },
    {
      id: 'dithering',
      title: t.settings.dither.section,
      subtitle: t.gallery.sectionSubtitles.dithering,
      items: IMG_DITHERING_MODES.map(({ value, img }) => {
        const opts: Record<string, { label: string; hint: string }> = {
          none:     { label: 'None',     hint: t.settings.dither.none.hint },
          floyd:    { label: 'Floyd',    hint: t.settings.dither.floyd.hint },
          atkinson: { label: 'Atkinson', hint: t.settings.dither.atkinson.hint },
          ordered:  { label: 'Ordered',  hint: t.settings.dither.ordered.hint },
        }
        return { label: opts[value].label, desc: opts[value].hint, img, value }
      }),
      tag: 'DitheringMode',
      square: false,
    },
    {
      id: 'sep',
      title: t.settings.sep.section,
      subtitle: t.gallery.sectionSubtitles.sep,
      items: IMG_SEP_LEVELS.map(({ value, img }) => {
        const opts: Record<string, { label: string; hint: string }> = {
          off:    t.settings.sep.off,
          weak:   t.settings.sep.weak,
          medium: t.settings.sep.medium,
          strong: t.settings.sep.strong,
        }
        return { label: opts[value].label, desc: opts[value].hint, img, value }
      }),
      tag: 'SepLevel',
      square: false,
    },
    {
      id: 'display',
      title: t.settings.display.section,
      subtitle: t.gallery.sectionSubtitles.display,
      items: IMG_DISPLAY_MODES.map(({ value, img }) => ({
        label: value === 'color' ? t.settings.display.color
             : value === 'symbol' ? t.settings.display.symbol
             : t.settings.display.mixed,
        desc:  value === 'color' ? t.settings.display.color
             : value === 'symbol' ? t.settings.display.symbol
             : t.settings.display.mixed,
        img,
        value,
      })),
      tag: 'DisplayMode',
      square: false,
    },
  ]

  const TOTAL = 3 * 4 * 3 * 4 * 4 * 3
  const totalCards = SECTIONS.reduce((s, sec) => s + sec.items.length, 0)

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="px-4 sm:px-9 pb-24">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="py-12 sm:py-16 border-b border-linen-300/20">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light">
              Gallery
            </span>
            <div className="h-px w-10 bg-sage-400/40" />
          </div>
          <h1 className="font-playfair text-[28px] sm:text-[36px] leading-[1.2] text-warm-700 mb-3">
            {t.gallery.heroTitle}
          </h1>
          <p className="font-cormorant text-[16px] italic font-light text-warm-500 max-w-lg leading-relaxed mb-8">
            {t.gallery.heroDesc}
          </p>

          <div className="inline-block bg-linen-50/80 border border-linen-300/25 rounded-panel shadow-linen px-6 py-5">
            <p className="text-[10px] uppercase tracking-wider text-warm-400 mb-3 font-light">
              {t.gallery.combinationLabel}
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {SECTIONS.map((sec, i) => (
                <span key={sec.id} className="flex items-center gap-2">
                  <span className="flex flex-col items-center">
                    <span className="text-[18px] font-playfair text-warm-700 leading-none">
                      {sec.items.length}
                    </span>
                    <span className="text-[9px] text-warm-400 font-light tracking-wide whitespace-nowrap">
                      {sec.title}
                    </span>
                  </span>
                  {i < SECTIONS.length - 1 && (
                    <span className="text-warm-300 text-[18px] font-light">×</span>
                  )}
                </span>
              ))}
              <span className="text-warm-300 text-[18px] font-light">=</span>
              <span className="flex flex-col items-center">
                <span className="text-[28px] font-playfair text-warm-700 leading-none">
                  {TOTAL.toLocaleString()}
                </span>
                <span className="text-[9px] text-warm-400 font-light tracking-wide">
                  {t.gallery.combinationSuffix}
                </span>
              </span>
            </div>
            <p className="text-[10px] text-warm-400 font-light">
              {t.gallery.heroCombinationPrefix}{' '}
              <strong className="text-warm-600 font-normal">{totalCards}</strong>
              {' '}{t.gallery.optionCountSuffix}
            </p>
          </div>
        </div>

        {/* ── Sections ─────────────────────────────────────────────────────── */}
        <div className="space-y-20 pt-16">
          {SECTIONS.map((section, sIdx) => (
            <section key={section.id} id={section.id}>
              <div className="flex items-start justify-between mb-7 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] text-warm-400 font-light tracking-wider">
                      {String(sIdx + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
                    </span>
                    <div className="h-px w-6 bg-linen-300/40" />
                    <code className="text-[9px] bg-sage-400/12 text-sage-500 px-2 py-0.5 rounded-full font-mono tracking-wide">
                      {section.tag}
                    </code>
                  </div>
                  <h2 className="font-cormorant text-[22px] sm:text-[26px] text-warm-700 tracking-wide">
                    {section.title}
                  </h2>
                  <p className="text-[12px] text-warm-400 font-light mt-0.5">{section.subtitle}</p>
                </div>
                <span className="flex-shrink-0 text-[11px] text-warm-300 font-light mt-1 pt-5">
                  {section.items.length} {t.gallery.optionCountSuffix}
                </span>
              </div>

              <div className={`grid gap-5 ${
                section.items.length === 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}>
                {section.items.map((item, iIdx) => (
                  <GalleryCard
                    key={item.value}
                    label={item.label}
                    desc={item.desc}
                    img={item.img}
                    index={iIdx}
                    sectionColor={sIdx}
                    square={section.square}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <div className="mt-24 pt-12 border-t border-linen-300/20 text-center">
          <p className="font-cormorant text-[18px] italic text-warm-500 mb-5 font-light">
            {t.gallery.ctaMessage}
          </p>
          <Link
            href={homePath}
            className="inline-flex items-center gap-2 px-7 py-3 bg-warm-600 text-linen-50
                       text-[12px] rounded-pill hover:bg-warm-500 transition-colors no-underline"
          >
            {t.gallery.ctaButton}
          </Link>
        </div>

      </main>
    </div>
  )
}

const SECTION_ACCENTS = [
  'from-rose-50   to-rose-100/60   border-rose-200/40',
  'from-amber-50  to-amber-100/60  border-amber-200/40',
  'from-emerald-50 to-emerald-100/60 border-emerald-200/40',
  'from-sky-50    to-sky-100/60    border-sky-200/40',
  'from-violet-50 to-violet-100/60 border-violet-200/40',
  'from-orange-50 to-orange-100/60 border-orange-200/40',
]

function GalleryCard({
  label, desc, img, index, sectionColor, square,
}: {
  label: string; desc: string; img: string
  index: number; sectionColor: number; square: boolean
}) {
  const accent = SECTION_ACCENTS[sectionColor % SECTION_ACCENTS.length]
  return (
    <div className="group flex flex-col bg-linen-50/80 border border-linen-300/20
                    rounded-panel shadow-linen overflow-hidden
                    hover:shadow-linen-md hover:border-linen-300/35 transition-all duration-250">
      <div className={`relative bg-gradient-to-br ${accent} border-b border-linen-300/15 overflow-hidden
                       ${square ? 'aspect-square' : 'aspect-[600/315]'}`}>
        <Image src={img} alt={label} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[9px] text-white/70 font-mono drop-shadow">{String(index + 1).padStart(2, '0')}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1.5">
        <span className="text-[13px] text-warm-700 font-normal font-cormorant tracking-wide">{label}</span>
        <p className="text-[11px] text-warm-400 font-light leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
