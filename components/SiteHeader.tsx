import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg tracking-wide text-paper">
          SAIRAM USA <span className="brass-text">Reunion &rsquo;26</span>
        </Link>

        {/* Desktop nav — hidden on mobile, replaced by the bottom tab bar */}
        <nav className="hidden items-center gap-2 text-sm sm:flex">
          <Link
            href="/"
            className="rounded-full border border-[var(--line)] px-4 py-1.5 text-paper-dim transition-colors hover:border-brass hover:text-paper"
          >
            Home
          </Link>
          <Link
            href="/rsvp"
            className="rounded-full border border-[var(--line)] px-4 py-1.5 text-paper-dim transition-colors hover:border-brass hover:text-paper"
          >
            RSVP
          </Link>
          <Link
            href="/rsvp-list"
            className="rounded-full border border-[var(--line)] px-4 py-1.5 text-paper-dim transition-colors hover:border-brass hover:text-paper"
          >
            RSVP List
          </Link>
          <Link
            href="/photos"
            className="rounded-full border border-[var(--line)] px-4 py-1.5 text-paper-dim transition-colors hover:border-brass hover:text-paper"
          >
            Photos
          </Link>
        </nav>
      </div>
    </header>
  );
}
