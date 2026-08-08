const LINKS = [
  { href: "/intel", label: "Pipeline" },
  { href: "/intel/clubs", label: "All clubs" },
  { href: "/intel/import", label: "Import" },
  { href: "/intel/auth", label: "Social login" },
] as const;

/** Hard navigations so CRM tabs still work if a browser extension breaks hydration. */
export function IntelNav({ current }: { current?: string }) {
  return (
    <nav className="mb-8 flex flex-wrap gap-1 border-b border-border/80 pb-3 text-sm">
      {LINKS.map((link) => {
        const active = current === link.href;
        return (
          <a
            key={link.href}
            href={link.href}
            className={
              active
                ? "rounded-[11px] bg-green-dark px-3 py-1.5 font-medium text-white"
                : "rounded-[11px] px-3 py-1.5 text-ink-muted transition-colors hover:bg-green-tint hover:text-ink"
            }
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
