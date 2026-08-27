"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/rsvp-list", label: "RSVP List" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg tracking-wide text-paper"
          onClick={() => setOpen(false)}
        >
          SAIRAM USA <span className="brass-text">Reunion &rsquo;26</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm text-paper-dim sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-paper sm:hidden"
        >
          {open ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <nav className="border-t border-[var(--line)] px-6 py-2 sm:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-base text-paper-dim transition-colors hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
