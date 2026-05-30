import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-9 py-4 sm:py-5
                    bg-linen-50/88 backdrop-blur-md border-b border-linen-300/20">
      {/* Brand */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2 font-cormorant text-lg sm:text-xl tracking-wider text-warm-600">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0" />
          Stitch Pattern Maker
        </div>
        <p className="text-[9px] uppercase tracking-[0.14em] text-warm-400 font-light font-noto hidden sm:block">
          Cross Stitch Pattern Generator
        </p>
      </div>

      {/* Links */}
      <ul className="flex items-center gap-3 sm:gap-7 list-none">
        {[
          { label: '갤러리',    href: '/gallery' },
          { label: '가이드',    href: '/guide' },
          { label: 'DMC 색상표', href: '/dmc-colors' },
        ].map(link => (
          <li key={link.label} className="hidden sm:block">
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
          <Link
            href="/"
            className="px-4 sm:px-5 py-2 bg-warm-600 text-linen-50 text-xs
                       rounded-pill cursor-pointer no-underline
                       hover:bg-warm-500 transition-colors duration-200"
          >
            무료 시작
          </Link>
        </li>
      </ul>
    </nav>
  )
}
