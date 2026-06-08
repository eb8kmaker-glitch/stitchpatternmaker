import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { SectionLabel, Tip, PrepItem, TipItem, MaterialCard } from '@/components/guide/GuideShared'

const SITE_URL = 'https://stitchpatternmaker.app'

export const metadata: Metadata = {
  title: "Cross Stitch Beginner's Guide — Tools, DMC Threads & Pattern Tips",
  description:
    "Everything you need to start cross stitching: choosing fabric and needles, reading DMC thread numbers, understanding pattern grids, managing thread colors, and printing PDF patterns.",
  keywords: [
    'cross stitch guide', 'cross stitch for beginners', 'DMC thread numbers',
    'aida cloth', 'cross stitch supplies', 'embroidery pattern guide',
  ],
  openGraph: {
    title: "Cross Stitch Beginner's Guide | Stitch Pattern Maker",
    description: "From supplies to PDF printing — a complete practical guide for cross stitch beginners.",
    type: 'article',
    locale: 'en_US',
    images: [
      {
        url:    `${SITE_URL}/og-image.png`,
        width:  1200,
        height: 630,
        alt:    'Stitch Pattern Maker — Free photo to cross stitch pattern generator',
      },
    ],
  },
  twitter: {
    card:   'summary_large_image',
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/guide`,
    languages: {
      'en':        `${SITE_URL}/guide`,
      'ko':        `${SITE_URL}/ko/guide`,
      'ja':        `${SITE_URL}/ja/guide`,
      'x-default': `${SITE_URL}/guide`,
    },
  },
}

const faqItems = [
  {
    q: 'Which needle size should I use?',
    a: 'For 14-count Aida fabric, a size 24 or 26 tapestry needle is ideal. The blunt tip glides through the holes without splitting the fabric threads. Use a larger number (smaller needle) as the fabric count increases.',
  },
  {
    q: 'How many thread strands do I use?',
    a: 'DMC stranded cotton comes as 6 strands twisted together. Two strands are standard for 14-count Aida; use three for better coverage, or one strand for 18-count and above.',
  },
  {
    q: 'How do I calculate the fabric size I need?',
    a: 'Divide the stitch count by the fabric count to get the finished size in inches (then multiply by 2.54 for cm). Example: a 50-stitch pattern on 14-count Aida ≈ 9 cm (3.5 in). Always add 5–7 cm of border on each side.',
  },
  {
    q: 'What pattern size is right for a first project?',
    a: 'Aim for 30×30 to 50×50 stitches with no more than 5 colors. This produces a small finished piece of 5–9 cm that can be completed in 2–4 hours — perfect for building confidence.',
  },
  {
    q: 'How do I use a pattern from Stitch Pattern Maker?',
    a: 'Export the pattern as a PDF and print at 100% scale on A4 paper. The PDF includes the DMC thread list, color symbols, and a numbered grid so you can start stitching right away.',
  },
  {
    q: "What's the difference between cross stitch and regular embroidery?",
    a: 'Cross stitch places X-shaped stitches on a grid, one square at a time. Because the pattern is already mapped to a grid, no drawing skill is required — just follow the color chart square by square.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: "Cross Stitch Beginner's Guide",
      description: "Everything you need to start cross stitching: supplies, DMC threads, pattern reading, and PDF printing tips.",
      author: { '@type': 'Organization', name: 'Stitch Pattern Maker' },
      publisher: { '@type': 'Organization', name: 'Stitch Pattern Maker' },
      datePublished: '2024-01-01',
      dateModified: '2025-05-01',
      inLanguage: 'en',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqItems.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Guide', item: `${SITE_URL}/guide` },
      ],
    },
  ],
}

const tocItems = [
  { num: '1',   title: 'What is Cross Stitch?',                     anchor: 'section-1'  },
  { num: '2',   title: 'Basic Supplies',                            anchor: 'section-2'  },
  { num: '2-1', title: 'Where to Buy Supplies',                     anchor: 'section-2b' },
  { num: '3',   title: 'Reading DMC Thread Numbers',                anchor: 'section-3'  },
  { num: '4',   title: 'Reading a Pattern',                         anchor: 'section-4'  },
  { num: '5',   title: 'Why More Colors Means More Difficulty',     anchor: 'section-5'  },
  { num: '6',   title: 'Recommended Pattern Size for Beginners',   anchor: 'section-6'  },
  { num: '7',   title: 'Stitching Tips',                           anchor: 'section-7'  },
  { num: '8',   title: 'Storing Your Thread',                      anchor: 'section-8'  },
  { num: '9',   title: 'Working on Large Patterns',                anchor: 'section-9'  },
  { num: '10',  title: 'Printing Your PDF Pattern',                anchor: 'section-10' },
]

export default function GuidePage() {
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
          <Link href="/" className="hover:text-warm-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-warm-600">Guide</span>
        </nav>

        {/* Hero */}
        <header className="mb-14">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light">
              Beginner&apos;s Guide
            </span>
            <div className="h-px w-10 bg-sage-400/50" />
          </div>
          <h1 className="font-playfair text-[36px] md:text-[44px] leading-[1.15] text-warm-700
                         tracking-[-0.01em] mb-5">
            Cross Stitch Complete Beginner&apos;s Guide
          </h1>
          <p className="font-cormorant text-[18px] italic font-light text-warm-500
                        leading-[1.8] max-w-2xl">
            From choosing supplies to finishing a large pattern —
            only the practical information you need to start stitching.
          </p>

          {/* Table of contents */}
          <div className="mt-9 p-6 bg-linen-50/80 border border-linen-300/25 rounded-card">
            <p className="text-[10px] uppercase tracking-[0.14em] text-sage-400 mb-4">Contents</p>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 list-none">
              {tocItems.map(({ num, title, anchor }) => (
                <li key={anchor} className="flex items-baseline gap-2">
                  <span className="text-[10px] text-sage-400 tabular-nums w-6 flex-shrink-0">{num}</span>
                  <a
                    href={`#${anchor}`}
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

        <article className="space-y-14">

          {/* Section 1 */}
          <section id="section-1">
            <SectionLabel num={1} />
            <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">
              What is Cross Stitch?
            </h2>
            <div className="prose-content">
              <p>
                Cross stitch is an embroidery technique where you place
                <strong className="text-warm-600"> X-shaped stitches</strong> on a grid,
                building up an image one square at a time. It has been practised across Asia,
                Europe, and the Middle East for centuries, and remains a popular hobby for
                decorative pieces, home décor, and handmade gifts.
              </p>
              <p>
                The biggest appeal is that <strong className="text-warm-600">anyone can start right away</strong>.
                Because the pattern is already mapped to a grid, you simply follow the color
                symbols square by square — no drawing ability or prior embroidery experience needed.
              </p>
              <p>
                Digital tools now make it possible to convert a photo directly into a cross stitch
                pattern, so you can stitch portraits, pets, landscapes, or any personal image.
                That is exactly what Stitch Pattern Maker does.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2">
            <SectionLabel num={2} />
            <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">
              Basic Supplies
            </h2>
            <div className="prose-content">
              <p className="mb-6">
                You only need four things to get started. Keep it simple for your first project.
              </p>
              <div className="space-y-5">
                <PrepItem
                  title="Embroidery thread"
                  badge="DMC 6-strand cotton"
                  desc="DMC stranded cotton is the most widely used thread worldwide. Each skein contains 6 twisted strands; split off 2–3 strands for stitching. Because DMC uses the same color numbers globally, any pattern you download will match the thread you buy in your local shop."
                />
                <PrepItem
                  title="Tapestry needle"
                  badge="Size 24–26 recommended"
                  desc="Use a blunt-tipped tapestry needle — the rounded point pushes through the fabric holes without splitting the weave. Size 24 or 26 works well for 14-count Aida; move to a finer needle as the fabric count increases."
                />
                <PrepItem
                  title="Aida fabric"
                  badge="14-count for beginners"
                  desc="Aida is a woven fabric with an evenly spaced grid of holes, making it easy to see exactly where each stitch goes. The 'count' tells you how many grid squares fit in one inch — 14-count is the standard starting point for most beginners."
                />
                <PrepItem
                  title="Embroidery hoop"
                  badge="10–15 cm diameter"
                  desc="A hoop keeps the fabric taut so your stitches lie flat and even. Start with a 10–15 cm bamboo or plastic hoop. Larger projects can use bigger hoops or a frame to hold the fabric."
                />
              </div>
            </div>
          </section>

          {/* Section 2b — Where to Buy Supplies */}
          <section id="section-2b">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="px-2 h-6 rounded-full bg-sage-400/20 border border-sage-400/30
                               flex items-center justify-center text-[10px] text-sage-500 tabular-nums">
                2-1
              </span>
              <div className="h-px w-8 bg-sage-400/40" />
            </div>
            <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">
              Where to Buy Supplies
            </h2>
            <div className="prose-content">
              <p className="mb-6">
                These are Amazon picks to get you started. Each item matches the supplies described above.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MaterialCard
                  title="DMC Embroidery Floss Set"
                  desc="The global standard. Matches DMC numbers in any pattern."
                  link={{ href: 'https://www.amazon.com/s?k=DMC+embroidery+floss+set', text: 'View on Amazon →' }}
                />
                <MaterialCard
                  title="Embroidery Hoop Set (15–20cm)"
                  desc="Keeps fabric taut for cleaner, more accurate stitching."
                  link={{ href: 'https://www.amazon.com/s?k=embroidery+hoop+set', text: 'View on Amazon →' }}
                />
                <MaterialCard
                  title="Aida Cloth 14ct"
                  desc="Beginner standard. Clear grid makes needle placement easy."
                  link={{ href: 'https://www.amazon.com/s?k=aida+cloth+14+count', text: 'View on Amazon →' }}
                />
                <MaterialCard
                  title="Cross Stitch Needle Set (Tapestry)"
                  desc="Blunt tip won't snag fabric. Size 24–26 for 14ct Aida."
                  link={{ href: 'https://www.amazon.com/s?k=cross+stitch+needle+tapestry', text: 'View on Amazon →' }}
                />
              </div>
              {/* TODO: Replace with Amazon Associates affiliate links */}
              <p className="text-[11px] text-warm-300 font-light mt-5 leading-relaxed">
                These are Amazon Associates affiliate links. I may earn a small commission at no extra cost to you.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3">
            <SectionLabel num={3} />
            <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">
              Reading DMC Thread Numbers
            </h2>
            <div className="prose-content">
              <p>
                DMC assigns a unique number to every color they produce.
                You do not need to memorize them, but understanding the broad groupings
                makes buying thread much easier.
              </p>
              <ul className="mt-4 space-y-2.5 text-[14px] text-warm-500 font-light leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-sage-400 font-normal mt-0.5">·</span>
                  <span><strong className="text-warm-600">blanc / ecru</strong> — Named instead of numbered. Blanc is pure white; ecru is a warm ivory.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage-400 font-normal mt-0.5">·</span>
                  <span><strong className="text-warm-600">100–400s</strong> — Bright pinks, reds, blues, and greens.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage-400 font-normal mt-0.5">·</span>
                  <span><strong className="text-warm-600">500–900s</strong> — Mid-tone colors: greens, blues, naturals.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage-400 font-normal mt-0.5">·</span>
                  <span><strong className="text-warm-600">3000s</strong> — Extended palette with hundreds of subtle shades, ideal for gradients.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage-400 font-normal mt-0.5">·</span>
                  <span><strong className="text-warm-600">310 (Black)</strong> — The most commonly used color. Essential for outlines and shadows.</span>
                </li>
              </ul>
              <Tip>
                Just search the DMC number in any craft shop or online retailer to find the exact thread.{' '}
                <Link href="/dmc-colors" className="text-sage-500 hover:text-sage-600 ml-1">
                  Browse the full DMC color chart →
                </Link>
              </Tip>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4">
            <SectionLabel num={4} />
            <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">
              Reading a Pattern
            </h2>
            <div className="prose-content">
              <p>
                A cross stitch pattern is a grid where each square represents one stitch.
                Squares are filled with color, a symbol, or both,
                telling you which thread color to use at that position.
              </p>
              <h3 className="font-cormorant text-[19px] text-warm-600 mt-6 mb-3">Elements of a pattern</h3>
              <ul className="space-y-2.5 text-[14px] text-warm-500 font-light leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-sage-400 mt-0.5">·</span>
                  <span><strong className="text-warm-600">Color key</strong> — A legend listing each symbol alongside its DMC number. Usually placed beside or below the grid.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage-400 mt-0.5">·</span>
                  <span><strong className="text-warm-600">Grid numbers</strong> — Labels every 10 stitches so you can quickly locate your current position on the pattern.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage-400 mt-0.5">·</span>
                  <span><strong className="text-warm-600">Thread list</strong> — A complete list of DMC numbers used, with an estimated amount (in skeins) for each color.</span>
                </li>
              </ul>
              <Tip>
                Before you start stitching, gather all the threads listed. Running out mid-project
                and hunting for a specific DMC number is frustrating — stock up first.
              </Tip>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5">
            <SectionLabel num={5} />
            <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">
              Why More Colors Means More Difficulty
            </h2>
            <div className="prose-content">
              <p>
                The color count in a pattern directly affects how challenging the project is.
                More colors means more thread changes, harder-to-distinguish similar shades,
                and more complex thread management.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: 'Beginner', count: '5–10', desc: 'Simple, bold patterns. Quick to finish.', color: 'bg-sage-400/15 border-sage-400/30' },
                  { label: 'Intermediate', count: '15–30', desc: 'Gradients and finer detail possible.', color: 'bg-linen-200/60 border-linen-300/30' },
                  { label: 'Advanced', count: '40+', desc: 'Photo-realistic color reproduction.', color: 'bg-warm-400/10 border-warm-400/20' },
                ].map(item => (
                  <div key={item.label} className={`p-4 rounded-card border ${item.color}`}>
                    <div className="text-[10px] uppercase tracking-widest text-sage-500 mb-1">{item.label}</div>
                    <div className="font-cormorant text-[22px] text-warm-700 mb-1.5">{item.count}</div>
                    <p className="text-[12px] text-warm-400 font-light leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5">
                In Stitch Pattern Maker you can set anywhere from 5 to 60 colors.
                Start with 10–20 and increase the count once you are comfortable with the process.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6">
            <SectionLabel num={6} />
            <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">
              Recommended Pattern Size for Beginners
            </h2>
            <div className="prose-content">
              <p>
                The stitch count determines both the physical size of the finished piece
                and how long it takes to complete.
                Start small so you can experience the satisfaction of finishing.
              </p>
              <h3 className="font-cormorant text-[19px] text-warm-600 mt-6 mb-3">Size calculation</h3>
              <div className="p-5 bg-linen-100/50 border border-linen-300/25 rounded-card text-[13px] text-warm-500 font-light">
                <p className="mb-2">
                  <strong className="text-warm-600">Finished size (cm)</strong> = stitch count ÷ fabric count × 2.54
                </p>
                <ul className="space-y-1.5 mt-3">
                  <li>· 50×50 stitches, 14-count → approx. 9×9 cm</li>
                  <li>· 100×100 stitches, 14-count → approx. 18×18 cm</li>
                  <li>· 150×200 stitches, 14-count → approx. 27×36 cm</li>
                </ul>
              </div>
              <p className="mt-5">
                <strong className="text-warm-600">Recommended first project: 30×30 to 50×50 stitches.</strong>{' '}
                The finished piece will be roughly 5–9 cm — postcard-sized and completable in 2–4 hours.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="section-7">
            <SectionLabel num={7} />
            <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">
              Stitching Tips
            </h2>
            <div className="prose-content">
              <ul className="space-y-4 text-[14px] text-warm-500 font-light leading-relaxed">
                <TipItem title="Cut thread to 40–50 cm" desc="Longer thread tangles and wears thin. An arm's length (40–50 cm) is the sweet spot." />
                <TipItem title="Keep your X consistent" desc="Always cross the top stitch in the same direction (e.g., always top-right). A uniform crossing direction makes the finished piece look neat and professional." />
                <TipItem title="Prevent thread twist" desc="Every few stitches, let your needle hang freely and spin — the thread will untwist on its own." />
                <TipItem title="Good lighting" desc="Natural daylight or a cool-white LED lamp prevents eye strain and makes it easier to distinguish similar thread colors." />
                <TipItem title="Secure thread ends" desc="Weave the thread tail under 3–4 stitches on the back of the fabric. Avoid knots — they create uneven bumps on the front." />
                <TipItem title="Work one color at a time" desc="Complete all stitches of a single color before switching to the next. It reduces thread changes and speeds up the project." />
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section id="section-8">
            <SectionLabel num={8} />
            <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">
              Storing Your Thread
            </h2>
            <div className="prose-content">
              <p>
                A growing thread collection becomes hard to manage without a system.
                Organize from the start and you will save significant time on every project.
              </p>
              <ul className="mt-4 space-y-3 text-[14px] text-warm-500 font-light leading-relaxed">
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Bobbins</strong> — Wind each skein onto a plastic or card bobbin and write the DMC number on it.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Zip bags by color family</strong> — Group reds, blues, greens, etc. into separate zip-lock bags for quick searching.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Note the number first</strong> — Before removing the paper band from a skein, write the DMC number down. Similar shades are nearly impossible to identify without the label.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Avoid direct sunlight</strong> — Thread fades with prolonged UV exposure. Store in a drawer or opaque box.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Keep an inventory</strong> — A simple spreadsheet of DMC numbers you own makes it easy to see what you need to buy for a new pattern.</span></li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section id="section-9">
            <SectionLabel num={9} />
            <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">
              Working on Large Patterns
            </h2>
            <div className="prose-content">
              <p>
                Patterns over 100 stitches wide need a structured approach.
                Starting from one corner without a plan often leads to misaligned sections or running out of fabric.
              </p>
              <ul className="mt-4 space-y-3 text-[14px] text-warm-500 font-light leading-relaxed">
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Start from the centre</strong> — Fold the fabric in half twice to locate the centre, mark it, then begin stitching outward.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Divide into sections</strong> — Break the pattern into 10×10 or 20×20 stitch blocks and complete one block at a time.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Track your progress</strong> — Highlight or check off completed sections on a printed copy of the pattern.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Finish a color per section</strong> — Work all stitches of one color within a section before moving on, to minimize thread waste.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Generous borders</strong> — Leave at least 7–10 cm of unstitched fabric on each side for framing or finishing.</span></li>
              </ul>
            </div>
          </section>

          {/* Section 10 */}
          <section id="section-10">
            <SectionLabel num={10} />
            <h2 className="font-playfair text-[26px] text-warm-700 mb-5 leading-snug">
              Printing Your PDF Pattern
            </h2>
            <div className="prose-content">
              <p>
                Patterns exported from Stitch Pattern Maker are PDF files ready for printing.
                The right settings ensure the grid lines up perfectly with your fabric count.
              </p>
              <ul className="mt-4 space-y-3 text-[14px] text-warm-500 font-light leading-relaxed">
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Print at 100% / actual size</strong> — Never use &quot;fit to page&quot; — it rescales the grid and the measurements will be wrong.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">A4 paper</strong> — Large patterns tile across multiple pages with page numbers printed on each sheet.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Black-and-white works</strong> — Each cell contains a symbol, so a monochrome print is perfectly readable and saves ink.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Laminate if possible</strong> — A laminated sheet survives moisture, repeated handling, and accidental spills during long projects.</span></li>
                <li className="flex gap-3"><span className="text-sage-400 mt-0.5">·</span><span><strong className="text-warm-600">Enlarging</strong> — If the symbols are hard to read, print at 120–150% and use a correspondingly lower fabric count so the stitch count still works out.</span></li>
              </ul>
              <Tip>
                For multi-page patterns, check the page numbers before taping the sheets together
                and verify that the grid lines up at every join.
              </Tip>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="pt-4">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light">FAQ</span>
              <div className="h-px flex-1 bg-linen-300/30" />
            </div>
            <h2 className="font-playfair text-[26px] text-warm-700 mb-7 leading-snug">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqItems.map(({ q, a }) => (
                <details
                  key={q}
                  className="group bg-linen-50/70 border border-linen-300/25 rounded-card overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer
                                      text-[14px] text-warm-600 font-normal list-none
                                      hover:bg-linen-100/50 transition-colors">
                    <span>{q}</span>
                    <span className="text-sage-400 text-lg leading-none ml-4 flex-shrink-0
                                     group-open:rotate-45 transition-transform duration-200">+</span>
                  </summary>
                  <div className="px-6 pb-5 pt-1 text-[13px] text-warm-500 font-light leading-relaxed
                                  border-t border-linen-300/20">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="mt-10 p-8 bg-gradient-to-br from-linen-100/60 to-linen-200/40
                          border border-linen-300/25 rounded-panel text-center">
            <p className="font-cormorant text-[22px] italic text-warm-600 mb-2">
              Ready to stitch your first pattern?
            </p>
            <p className="text-[13px] text-warm-400 font-light mb-6">
              Upload a photo and get a DMC-mapped cross stitch pattern in seconds — free.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-3 bg-warm-600 text-linen-50
                         text-sm font-light tracking-wide rounded-btn no-underline
                         hover:bg-warm-500 transition-colors duration-200"
            >
              Generate a free pattern
            </Link>
          </div>

        </article>
      </main>

      <footer className="border-t border-linen-300/20 py-8 text-center">
        <p className="text-[11px] text-warm-400 font-light">
          © 2026 Stitch Pattern Maker —{' '}
          <Link href="/dmc-colors" className="hover:text-warm-600 transition-colors">DMC Color Chart</Link>
          {' · '}
          <Link href="/guide" className="hover:text-warm-600 transition-colors">Guide</Link>
        </p>
      </footer>
    </div>
  )
}
