import type { Metadata } from 'next'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: '도안 갤러리 — 설정별 비교 | Stitch Pattern Maker',
  description: '비율 모드·색상 수·품질·디더링·유사색 분리 설정별 도안 비교 갤러리. 어떤 옵션이 내 사진에 맞는지 미리 확인하세요.',
  openGraph: {
    title: '도안 갤러리 — 설정별 비교 | Stitch Pattern Maker',
    description: '비율 모드·색상 수·품질·디더링 설정별 도안 비교 갤러리',
    type: 'website',
    images: [
      {
        url: 'https://stitchpatternmaker.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stitch Pattern Maker — Free photo to cross stitch pattern generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://stitchpatternmaker.app/og-image.png'],
  },
  alternates: {
    canonical: 'https://stitchpatternmaker.app/gallery',
  },
}

// ── 설정 옵션 목록 ────────────────────────────────────────────────────────────
const ASPECT_MODES = [
  { value: 'fit',     label: 'Fit',     desc: '원본 비율 유지 + 여백 채움',  img: '/gallery/aspect/freeset(300x300)-DMC-20-fast-none-off-color-fit.png' },
  { value: 'crop',    label: 'Crop',    desc: '중앙 기준 크롭, 여백 없음',   img: '/gallery/aspect/freeset(300x300)-DMC-20-fast-none-off-color-crop.png' },
  { value: 'stretch', label: 'Stretch', desc: '격자에 맞게 늘림',            img: '/gallery/aspect/freeset(300x300)-DMC-20-fast-none-off-color-stretch.png' },
]
const COLOR_COUNTS = [
  { value: 20, label: '20색', desc: '단순 — 굵은 색 경계, 빠른 작업', img: '/gallery/color-count/freeset(600x315)-fit-DMC-fast-none-off-color-20.png' },
  { value: 40, label: '40색', desc: '균형 — 기본 권장값',              img: '/gallery/color-count/freeset(600x315)-fit-DMC-fast-none-off-color-40.png' },
  { value: 60, label: '60색', desc: '세밀 — 풍부한 색조',              img: '/gallery/color-count/freeset(600x315)-fit-DMC-fast-none-off-color-60.png' },
  { value: 80, label: '80색', desc: '정교 — 사진에 근접한 색재현',     img: '/gallery/color-count/freeset(600x315)-fit-DMC-fast-none-off-color-80.png' },
]
const QUALITY_MODES = [
  { value: 'fast',     label: 'Fast',     desc: '플랫 컬러, 빠른 생성',              img: '/gallery/quality/freeset(600x315)-fit-DMC-20-none-off-color-fast.png' },
  { value: 'balanced', label: 'Balanced', desc: '디더링 지원, 균형 품질',            img: '/gallery/quality/freeset(600x315)-fit-DMC-20-none-off-color-balanced.png' },
  { value: 'hq',       label: 'HQ',       desc: '샤픈 + Confetti 정리, 최고 품질',  img: '/gallery/quality/freeset(600x315)-fit-DMC-20-none-off-color-hq.png' },
]
const DITHERING_MODES = [
  { value: 'none',     label: 'None',     desc: '플랫 컬러 — 선명한 경계',       img: '/gallery/dithering/freeset(600x315)-fit-DMC-20-fast-off-color-none.png' },
  { value: 'floyd',    label: 'Floyd',    desc: 'Floyd–Steinberg 디더링',        img: '/gallery/dithering/freeset(600x315)-fit-DMC-20-fast-off-color-floyd.png' },
  { value: 'atkinson', label: 'Atkinson', desc: '부드러운 Atkinson 디더링',      img: '/gallery/dithering/freeset(600x315)-fit-DMC-20-fast-off-color-atkinson.png' },
  { value: 'ordered',  label: 'Ordered',  desc: 'Bayer 4×4 매트릭스 패턴',      img: '/gallery/dithering/freeset(600x315)-fit-DMC-20-fast-off-color-ordered.png' },
]
const SEP_LEVELS = [
  { value: 'off',    label: 'OFF',   desc: '유사색 분리 없음',     img: '/gallery/sep/freeset(600x315)-fit-DMC-20-fast-none-color-off.png' },
  { value: 'weak',   label: '약하게', desc: 'ΔE < 8 보정',         img: '/gallery/sep/freeset(600x315)-fit-DMC-20-fast-none-color-mild.png' },
  { value: 'medium', label: '보통',  desc: 'ΔE < 15 보정 (기본값)', img: '/gallery/sep/freeset(600x315)-fit-DMC-20-fast-none-color-normal.png' },
  { value: 'strong', label: '강하게', desc: 'ΔE < 25 보정',        img: '/gallery/sep/freeset(600x315)-fit-DMC-20-fast-none-color-strong.png' },
]
const DISPLAY_MODES = [
  { value: 'color',  label: '컬러',  desc: '색상만 표시',          img: '/gallery/display/freeset(600x315)-fit-DMC-20-fast-none-off-color.png' },
  { value: 'symbol', label: '기호',  desc: '흑백 + 기호 표시',     img: '/gallery/display/freeset(600x315)-fit-DMC-20-fast-none-off-symbol.png' },
  { value: 'mixed',  label: '혼합',  desc: '색상 + 기호 동시 표시', img: '/gallery/display/freeset(600x315)-fit-DMC-20-fast-none-off-combined.png' },
]

// 전체 조합 수
const TOTAL = ASPECT_MODES.length * COLOR_COUNTS.length * QUALITY_MODES.length
            * DITHERING_MODES.length * SEP_LEVELS.length * DISPLAY_MODES.length

const SECTIONS = [
  {
    id:      'aspect',
    title:   '비율 모드',
    subtitle: '원본 이미지를 격자에 매핑하는 방식',
    count:   ASPECT_MODES.length,
    items:   ASPECT_MODES,
    tag:     'AspectMode',
    square:  true,
  },
  {
    id:      'color-count',
    title:   '최대 색상 수',
    subtitle: '사용할 DMC 실 색상의 최대 개수',
    count:   COLOR_COUNTS.length,
    items:   COLOR_COUNTS,
    tag:     'colorCount',
    square:  false,
  },
  {
    id:      'quality',
    title:   '렌더링 품질',
    subtitle: '전처리 강도와 리샘플링 방식',
    count:   QUALITY_MODES.length,
    items:   QUALITY_MODES,
    tag:     'QualityMode',
    square:  false,
  },
  {
    id:      'dithering',
    title:   '디더링',
    subtitle: '색상 양자화 시 적용할 알고리즘',
    count:   DITHERING_MODES.length,
    items:   DITHERING_MODES,
    tag:     'DitheringMode',
    square:  false,
  },
  {
    id:      'sep',
    title:   '유사색 자동 분리',
    subtitle: '인접 유사색을 자동 보정해 작업 난이도 낮춤',
    count:   SEP_LEVELS.length,
    items:   SEP_LEVELS,
    tag:     'SepLevel',
    square:  false,
  },
  {
    id:      'display',
    title:   '표시 모드',
    subtitle: '도안 캔버스 렌더링 방식',
    count:   DISPLAY_MODES.length,
    items:   DISPLAY_MODES,
    tag:     'DisplayMode',
    square:  false,
  },
]

export default function GalleryPage() {
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
            설정 옵션 예시 갤러리
          </h1>
          <p className="font-cormorant text-[16px] italic font-light text-warm-500 max-w-lg leading-relaxed mb-8">
            같은 사진도 설정에 따라 완전히 다른 도안이 만들어집니다.
            각 옵션별 비교 예시를 확인해보세요.
          </p>

          {/* 조합 계산 박스 */}
          <div className="inline-block bg-linen-50/80 border border-linen-300/25 rounded-panel
                          shadow-linen px-6 py-5">
            <p className="text-[10px] uppercase tracking-wider text-warm-400 mb-3 font-light">
              전체 설정 조합 계산
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {SECTIONS.map((sec, i) => (
                <span key={sec.id} className="flex items-center gap-2">
                  <span className="flex flex-col items-center">
                    <span className="text-[18px] font-playfair text-warm-700 leading-none">
                      {sec.count}
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
                  가지 조합
                </span>
              </span>
            </div>
            <p className="text-[10px] text-warm-400 font-light">
              이 페이지에는 각 설정별 대표 예시 <strong className="text-warm-600 font-normal">{totalCards}장</strong>을 준비했습니다.
            </p>
          </div>
        </div>

        {/* ── 섹션별 갤러리 ─────────────────────────────────────────────────── */}
        <div className="space-y-20 pt-16">
          {SECTIONS.map((section, sIdx) => (
            <section key={section.id} id={section.id}>

              {/* 섹션 헤더 */}
              <div className="flex items-start justify-between mb-7 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] text-warm-400 font-light tracking-wider">
                      {String(sIdx + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
                    </span>
                    <div className="h-px w-6 bg-linen-300/40" />
                    <code className="text-[9px] bg-sage-400/12 text-sage-500 px-2 py-0.5
                                     rounded-full font-mono tracking-wide">
                      {section.tag}
                    </code>
                  </div>
                  <h2 className="font-cormorant text-[22px] sm:text-[26px] text-warm-700 tracking-wide">
                    {section.title}
                  </h2>
                  <p className="text-[12px] text-warm-400 font-light mt-0.5">
                    {section.subtitle}
                  </p>
                </div>
                <span className="flex-shrink-0 text-[11px] text-warm-300 font-light mt-1 pt-5">
                  {section.count}가지 옵션
                </span>
              </div>

              {/* 카드 그리드 */}
              <div className={`grid gap-5
                ${section.items.length === 3
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

        {/* ── 푸터 CTA ─────────────────────────────────────────────────────── */}
        <div className="mt-24 pt-12 border-t border-linen-300/20 text-center">
          <p className="font-cormorant text-[18px] italic text-warm-500 mb-5 font-light">
            마음에 드는 스타일을 찾으셨나요?
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3 bg-warm-600 text-linen-50
                       text-[12px] rounded-pill hover:bg-warm-500 transition-colors no-underline"
          >
            도안 만들러 가기 →
          </a>
        </div>

      </main>
    </div>
  )
}

// ── GalleryCard ───────────────────────────────────────────────────────────────
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
  label:        string
  desc:         string
  img:          string
  index:        number
  sectionColor: number
  square:       boolean
}) {
  const accent = SECTION_ACCENTS[sectionColor % SECTION_ACCENTS.length]

  return (
    <div className="group flex flex-col bg-linen-50/80 border border-linen-300/20
                    rounded-panel shadow-linen overflow-hidden
                    hover:shadow-linen-md hover:border-linen-300/35 transition-all duration-250">

      {/* 이미지 영역 */}
      <div className={`relative bg-gradient-to-br ${accent} border-b border-linen-300/15 overflow-hidden
                       ${square ? 'aspect-square' : 'aspect-[600/315]'}`}>

        <Image
          src={img}
          alt={label}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />

        {/* 인덱스 배지 */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[9px] text-white/70 font-mono drop-shadow">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* 카드 정보 */}
      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-warm-700 font-normal font-cormorant tracking-wide">
            {label}
          </span>
        </div>
        <p className="text-[11px] text-warm-400 font-light leading-relaxed">
          {desc}
        </p>
      </div>

    </div>
  )
}
