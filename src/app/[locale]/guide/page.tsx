import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { SectionLabel, Tip, PrepItem, TipItem } from '@/components/guide/GuideShared'

const SITE_URL = 'https://stitchpatternmaker.app'

// ── Per-locale metadata ───────────────────────────────────────────────────────

const META = {
  ko: {
    title: '십자수 완전 입문 가이드 — 도구·DMC 실·도안 읽는 법 | Stitch Pattern Maker',
    description:
      '십자수를 처음 시작하는 분들을 위한 완전 가이드. 준비물 고르는 법부터 DMC 실 번호 보는 방법, 도안 읽기, PDF 인쇄 팁까지 초보자에게 필요한 모든 정보를 담았습니다.',
    ogLocale: 'ko_KR',
    keywords: [
      '십자수 가이드', '십자수 입문', 'DMC 실 번호', '에이다 원단',
      '십자수 준비물', '자수 도안 가이드', '크로스스티치 초보',
    ],
    articleLang: 'ko',
    breadcrumb: { home: '홈', guide: '가이드' },
    jsonLdHeadline: '십자수 완전 입문 가이드',
    jsonLdDescription: '십자수를 처음 시작하는 분들을 위한 완전 가이드. 준비물부터 PDF 도안 인쇄 팁까지.',
  },
  ja: {
    title: 'クロスステッチ完全入門ガイド — 道具・DMC糸・図案の読み方 | Stitch Pattern Maker',
    description:
      'クロスステッチを始めるために必要なすべての情報。道具の選び方からDMC糸番号の読み方、図案の使い方、PDF印刷のコツまで、初心者向けに丁寧に解説します。',
    ogLocale: 'ja_JP',
    keywords: [
      'クロスステッチ ガイド', 'クロスステッチ 入門', 'DMC 刺繍糸 番号',
      'アイーダ 布', 'クロスステッチ 道具', '刺しゅう 図案 ガイド',
    ],
    articleLang: 'ja',
    breadcrumb: { home: 'ホーム', guide: 'ガイド' },
    jsonLdHeadline: 'クロスステッチ完全入門ガイド',
    jsonLdDescription: 'クロスステッチを始めるために必要なすべての情報。道具の選び方からPDF印刷のコツまで。',
  },
} as const

type SupportedLocale = keyof typeof META

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const m = META[locale as SupportedLocale] ?? META.ko
  const localeUrl = `${SITE_URL}/${locale}/guide`

  return {
    title: m.title,
    description: m.description,
    keywords: [...m.keywords],
    openGraph: {
      title: m.title,
      description: m.description,
      url: localeUrl,
      siteName: 'Stitch Pattern Maker',
      type: 'article',
      locale: m.ogLocale,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
      images: [`${SITE_URL}/og-image.png`],
    },
    alternates: {
      canonical: localeUrl,
      languages: {
        'en':        `${SITE_URL}/guide`,
        'ko':        `${SITE_URL}/ko/guide`,
        'ja':        `${SITE_URL}/ja/guide`,
        'x-default': `${SITE_URL}/guide`,
      },
    },
  }
}

// ── Korean content ────────────────────────────────────────────────────────────

const koFaqItems = [
  {
    q: '십자수 바늘 번호는 무엇을 골라야 하나요?',
    a: '14카운트 에이다 원단에는 24번 또는 26번 크로스스티치 전용 바늘이 적합합니다. 끝이 뭉뚝한 타입(블런트 니들)을 선택하면 원단 실이 손상되지 않습니다. 카운트가 높아질수록 더 작은 번호의 바늘을 사용합니다.',
  },
  {
    q: '실은 몇 가닥을 사용해야 하나요?',
    a: 'DMC 25번사는 6가닥으로 구성되어 있습니다. 14카운트 에이다에는 2가닥 사용이 일반적이며, 커버력을 높이려면 3가닥도 사용합니다. 18카운트 이상의 세밀한 원단에는 1가닥을 권장합니다.',
  },
  {
    q: '원단 크기는 어떻게 계산하나요?',
    a: '도안 크기(칸 수) ÷ 카운트 수 = 완성 크기(인치)입니다. 예: 50칸 도안을 14카운트 에이다에 작업하면 약 9cm(3.5인치) 크기가 됩니다. 실제 원단은 사방으로 5~7cm 여유분을 더해서 재단하세요.',
  },
  {
    q: '십자수 초보자가 첫 작품으로 적합한 도안 크기는?',
    a: '30×30칸 이하, 색상 수 5가지 이하의 도안을 권장합니다. 작고 단순한 작품을 먼저 완성해 성취감을 느끼는 것이 중요합니다. Stitch Pattern Maker에서 도안 생성 시 크기와 색상 수를 조정할 수 있습니다.',
  },
  {
    q: 'Stitch Pattern Maker에서 만든 도안은 어떻게 사용하나요?',
    a: '생성된 도안을 PDF로 저장한 뒤 A4 용지에 100% 비율로 인쇄하세요. 도안에는 DMC 실 번호 목록, 색상 기호, 격자가 포함되어 있어 바로 작업에 활용할 수 있습니다.',
  },
  {
    q: '십자수와 일반 자수의 차이점은?',
    a: '십자수(크로스스티치)는 X자 모양 하나하나를 격자 위에 규칙적으로 놓는 자수입니다. 도안이 격자 형태로 되어 있어 초보자도 쉽게 따라 할 수 있습니다. 일반 자수에 비해 도안 규격이 명확하고 색상 관리가 쉬운 것이 특징입니다.',
  },
]

const koTocItems = [
  '십자수란 무엇인가',
  '십자수 기본 준비물',
  'DMC 실 번호 보는 방법',
  '도안 읽는 방법',
  '색상 수가 많을수록 어려운 이유',
  '초보자 추천 도안 크기',
  '십자수 작업 팁',
  '실 보관 방법',
  '큰 도안 작업 요령',
  'PDF 도안 인쇄 팁',
]

function KoGuideContent() {
  return (
    <article className="space-y-14">

      <section id="section-1">
        <SectionLabel num={1} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">십자수란 무엇인가</h2>
        <div className="prose-content">
          <p>
            십자수(크로스스티치, Cross Stitch)는 원단 위의 격자를 따라
            <strong className="text-warm-600"> X자 모양</strong>으로 실을 교차해 무늬를 만드는 자수 기법입니다.
            동아시아, 유럽, 중동 등 전 세계에서 수백 년의 역사를 지닌 전통 공예로,
            현대에는 취미 공예·인테리어 소품·선물 제작 등 다양한 용도로 즐기고 있습니다.
          </p>
          <p>
            십자수의 가장 큰 매력은 <strong className="text-warm-600">누구나 쉽게 시작할 수 있다</strong>는 점입니다.
            도안이 격자 형태이기 때문에 색상 기호를 따라 한 칸씩 채우기만 하면 됩니다.
            미술 실력이나 자수 경험이 전혀 없어도 도안만 있으면 충분합니다.
          </p>
          <p>
            최근에는 사진을 십자수 도안으로 변환하는 디지털 도구가 등장하면서,
            가족 사진·반려동물·풍경 등 개인적인 소재를 담은 나만의 도안을 만들 수 있게 되었습니다.
            Stitch Pattern Maker가 바로 그 역할을 합니다.
          </p>
        </div>
      </section>

      <section id="section-2">
        <SectionLabel num={2} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">십자수 기본 준비물</h2>
        <div className="prose-content">
          <p className="mb-6">
            십자수를 시작하기 위한 최소한의 준비물은 네 가지입니다.
            처음에는 기본 세트만 갖추고 시작해도 충분합니다.
          </p>
          <div className="space-y-5">
            <PrepItem title="자수실" badge="DMC 25번사 권장" desc="가장 보편적인 자수실은 DMC 25번사입니다. 6가닥이 꼬여 한 타래를 이루며, 작업 시 2~3가닥으로 나눠 사용합니다. DMC는 전 세계 어디서나 동일한 번호로 색상을 구매할 수 있어 도안과의 호환성이 뛰어납니다." />
            <PrepItem title="크로스스티치 바늘" badge="24~26번 추천" desc="끝이 뭉뚝한 크로스스티치 전용 바늘을 사용합니다. 날카로운 일반 바늘과 달리 원단 실을 밀어내며 구멍으로 통과하기 때문에 원단이 손상되지 않습니다. 14카운트 에이다에는 24번 또는 26번이 적합합니다." />
            <PrepItem title="에이다 원단 (Aida Cloth)" badge="14카운트 입문자용" desc="십자수 전용 원단으로, 격자 구조가 명확히 구분되어 있어 초보자가 작업하기 쉽습니다. '카운트(Count)'는 1인치당 격자 수를 의미하며, 숫자가 클수록 격자가 촘촘해집니다. 입문자에게는 14카운트를 권장하며, 보통 베이지·흰색·검정 중 도안의 배경색과 어울리는 색을 고릅니다." />
            <PrepItem title="수틀 (Embroidery Hoop)" badge="지름 10~15cm 추천" desc="원단을 팽팽하게 고정시켜 작업 편의성을 높이는 도구입니다. 대나무 또는 플라스틱 재질이 있으며, 지름 10~15cm짜리를 먼저 구입해보는 것을 권장합니다. 큰 작품에는 더 큰 수틀을 사용하거나 수틀 없이 프레임에 원단을 고정하기도 합니다." />
          </div>
        </div>
      </section>

      <section id="section-3">
        <SectionLabel num={3} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">DMC 실 번호 보는 방법</h2>
        <div className="prose-content">
          <p>
            DMC는 세계에서 가장 널리 사용되는 자수실 브랜드로,
            각 색상에는 고유한 번호가 부여되어 있습니다.
            번호는 무조건 암기할 필요가 없지만, 체계를 이해하면 도안과 실 구매가 훨씬 수월해집니다.
          </p>
          <ul className="mt-4 space-y-2.5 text-[14px] text-warm-500 font-light leading-relaxed">
            <li className="flex gap-3"><span className="text-sage-400 font-normal mt-0.5">·</span><span><strong className="text-warm-600">blanc / ecru</strong> — 번호 대신 이름으로 표기되는 흰색 계열. blanc는 순백, ecru는 따뜻한 아이보리.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 font-normal mt-0.5">·</span><span><strong className="text-warm-600">100~400번대</strong> — 핑크, 빨강, 파랑, 초록 등 비교적 선명한 색상군.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 font-normal mt-0.5">·</span><span><strong className="text-warm-600">500~900번대</strong> — 중간 채도의 다양한 색상. 자연색, 그린, 블루 계열이 많습니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 font-normal mt-0.5">·</span><span><strong className="text-warm-600">3000번대</strong> — 확장 팔레트. 수백 가지 뉘앙스 색상이 포함되며, 그러데이션 표현에 유리합니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 font-normal mt-0.5">·</span><span><strong className="text-warm-600">310 (Black)</strong> — 십자수에서 가장 많이 쓰이는 검정. 윤곽선과 그림자 표현에 자주 사용됩니다.</span></li>
          </ul>
          <Tip>
            도안에 적힌 DMC 번호 그대로 실을 구매하면 됩니다.
            국내 온라인 쇼핑몰에서 DMC 번호로 검색하면 쉽게 찾을 수 있습니다.
            <Link href="/dmc-colors" className="text-sage-500 hover:text-sage-600 ml-1">DMC 색상표 전체 보기 →</Link>
          </Tip>
        </div>
      </section>

      <section id="section-4">
        <SectionLabel num={4} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">도안 읽는 방법</h2>
        <div className="prose-content">
          <p>
            십자수 도안은 격자(그리드)로 표현됩니다.
            격자 한 칸이 원단의 한 칸(한 코)에 해당하며,
            각 칸에 채색되거나 기호가 표시되어 있어 어떤 색의 실을 놓아야 하는지 알 수 있습니다.
          </p>
          <h3 className="font-cormorant text-[19px] text-warm-600 mt-6 mb-3">도안의 구성 요소</h3>
          <ul className="space-y-2.5 text-[14px] text-warm-500 font-light leading-relaxed">
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">색상 기호표</strong> — 도안에 사용된 각 색상에 대응하는 기호(심볼)와 DMC 번호가 나열된 범례입니다. 도안 옆이나 아래에 위치합니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">격자 번호</strong> — 10칸마다 번호가 표시되어 도안에서 현재 작업 위치를 파악하기 쉽습니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">실 목록</strong> — 도안 완성에 필요한 DMC 번호 전체 목록과 각 색상의 사용량(실타래 수)을 안내합니다.</span></li>
          </ul>
          <Tip>
            도안을 처음 받으면 전체 실 목록을 확인하고, 먼저 실을 모두 준비해두세요.
            작업 중에 실이 부족해 색상을 구하러 다니는 일을 방지할 수 있습니다.
          </Tip>
        </div>
      </section>

      <section id="section-5">
        <SectionLabel num={5} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">색상 수가 많을수록 어려운 이유</h2>
        <div className="prose-content">
          <p>
            십자수 도안의 색상 수는 작업 난이도와 직결됩니다.
            색상이 많아질수록 실 교체 횟수가 늘고, 유사한 색상을 구분하기 어려워지며, 실 관리도 복잡해집니다.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: '입문', count: '5~10색', desc: '단순하고 선명한 도안. 빠른 완성 가능.', color: 'bg-sage-400/15 border-sage-400/30' },
              { label: '중급', count: '15~30색', desc: '그러데이션과 세밀한 표현 가능.', color: 'bg-linen-200/60 border-linen-300/30' },
              { label: '고급', count: '40색 이상', desc: '사진과 유사한 수준의 정밀한 도안.', color: 'bg-warm-400/10 border-warm-400/20' },
            ].map(item => (
              <div key={item.label} className={`p-4 rounded-card border ${item.color}`}>
                <div className="text-[10px] uppercase tracking-widest text-sage-500 mb-1">{item.label}</div>
                <div className="font-cormorant text-[22px] text-warm-700 mb-1.5">{item.count}</div>
                <p className="text-[12px] text-warm-400 font-light leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-5">
            Stitch Pattern Maker에서는 도안 생성 시 색상 수를 5~60색 사이로 자유롭게 조절할 수 있습니다.
            처음에는 10~20색으로 시작하고, 익숙해지면 색상 수를 늘려 사진과 가까운 도안을 만들어보세요.
          </p>
        </div>
      </section>

      <section id="section-6">
        <SectionLabel num={6} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">초보자 추천 도안 크기</h2>
        <div className="prose-content">
          <p>
            도안의 크기(칸 수)는 완성 작품의 물리적 크기와 작업 시간을 결정합니다.
            처음에는 작은 도안부터 시작해 완성의 성취감을 느끼는 것이 중요합니다.
          </p>
          <h3 className="font-cormorant text-[19px] text-warm-600 mt-6 mb-3">완성 크기 계산법</h3>
          <div className="p-5 bg-linen-100/50 border border-linen-300/25 rounded-card text-[13px] text-warm-500 font-light">
            <p className="mb-2"><strong className="text-warm-600">완성 크기(cm)</strong> = 도안 칸 수 ÷ 카운트 × 2.54</p>
            <ul className="space-y-1.5 mt-3">
              <li>· 50×50칸, 14카운트 → 약 9×9cm</li>
              <li>· 100×100칸, 14카운트 → 약 18×18cm</li>
              <li>· 150×200칸, 14카운트 → 약 27×36cm</li>
            </ul>
          </div>
          <p className="mt-5">
            <strong className="text-warm-600">첫 작품 권장 크기: 30×30~50×50칸</strong>.
            완성 시 약 5~9cm 크기의 미니 작품이 됩니다. 엽서 크기나 작은 액자에 넣기 좋은 크기로,
            2~4시간 안에 완성할 수 있어 초보자에게 적합합니다.
          </p>
        </div>
      </section>

      <section id="section-7">
        <SectionLabel num={7} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">십자수 작업 팁</h2>
        <div className="prose-content">
          <ul className="space-y-4 text-[14px] text-warm-500 font-light leading-relaxed">
            <TipItem title="실 길이는 40~50cm" desc="너무 길면 실이 엉키고 꼬임이 생깁니다. 40~50cm(팔뚝 길이 정도)로 잘라서 사용하세요." />
            <TipItem title="X자 방향 통일" desc="모든 X의 위 실이 같은 방향(오른쪽 위 또는 왼쪽 위)을 향하도록 통일하면 완성된 작품이 더 깔끔해 보입니다." />
            <TipItem title="실 꼬임 방지" desc="바늘을 원단 아래로 내린 상태에서 가끔 바늘을 공중에 매달아 두면 실이 자연스럽게 꼬임이 풀립니다." />
            <TipItem title="밝은 조명 필수" desc="세밀한 작업에는 자연광 또는 주광색(하얀빛) LED 조명을 사용하면 격자와 색상이 잘 보입니다." />
            <TipItem title="실 끝 처리" desc="시작과 끝의 실 끝은 뒷면에 최소 3~4칸의 실 아래로 통과시켜 고정합니다. 매듭을 짓지 않는 것이 원칙입니다." />
            <TipItem title="같은 색 실은 한 번에" desc="한 색의 실을 한 번에 몰아서 놓으면 실 전환 횟수가 줄어 효율적으로 작업할 수 있습니다." />
          </ul>
        </div>
      </section>

      <section id="section-8">
        <SectionLabel num={8} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">실 보관 방법</h2>
        <div className="prose-content">
          <p>
            DMC 실은 색상이 많아질수록 관리가 어려워집니다.
            처음부터 체계적으로 정리해두면 작업 시간이 크게 단축됩니다.
          </p>
          <ul className="mt-4 space-y-3 text-[14px] text-warm-500 font-light leading-relaxed">
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">실패 카드 사용</strong> — 두꺼운 종이나 플라스틱 보빈에 실을 감고 DMC 번호를 기재해두면 색상을 한눈에 파악할 수 있습니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">지퍼백 분류</strong> — 색상군별(빨강, 파랑, 초록 등)로 지퍼백에 분류해두면 찾기 쉽습니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">번호 기재 필수</strong> — 라벨을 제거하기 전에 반드시 DMC 번호를 별도로 메모해두세요. 번호를 잃어버리면 유사색 구분이 매우 어렵습니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">햇빛 피하기</strong> — 자수실은 직사광선에 오래 노출되면 색이 바랩니다. 서랍 또는 불투명 케이스에 보관하세요.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">재고 목록 작성</strong> — 보유한 DMC 번호를 스프레드시트에 기록해두면 새 도안을 받았을 때 필요한 실을 빠르게 파악할 수 있습니다.</span></li>
          </ul>
        </div>
      </section>

      <section id="section-9">
        <SectionLabel num={9} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">큰 도안 작업 요령</h2>
        <div className="prose-content">
          <p>
            100칸 이상의 대형 도안은 처음부터 체계적인 접근이 필요합니다.
            무작정 한쪽 끝부터 시작하면 도중에 원단이 부족하거나 격자 위치를 잃어버리기 쉽습니다.
          </p>
          <ul className="mt-4 space-y-3 text-[14px] text-warm-500 font-light leading-relaxed">
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">중앙에서 시작</strong> — 도안의 정중앙을 먼저 찾아 작업을 시작하세요. 원단을 반으로 접어 중앙을 표시한 뒤 거기서 작업해 나갑니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">구역 나누기</strong> — 도안을 10×10 또는 20×20칸 구역으로 나눠 한 구역씩 완성합니다. 구역 경계를 실로 시침질해 표시해두면 편리합니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">진행 상황 표시</strong> — 도안 사본에 작업 완료한 구역을 형광펜이나 마커로 표시하면 작업 위치를 잃지 않습니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">하나의 색 완성 후 이동</strong> — 가능하면 같은 색의 실을 해당 구역 전체에 먼저 작업하고 넘어가면 실 낭비를 줄일 수 있습니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">원단 여백 넉넉히</strong> — 대형 도안은 원단 사방으로 최소 7~10cm 여백을 남겨두세요. 프레임 마감 또는 액자 작업 시 필요합니다.</span></li>
          </ul>
        </div>
      </section>

      <section id="section-10">
        <SectionLabel num={10} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">PDF 도안 인쇄 팁</h2>
        <div className="prose-content">
          <p>
            Stitch Pattern Maker에서 생성한 도안은 PDF로 저장됩니다.
            올바른 설정으로 인쇄해야 격자 크기가 정확히 맞아 작업이 수월해집니다.
          </p>
          <ul className="mt-4 space-y-3 text-[14px] text-warm-500 font-light leading-relaxed">
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">인쇄 배율 100%</strong> — 반드시 &quot;실제 크기&quot; 또는 100% 배율로 인쇄하세요. &quot;페이지에 맞게 조정&quot; 옵션을 사용하면 격자 크기가 달라집니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">A4 용지 기준</strong> — 도안이 여러 페이지로 분할되어 출력됩니다. 페이지 번호가 인쇄되므로 올바른 순서로 이어 붙이세요.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">흑백 인쇄도 가능</strong> — 색상 기호(심볼)가 함께 표시되므로 흑백 인쇄로도 도안을 충분히 읽을 수 있습니다. 잉크를 절약하려면 흑백 모드를 활용하세요.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">라미네이팅 추천</strong> — 도안 용지를 라미네이팅하면 오래 사용해도 구겨지거나 찢어지지 않습니다. 작업 중 습기나 물 오염에도 강해집니다.</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">확대 인쇄</strong> — 눈이 피로하거나 세밀한 도안을 편하게 보고 싶다면 120~150% 배율로 확대 인쇄하고, 격자 한 칸 크기에 맞는 카운트를 그에 맞게 조정하세요.</span></li>
          </ul>
          <Tip>
            큰 도안은 각 페이지 번호가 중요합니다.
            인쇄 후 도안 조각을 테이프로 이어 붙이기 전에 페이지 번호를 확인하고 올바른 위치에 배치하세요.
          </Tip>
        </div>
      </section>

      <section id="faq" className="pt-4">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light">FAQ</span>
          <div className="h-px flex-1 bg-linen-300/30" />
        </div>
        <h2 className="font-playfair text-[26px] text-warm-700 mb-7 leading-snug">자주 묻는 질문</h2>
        <div className="space-y-3">
          {koFaqItems.map(({ q, a }) => (
            <details key={q} className="group bg-linen-50/70 border border-linen-300/25 rounded-card overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-[14px] text-warm-600 font-normal list-none hover:bg-linen-100/50 transition-colors">
                <span>{q}</span>
                <span className="text-sage-400 text-lg leading-none ml-4 flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
              </summary>
              <div className="px-6 pb-5 pt-1 text-[13px] text-warm-500 font-light leading-relaxed border-t border-linen-300/20">{a}</div>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-10 p-8 bg-gradient-to-br from-linen-100/60 to-linen-200/40 border border-linen-300/25 rounded-panel text-center">
        <p className="font-cormorant text-[22px] italic text-warm-600 mb-2">도안을 직접 만들어 볼 준비가 됐나요?</p>
        <p className="text-[13px] text-warm-400 font-light mb-6">사진을 올리면 DMC 실 색상이 매핑된 십자수 도안을 바로 만들 수 있습니다.</p>
        <Link href="/ko" className="inline-flex items-center gap-2 px-7 py-3 bg-warm-600 text-linen-50 text-sm font-light tracking-wide rounded-btn no-underline hover:bg-warm-500 transition-colors duration-200">
          무료로 도안 만들기
        </Link>
      </div>

    </article>
  )
}

// ── Japanese content ──────────────────────────────────────────────────────────

const jaFaqItems = [
  {
    q: '針のサイズはどれを選べばいいですか？',
    a: '14カウントのアイーダ布には、24番または26番のタペストリー針が最適です。先が丸くなっているため、布の織り糸を傷めずに穴を通ることができます。カウント数が上がるほど細い針を使用してください。',
  },
  {
    q: '糸は何本取りで使いますか？',
    a: 'DMCの25番刺繍糸は6本撚りです。14カウントのアイーダには2本取りが標準で、カバレッジを高めたい場合は3本取りも使います。18カウント以上の細かい布には1本取りがおすすめです。',
  },
  {
    q: '布のサイズはどう計算しますか？',
    a: 'ステッチ数 ÷ カウント数 = 完成サイズ（インチ）で計算します。例：50マス図案を14カウントアイーダで刺すと約9cm（3.5インチ）になります。実際の布は四方に5〜7cmの余白を加えてカットしてください。',
  },
  {
    q: '初心者の最初の作品に適した図案のサイズは？',
    a: '30×30マス以下、色数5色以下の図案をおすすめします。小さく簡単な作品を完成させて達成感を味わうことが大切です。Stitch Pattern Makerではサイズと色数を自由に調整できます。',
  },
  {
    q: 'Stitch Pattern Makerで作った図案はどう使いますか？',
    a: '図案をPDFで保存し、A4用紙に100%の倍率で印刷してください。PDFにはDMC糸番号リスト・色記号・グリッドが含まれているので、そのまま刺繍を始められます。',
  },
  {
    q: 'クロスステッチと普通の刺繍の違いは何ですか？',
    a: 'クロスステッチはX字形のステッチをグリッド上に規則的に置く刺繍技法です。図案がグリッド形式なので、絵を描く技術や刺繍経験がなくても、色記号を1マスずつ追うだけで完成させられます。',
  },
]

const jaTocItems = [
  'クロスステッチとは',
  '基本の道具',
  'DMC糸番号の読み方',
  '図案の読み方',
  '色数が多いほど難しい理由',
  '初心者におすすめの図案サイズ',
  '刺繍のコツ',
  '糸の保管方法',
  '大きな図案の攻略法',
  'PDF図案の印刷のコツ',
]

function JaGuideContent() {
  return (
    <article className="space-y-14">

      <section id="section-1">
        <SectionLabel num={1} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">クロスステッチとは</h2>
        <div className="prose-content">
          <p>
            クロスステッチは、布のグリッドに沿って
            <strong className="text-warm-600"> X字形のステッチ</strong>を置きながら模様を作る刺繍技法です。
            東アジア・ヨーロッパ・中東など世界各地で数百年の歴史を持つ伝統工芸であり、
            現代ではホビークラフト・インテリア小物・贈り物づくりなど幅広い用途で親しまれています。
          </p>
          <p>
            最大の魅力は<strong className="text-warm-600">誰でもすぐに始められる</strong>ことです。
            図案がグリッド形式になっているため、色記号を1マスずつ追うだけで完成させられます。
            絵を描く技術も刺繍経験もまったく必要ありません。
          </p>
          <p>
            近年はデジタルツールの登場により、写真を直接クロスステッチ図案に変換できるようになりました。
            家族の写真・ペット・風景など、あなただけのオリジナル図案を作れるのが
            Stitch Pattern Makerです。
          </p>
        </div>
      </section>

      <section id="section-2">
        <SectionLabel num={2} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">基本の道具</h2>
        <div className="prose-content">
          <p className="mb-6">
            クロスステッチを始めるために必要な道具は4つだけです。
            最初はシンプルなセットで十分です。
          </p>
          <div className="space-y-5">
            <PrepItem title="刺繍糸" badge="DMC 25番糸がおすすめ" desc="世界で最も広く使われている刺繍糸がDMC 25番糸です。6本撚りで1かせになっており、刺繍時は2〜3本に分けて使います。DMCは世界共通の番号で色を管理しているため、どこで買っても図案と同じ色が入手できます。" />
            <PrepItem title="タペストリー針" badge="24〜26番がおすすめ" desc="先が丸いタペストリー針を使用します。鋭い普通の針と違い、布の穴を通るときに織り糸を傷めません。14カウントのアイーダには24番か26番が適しています。カウントが上がるほど細い針を使ってください。" />
            <PrepItem title="アイーダ布" badge="14カウントが入門用" desc="クロスステッチ専用の布で、均等な間隔のグリッド穴があり、ステッチを置く位置がひと目でわかります。「カウント」は1インチあたりのマス数を表し、数字が大きいほど目が細かくなります。初心者には14カウントがスタンダードです。" />
            <PrepItem title="刺繍枠（フープ）" badge="直径10〜15cmがおすすめ" desc="布をピンと張って固定し、ステッチを均一に仕上げるための道具です。竹製またはプラスチック製の10〜15cmサイズから始めましょう。大きな作品には大きなフープや布を固定するフレームを使うこともあります。" />
          </div>
        </div>
      </section>

      <section id="section-3">
        <SectionLabel num={3} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">DMC糸番号の読み方</h2>
        <div className="prose-content">
          <p>
            DMCはすべての色に固有の番号を付けています。
            番号を丸暗記する必要はありませんが、大まかな体系を知っておくと糸の購入がずっと楽になります。
          </p>
          <ul className="mt-4 space-y-2.5 text-[14px] text-warm-500 font-light leading-relaxed">
            <li className="flex gap-3"><span className="text-sage-400 font-normal mt-0.5">·</span><span><strong className="text-warm-600">blanc / ecru</strong> — 番号ではなく名前で表記される白系。blancは純白、ecruは温かみのあるアイボリー。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 font-normal mt-0.5">·</span><span><strong className="text-warm-600">100〜400番台</strong> — ピンク・赤・青・緑など比較的鮮やかな色グループ。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 font-normal mt-0.5">·</span><span><strong className="text-warm-600">500〜900番台</strong> — 中間的な彩度のさまざまな色。ナチュラル系・グリーン・ブルー系が多い。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 font-normal mt-0.5">·</span><span><strong className="text-warm-600">3000番台</strong> — 拡張パレット。数百種類のニュアンスカラーが含まれ、グラデーション表現に最適。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 font-normal mt-0.5">·</span><span><strong className="text-warm-600">310（ブラック）</strong> — クロスステッチで最も多用される黒。輪郭や影の表現に欠かせません。</span></li>
          </ul>
          <Tip>
            図案に書かれたDMC番号をそのまま手芸店やネットショップで検索すれば簡単に購入できます。
            <Link href="/dmc-colors" className="text-sage-500 hover:text-sage-600 ml-1">DMCカラーチャート全色を見る →</Link>
          </Tip>
        </div>
      </section>

      <section id="section-4">
        <SectionLabel num={4} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">図案の読み方</h2>
        <div className="prose-content">
          <p>
            クロスステッチ図案はグリッドで表現されています。
            グリッドの1マスが布の1目に対応し、各マスに色や記号が表示されることで
            どの色の糸を置くべきかがわかります。
          </p>
          <h3 className="font-cormorant text-[19px] text-warm-600 mt-6 mb-3">図案の構成要素</h3>
          <ul className="space-y-2.5 text-[14px] text-warm-500 font-light leading-relaxed">
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">カラーキー（凡例）</strong> — 使用する各色に対応する記号とDMC番号が一覧になった表です。図案の横や下に配置されています。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">グリッド番号</strong> — 10マスごとに番号が表示され、図案上の現在位置を把握しやすくなっています。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">糸リスト</strong> — 使用するDMC番号の全リストと各色の使用量（かせ数）が記載されています。</span></li>
          </ul>
          <Tip>
            刺繍を始める前に糸リスト全体を確認し、必要な糸をすべて揃えておきましょう。
            作業中に糸が足りなくて色探しに走る事態を防げます。
          </Tip>
        </div>
      </section>

      <section id="section-5">
        <SectionLabel num={5} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">色数が多いほど難しい理由</h2>
        <div className="prose-content">
          <p>
            図案の色数は作業の難易度に直結します。
            色が増えるほど糸の替え回数が増え、似た色の区別が難しくなり、糸の管理も複雑になります。
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: '入門', count: '5〜10色', desc: 'シンプルで鮮やかな図案。すぐに完成できる。', color: 'bg-sage-400/15 border-sage-400/30' },
              { label: '中級', count: '15〜30色', desc: 'グラデーションや細かな表現が可能。', color: 'bg-linen-200/60 border-linen-300/30' },
              { label: '上級', count: '40色以上', desc: '写真に近いリアルな仕上がり。', color: 'bg-warm-400/10 border-warm-400/20' },
            ].map(item => (
              <div key={item.label} className={`p-4 rounded-card border ${item.color}`}>
                <div className="text-[10px] uppercase tracking-widest text-sage-500 mb-1">{item.label}</div>
                <div className="font-cormorant text-[22px] text-warm-700 mb-1.5">{item.count}</div>
                <p className="text-[12px] text-warm-400 font-light leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-5">
            Stitch Pattern Makerでは図案生成時に5〜60色の範囲で色数を自由に設定できます。
            最初は10〜20色から始め、慣れてきたら色数を増やして写真に近い図案に挑戦してみましょう。
          </p>
        </div>
      </section>

      <section id="section-6">
        <SectionLabel num={6} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">初心者におすすめの図案サイズ</h2>
        <div className="prose-content">
          <p>
            図案のマス数は完成作品の物理的なサイズと作業時間を決定します。
            最初は小さな作品から始めて、完成の達成感を味わうことが大切です。
          </p>
          <h3 className="font-cormorant text-[19px] text-warm-600 mt-6 mb-3">完成サイズの計算方法</h3>
          <div className="p-5 bg-linen-100/50 border border-linen-300/25 rounded-card text-[13px] text-warm-500 font-light">
            <p className="mb-2"><strong className="text-warm-600">完成サイズ（cm）</strong> = マス数 ÷ カウント × 2.54</p>
            <ul className="space-y-1.5 mt-3">
              <li>· 50×50マス、14カウント → 約9×9cm</li>
              <li>· 100×100マス、14カウント → 約18×18cm</li>
              <li>· 150×200マス、14カウント → 約27×36cm</li>
            </ul>
          </div>
          <p className="mt-5">
            <strong className="text-warm-600">初めての作品におすすめのサイズ：30×30〜50×50マス。</strong>
            完成すると約5〜9cmのミニ作品になります。ポストカードサイズで小さな額縁にもぴったり、
            2〜4時間で完成できるので初心者に最適です。
          </p>
        </div>
      </section>

      <section id="section-7">
        <SectionLabel num={7} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">刺繍のコツ</h2>
        <div className="prose-content">
          <ul className="space-y-4 text-[14px] text-warm-500 font-light leading-relaxed">
            <TipItem title="糸の長さは40〜50cm" desc="長すぎると絡まりやすくなります。腕一本分（40〜50cm）を目安に切って使いましょう。" />
            <TipItem title="Xの方向を統一する" desc="すべてのXの上側の糸が同じ方向（右上または左上）になるよう統一すると、完成品がきれいに見えます。" />
            <TipItem title="糸のよじれを防ぐ" desc="数ステッチごとに針を宙に垂らすと、糸が自然にほぐれます。" />
            <TipItem title="明るい照明を使う" desc="自然光または昼白色LEDランプを使うと目の疲れを防ぎ、似た色の糸を区別しやすくなります。" />
            <TipItem title="糸端の始末" desc="糸の始まりと終わりは布の裏側で3〜4目の下に通して固定します。結び目を作らないのが基本です。" />
            <TipItem title="同じ色はまとめて刺す" desc="1色をまとめて刺し終えてから次の色に移ると、糸替えの回数が減り効率よく作業できます。" />
          </ul>
        </div>
      </section>

      <section id="section-8">
        <SectionLabel num={8} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">糸の保管方法</h2>
        <div className="prose-content">
          <p>
            DMC糸は色数が増えるほど管理が難しくなります。
            最初から体系的に整理しておくと、作業時間を大幅に短縮できます。
          </p>
          <ul className="mt-4 space-y-3 text-[14px] text-warm-500 font-light leading-relaxed">
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">ボビンに巻く</strong> — 厚紙やプラスチックのボビンに糸を巻き、DMC番号を記入しておくと色を一目で確認できます。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">色系統別にジッパーバッグで分類</strong> — 赤・青・緑などの色系ごとにジッパーバッグに分けておくと探しやすくなります。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">番号を必ず記録</strong> — ラベルを外す前に必ずDMC番号をメモしてください。番号を失うと似た色の判別が非常に困難になります。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">直射日光を避ける</strong> — 刺繍糸は長時間紫外線にさらされると色褪せします。引き出しや不透明なケースに保管してください。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">在庫リストを作る</strong> — 持っているDMC番号をスプレッドシートに記録しておくと、新しい図案を入手したときに必要な糸をすぐ把握できます。</span></li>
          </ul>
        </div>
      </section>

      <section id="section-9">
        <SectionLabel num={9} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">大きな図案の攻略法</h2>
        <div className="prose-content">
          <p>
            100マス以上の大型図案には最初から体系的なアプローチが必要です。
            計画なしに端から始めると、途中で布が足りなくなったりグリッドの位置を見失ったりしがちです。
          </p>
          <ul className="mt-4 space-y-3 text-[14px] text-warm-500 font-light leading-relaxed">
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">中心から始める</strong> — 図案の中心を先に見つけて作業を開始しましょう。布を半分に折って中心を印してから刺し始めます。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">エリアに分割する</strong> — 図案を10×10または20×20マスのブロックに分け、1ブロックずつ完成させます。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">進捗を記録する</strong> — 印刷した図案のコピーに完成したエリアを蛍光ペンでマークすると位置を見失いません。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">1色を仕上げてから移動</strong> — 同じ色をそのエリア全体に先に刺してから次の色に移ると糸の無駄を減らせます。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">布の余白を十分に取る</strong> — 大型図案では布の四方に最低7〜10cmの余白を残してください。額装やフレーム仕上げに必要です。</span></li>
          </ul>
        </div>
      </section>

      <section id="section-10">
        <SectionLabel num={10} />
        <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">PDF図案の印刷のコツ</h2>
        <div className="prose-content">
          <p>
            Stitch Pattern MakerからエクスポートされたPDFは印刷すればすぐ使えます。
            正しい設定で印刷することで、グリッドの寸法が正確に合い作業がしやすくなります。
          </p>
          <ul className="mt-4 space-y-3 text-[14px] text-warm-500 font-light leading-relaxed">
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">印刷倍率は100%（実際のサイズ）</strong> — 「ページに合わせる」オプションは使わないでください。グリッドの寸法が変わってしまいます。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">A4用紙基準</strong> — 大きな図案は複数ページに分割されて出力されます。各シートにページ番号が印刷されるので、正しい順番でつなげてください。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">白黒印刷でも問題なし</strong> — 各マスに色記号が入っているので、モノクロ印刷でも十分読めます。インクを節約したい場合は白黒モードを活用しましょう。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">ラミネート加工がおすすめ</strong> — ラミネートすると長期間使用しても折れたり破れたりしません。作業中の湿気や水濡れにも強くなります。</span></li>
            <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">拡大印刷</strong> — 記号が見づらい場合は120〜150%で拡大印刷し、グリッドサイズに合わせてカウント数を調整してください。</span></li>
          </ul>
          <Tip>
            複数ページの図案はテープでつなぐ前にページ番号を確認し、グリッドが正しくつながっているか確認してください。
          </Tip>
        </div>
      </section>

      <section id="faq" className="pt-4">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light">FAQ</span>
          <div className="h-px flex-1 bg-linen-300/30" />
        </div>
        <h2 className="font-playfair text-[26px] text-warm-700 mb-7 leading-snug">よくある質問</h2>
        <div className="space-y-3">
          {jaFaqItems.map(({ q, a }) => (
            <details key={q} className="group bg-linen-50/70 border border-linen-300/25 rounded-card overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-[14px] text-warm-600 font-normal list-none hover:bg-linen-100/50 transition-colors">
                <span>{q}</span>
                <span className="text-sage-400 text-lg leading-none ml-4 flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
              </summary>
              <div className="px-6 pb-5 pt-1 text-[13px] text-warm-500 font-light leading-relaxed border-t border-linen-300/20">{a}</div>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-10 p-8 bg-gradient-to-br from-linen-100/60 to-linen-200/40 border border-linen-300/25 rounded-panel text-center">
        <p className="font-cormorant text-[22px] italic text-warm-600 mb-2">最初の図案を作ってみませんか？</p>
        <p className="text-[13px] text-warm-400 font-light mb-6">写真をアップロードするだけで、DMC糸番号が割り当てられたクロスステッチ図案が無料で作れます。</p>
        <Link href="/ja" className="inline-flex items-center gap-2 px-7 py-3 bg-warm-600 text-linen-50 text-sm font-light tracking-wide rounded-btn no-underline hover:bg-warm-500 transition-colors duration-200">
          無料で図案を作る
        </Link>
      </div>

    </article>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function LocaleGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const m = META[locale as SupportedLocale] ?? META.ko
  const isJa = locale === 'ja'
  const tocItems = isJa ? jaTocItems : koTocItems

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: m.jsonLdHeadline,
        description: m.jsonLdDescription,
        author: { '@type': 'Organization', name: 'Stitch Pattern Maker' },
        publisher: { '@type': 'Organization', name: 'Stitch Pattern Maker' },
        datePublished: '2024-01-01',
        dateModified: '2025-05-01',
        inLanguage: m.articleLang,
      },
      {
        '@type': 'FAQPage',
        mainEntity: (isJa ? jaFaqItems : koFaqItems).map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: m.breadcrumb.home, item: `${SITE_URL}/${locale}` },
          { '@type': 'ListItem', position: 2, name: m.breadcrumb.guide, item: `${SITE_URL}/${locale}/guide` },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 md:px-9 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 py-5 text-[11px] text-warm-400 font-light">
          <Link href={`/${locale}`} className="hover:text-warm-600 transition-colors">{m.breadcrumb.home}</Link>
          <span>/</span>
          <span className="text-warm-600">{m.breadcrumb.guide}</span>
        </nav>

        {/* Hero */}
        <header className="mb-14">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light">
              {isJa ? '入門ガイド' : 'Beginner\'s Guide'}
            </span>
            <div className="h-px w-10 bg-sage-400/50" />
          </div>
          <h1 className="font-playfair text-[36px] md:text-[44px] leading-[1.15] text-warm-700
                         tracking-[-0.01em] mb-5">
            {isJa ? 'クロスステッチ完全入門ガイド' : '십자수 완전 입문 가이드'}
          </h1>
          <p className="font-cormorant text-[18px] italic font-light text-warm-500
                        leading-[1.8] max-w-2xl">
            {isJa
              ? '道具選びから大きな図案を仕上げるコツまで — すぐに役立つ情報だけをまとめました。'
              : '준비물 고르는 법부터 큰 도안을 완성하는 요령까지 — 실제 작업에 바로 쓸 수 있는 정보만 모았습니다.'}
          </p>

          {/* Table of contents */}
          <div className="mt-9 p-6 bg-linen-50/80 border border-linen-300/25 rounded-card">
            <p className="text-[10px] uppercase tracking-[0.14em] text-sage-400 mb-4">
              {isJa ? '目次' : '목차'}
            </p>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 list-none">
              {tocItems.map((title, i) => (
                <li key={title} className="flex items-baseline gap-2">
                  <span className="text-[10px] text-sage-400 tabular-nums w-4 flex-shrink-0">{i + 1}</span>
                  <a
                    href={`#section-${i + 1}`}
                    className="text-[13px] text-warm-500 font-light hover:text-warm-700
                               transition-colors no-underline leading-snug"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </header>

        {isJa ? <JaGuideContent /> : <KoGuideContent />}
      </main>

      <footer className="border-t border-linen-300/20 py-8 text-center">
        <p className="text-[11px] text-warm-400 font-light">
          © 2026 Stitch Pattern Maker —{' '}
          <Link href="/dmc-colors" className="hover:text-warm-600 transition-colors">
            {isJa ? 'DMCカラーチャート' : 'DMC 색상표'}
          </Link>
          {' · '}
          <Link href={`/${locale}/guide`} className="hover:text-warm-600 transition-colors">
            {isJa ? 'ガイド' : '가이드'}
          </Link>
        </p>
      </footer>
    </div>
  )
}
