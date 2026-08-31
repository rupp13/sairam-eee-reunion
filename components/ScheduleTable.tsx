"use client";

import { Fragment, useState } from "react";

export type ScheduleLink = { label: string; url: string };

export type ScheduleItem = {
  time: string;
  activity: string;
  location: string;
  address: string;
  description?: string;
  photos?: string[];
  links?: ScheduleLink[];
};

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

export default function ScheduleTable({ schedule }: { schedule: ScheduleItem[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--line)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] bg-ink-2 text-xs uppercase tracking-wide text-brass">
            <th className="px-5 py-3 font-medium">Time</th>
            <th className="px-5 py-3 font-medium">Activity</th>
            <th className="px-5 py-3 font-medium">Location</th>
            <th className="w-12 px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, i) => {
            const hasDetails = Boolean(
              row.description || row.photos?.length || row.links?.length
            );
            const isOpen = hasDetails && expanded === i;
            const isLastRow = i === schedule.length - 1;

            return (
              <Fragment key={row.time}>
                <tr className={!isLastRow || isOpen ? "border-b border-[var(--line)]" : ""}>
                  <td className="px-5 py-4 align-top text-paper-dim">{row.time}</td>
                  <td className="px-5 py-4 align-top text-paper">{row.activity}</td>
                  <td className="px-5 py-4 align-top text-paper-dim">
                    {row.location !== "—" ? (
                      <>
                        <span className="text-paper">{row.location}</span>
                        <br />
                        {row.address && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-dotted underline-offset-2 hover:text-paper"
                          >
                            {row.address}
                          </a>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-4 align-top">
                    {hasDetails && (
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "Hide details" : "Show details"}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-brass transition-opacity hover:opacity-70"
                      >
                        <ChevronIcon open={isOpen} />
                      </button>
                    )}
                  </td>
                </tr>
                {isOpen && (
                  <tr className={!isLastRow ? "border-b border-[var(--line)]" : ""}>
                    <td colSpan={4} className="bg-ink-2 px-5 py-5">
                      {row.description && (
                        <p className="max-w-2xl text-sm text-paper-dim">
                          {row.description}
                        </p>
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
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
