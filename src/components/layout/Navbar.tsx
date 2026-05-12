import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-9 py-5
                    bg-linen-50/88 backdrop-blur-md border-b border-linen-300/20">
      {/* Brand */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2 font-cormorant text-xl tracking-wider text-warm-600">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0" />
          Cotton &amp; Bloom Studio
        </div>
        <p className="text-[9px] uppercase tracking-[0.14em] text-warm-400 font-light font-noto">
          Cross Stitch Pattern Maker
        </p>
      </div>

      {/* Links */}
      <ul className="flex items-center gap-7 list-none">
        {[
          { label: '갤러리',    href: '#' },
          { label: '가이드',    href: '#' },
          { label: 'DMC 색상표', href: '#' },
        ].map(link => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-xs text-warm-500 font-light tracking-wider
                         hover:text-warm-600 transition-colors duration-200
                         no-underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <button className="nav-cta px-5 py-2 bg-warm-600 text-linen-50 text-xs
                             rounded-pill border-none cursor-pointer
                             hover:bg-warm-500 transition-colors duration-200">
            무료 시작
          </button>
        </li>
      </ul>
    </nav>
  )
}
