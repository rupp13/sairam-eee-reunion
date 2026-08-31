"use client";

import { useState } from "react";

export type ScheduleLink = { label: string; url: string };

export type ScheduleItem = {
  time: string;
  activity: string;
  location: string;
  address: string;
  description?: string;
  photos?: string[];
  links?: ScheduleLink[];
  videoUrl?: string;
};

function getYouTubeEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  let videoId: string | null = null;
  if (parsed.hostname === "youtu.be") {
    videoId = parsed.pathname.slice(1);
  } else if (parsed.hostname.endsWith("youtube.com")) {
    if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v");
    } else if (parsed.pathname.startsWith("/embed/")) {
      videoId = parsed.pathname.slice("/embed/".length);
    }
  }

  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function rowHasDetails(row: ScheduleItem): boolean {
  return Boolean(row.description || row.photos?.length || row.links?.length || row.videoUrl);
}

export default function ScheduleTable({ schedule }: { schedule: ScheduleItem[] }) {
  // All rows with details start expanded; the arrow still lets you collapse one.
  const [expanded, setExpanded] = useState<Set<number>>(
    () => new Set(schedule.map((row, i) => (rowHasDetails(row) ? i : -1)).filter((i) => i !== -1))
  );

  function toggleRow(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="mt-10 space-y-3">
      {schedule.map((row, i) => {
        const embedUrl = row.videoUrl ? getYouTubeEmbedUrl(row.videoUrl) : null;
        const hasDetails = Boolean(
          row.description || row.photos?.length || row.links?.length || embedUrl
        );
        const isOpen = hasDetails && expanded.has(i);

        return (
          <div
            key={row.time}
            className="rounded-2xl border border-[var(--line)] bg-ink-2 p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-brass">
                  {row.time}
                </p>
                <p className="mt-1 text-base font-medium text-paper sm:text-lg">
                  {row.activity}
                </p>
                {row.location !== "—" && (
                  <p className="mt-1 text-sm text-paper-dim">
                    <span className="text-paper">{row.location}</span>
                    {row.address && (
                      <>
                        <br />
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-dotted underline-offset-2 hover:text-paper"
                        >
                          {row.address}
                        </a>
                      </>
                    )}
                  </p>
                )}
              </div>
              {hasDetails && (
                <button
                  type="button"
                  onClick={() => toggleRow(i)}
                  aria-expanded={isOpen}
                  aria-label={isOpen ? "Hide details" : "Show details"}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-brass transition-opacity hover:opacity-70"
                >
                  <ChevronIcon open={isOpen} />
                </button>
              )}
            </div>

            {isOpen && (
              <div className="mt-4 border-t border-[var(--line)] pt-4">
                {row.description && (
                  <p className="max-w-2xl text-sm text-paper-dim">
                    {row.description}
                  </p>
                )}
                {embedUrl && (
                  <div className="mt-4 aspect-video max-w-xl overflow-hidden rounded-lg">
                    <iframe
                      src={embedUrl}
                      title={`${row.activity} video`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
                {row.photos && row.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {row.photos.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element -- caller-provided photo host, not pre-registered with next/image
                      <img
                        key={src}
                        src={src}
                        alt={row.activity}
                        loading="lazy"
                        className="aspect-video w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
                {row.links && row.links.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {row.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-brass px-4 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-90"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
