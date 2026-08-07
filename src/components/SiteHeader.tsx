import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="ut-animate-fade-in border-b border-border/80 bg-bg-elevated/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-[11px] bg-green-dark text-sm font-semibold text-white transition-transform duration-300 group-hover:scale-[1.04]"
          >
            UT
          </span>
          <div className="leading-tight">
            <p className="ut-display text-[15px] font-extrabold text-ink">
              UwTornooi
            </p>
            <p className="text-xs text-ink-faint">Marketing ideas</p>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm text-ink-muted sm:gap-2">
          <Link
            href="/"
            className="rounded-[11px] px-3 py-2 transition-colors hover:bg-green-tint hover:text-ink"
          >
            Overview
          </Link>
          <a
            href="https://uwtornooi.be"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[11px] px-3 py-2 transition-colors hover:bg-green-tint hover:text-ink"
          >
            uwtornooi.be ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
