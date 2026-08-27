import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-lg tracking-wide text-paper"
        >
          SAIRAM USA <span className="brass-text">Reunion &rsquo;26</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-paper-dim">
          <Link href="/" className="transition-colors hover:text-paper">
            Home
          </Link>
          <Link href="/rsvp" className="transition-colors hover:text-paper">
            RSVP
          </Link>
          <Link
            href="/rsvp-list"
            className="transition-colors hover:text-paper"
          >
            RSVP List
          </Link>
        </nav>
      </div>
    </header>
  );
}
