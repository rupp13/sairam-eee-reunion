"use client";

import { useCallback, useEffect, useState } from "react";

type Photo = {
  guid: string;
  width: number;
  height: number;
  dateCreated: string;
  caption: string;
  thumbUrl: string;
  fullUrl: string;
};

export default function PhotosPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(false);
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("rsvp-list-secret");
    if (saved) unlock(saved);
  }, []);

  async function unlock(secretValue: string) {
    setAuthError("");
    setChecking(true);
    let res: Response;
    try {
      res = await fetch("/api/photos", {
        headers: { "x-rsvp-list-secret": secretValue },
      });
    } catch {
      setChecking(false);
      setAuthError("Could not reach the server. Check your connection and try again.");
      return;
    }

    if (res.status === 401) {
      sessionStorage.removeItem("rsvp-list-secret");
      setChecking(false);
      setAuthError("Incorrect password.");
      return;
    }

    // Any other response means the password was accepted.
    sessionStorage.setItem("rsvp-list-secret", secretValue);
    setAuthed(true);

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setDetail(json?.detail || "");
      setError(json?.error || "Could not load photos.");
      return;
    }
    setPhotos(json.photos);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    unlock(secret);
  }

  const closeViewer = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null || !photos) return;
    const count = photos.length;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") {
        setOpenIndex((i) => (i === null ? i : Math.min(i + 1, count - 1)));
      }
      if (e.key === "ArrowLeft") {
        setOpenIndex((i) => (i === null ? i : Math.max(i - 1, 0)));
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openIndex, photos, closeViewer]);

  if (!authed) {
    return (
      <section className="mx-auto max-w-sm px-6 py-24">
        <p className="text-xs uppercase tracking-[0.25em] text-brass">
          Photos
        </p>
        <h1 className="mt-3 font-display text-3xl text-paper">
          Enter password
        </h1>
        {checking ? (
          <p className="mt-8 text-paper-dim">
            Checking password&hellip; loading photos can take a few seconds
            for a large album.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none"
              autoFocus
            />
            {authError && <p className="text-sm text-ember">{authError}</p>}
            <button
              type="submit"
              className="w-full rounded-full bg-brass px-7 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
            >
              View photos
            </button>
          </form>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-brass">
            Photos
          </p>
          <h1 className="mt-3 font-display text-3xl text-paper sm:text-4xl">
            Reunion photo album
          </h1>
          {photos && (
            <p className="mt-2 text-sm text-paper-dim">
              {photos.length} {photos.length === 1 ? "photo" : "photos"}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="mt-1 cursor-not-allowed whitespace-nowrap rounded-full bg-brass px-4 py-1.5 text-xs font-medium text-ink opacity-50"
        >
          Open on iCloud
        </button>
      </div>

      {!photos && !error && (
        <p className="mt-8 text-paper-dim">Loading photos&hellip;</p>
      )}

      {error && (
        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-ink-2 p-6">
          <p className="text-paper-dim">Couldn&rsquo;t load photos right now.</p>
          {detail && (
            <p className="mt-3 break-words font-mono text-xs text-paper-dim/70">
              {detail}
            </p>
          )}
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="mt-4 inline-block cursor-not-allowed rounded-full bg-brass px-7 py-3 text-sm font-medium text-ink opacity-50"
          >
            View &amp; download photos
          </button>
        </div>
      )}

      {photos && photos.length === 0 && (
        <p className="mt-8 text-paper-dim">
          No photos in the album yet &mdash; check back soon.
        </p>
      )}

      {photos && photos.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <button
              key={photo.guid}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="relative aspect-square overflow-hidden rounded-xl border border-[var(--line)] bg-ink-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- external, unpredictable iCloud CDN host */}
              <img
                src={photo.thumbUrl}
                alt={photo.caption || "Reunion photo"}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {photos && openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeViewer}
        >
          <button
            type="button"
            onClick={closeViewer}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-ink-2 px-3 py-1.5 text-sm text-paper"
          >
            Close ✕
          </button>

          {openIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex(openIndex - 1);
              }}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink-2 px-3 py-2 text-lg text-paper sm:left-4"
            >
              ‹
            </button>
          )}
          {openIndex < photos.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex(openIndex + 1);
              }}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink-2 px-3 py-2 text-lg text-paper sm:right-4"
            >
              ›
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element -- external, unpredictable iCloud CDN host */}
          <img
            src={photos[openIndex].fullUrl}
            alt={photos[openIndex].caption || "Reunion photo"}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
