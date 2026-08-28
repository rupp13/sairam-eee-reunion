"use client";

import { useEffect, useState } from "react";

const ALBUM_URL = "https://photos.icloud.com/shared/album/090SDXlcrJz11ZZBh6VYIszLg";

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
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("rsvp-list-secret");
    if (saved) unlock(saved);
  }, []);

  async function unlock(secretValue: string) {
    setAuthError("");
    let res: Response;
    try {
      res = await fetch("/api/photos", {
        headers: { "x-rsvp-list-secret": secretValue },
      });
    } catch {
      setAuthError("Could not reach the server. Check your connection and try again.");
      return;
    }

    if (res.status === 401) {
      sessionStorage.removeItem("rsvp-list-secret");
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

  if (!authed) {
    return (
      <section className="mx-auto max-w-sm px-6 py-24">
        <p className="text-xs uppercase tracking-[0.25em] text-brass">
          Photos
        </p>
        <h1 className="mt-3 font-display text-3xl text-paper">
          Enter password
        </h1>
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
        </div>
        <a
          href={ALBUM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 whitespace-nowrap rounded-full bg-brass px-4 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-90"
        >
          Open on iCloud
        </a>
      </div>

      {!photos && !error && (
        <p className="mt-8 text-paper-dim">Loading photos&hellip;</p>
      )}

      {error && (
        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-ink-2 p-6">
          <p className="text-paper-dim">
            Couldn&rsquo;t load photos right now. You can still view and
            download them directly on iCloud.
          </p>
          {detail && (
            <p className="mt-3 break-words font-mono text-xs text-paper-dim/70">
              {detail}
            </p>
          )}
          <a
            href={ALBUM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-brass px-7 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
          >
            View &amp; download photos
          </a>
        </div>
      )}

      {photos && photos.length === 0 && (
        <p className="mt-8 text-paper-dim">
          No photos in the album yet &mdash; check back soon.
        </p>
      )}

      {photos && photos.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <a
              key={photo.guid}
              href={photo.fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--line)] bg-ink-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- external, unpredictable iCloud CDN host */}
              <img
                src={photo.thumbUrl}
                alt={photo.caption || "Reunion photo"}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
