"use client";

import { useEffect, useState } from "react";

type Row = {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  branch: string | null;
  confirmed: string | null;
  created_at: string;
};

const CONFIRMED_LABEL: Record<string, string> = {
  yes: "Confirmed",
  maybe: "Tentative",
  no: "Can't make it",
};

const CONFIRMED_COLOR: Record<string, string> = {
  yes: "text-brass",
  maybe: "text-paper-dim",
  no: "text-ember",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RsvpListPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [secret, setSecret] = useState("");
  const [unlockError, setUnlockError] = useState("");

  useEffect(() => {
    loadPublic();

    const saved = sessionStorage.getItem("rsvp-list-secret");
    if (saved) unlock(saved);
  }, []);

  async function loadPublic() {
    setLoadError("");
    try {
      const res = await fetch("/api/rsvp-list");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load RSVPs.");
      setRows(json.rsvps);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load RSVPs."
      );
    }
  }

  async function unlock(secretValue: string) {
    setUnlockError("");
    const res = await fetch("/api/rsvp-list", {
      headers: { "x-rsvp-list-secret": secretValue },
    });
    if (res.status === 401) {
      sessionStorage.removeItem("rsvp-list-secret");
      setUnlockError("Incorrect password.");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setUnlockError(json.error || "Could not load contact info.");
      return;
    }
    sessionStorage.setItem("rsvp-list-secret", secretValue);
    setRows(json.rsvps);
    setUnlocked(true);
    setShowContact(false);
  }

  function handleUnlockSubmit(e: React.FormEvent) {
    e.preventDefault();
    unlock(secret);
  }

  function hideContact() {
    sessionStorage.removeItem("rsvp-list-secret");
    setUnlocked(false);
    setSecret("");
    loadPublic();
  }

  const confirmedCount = (rows ?? []).filter((r) => r.confirmed === "yes").length;

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-brass">
            RSVP List
          </p>
          <h1 className="mt-3 font-display text-3xl text-paper sm:text-4xl">
            Who&rsquo;s coming
          </h1>
        </div>

        {unlocked ? (
          <button
            onClick={hideContact}
            className="mt-1 whitespace-nowrap text-xs text-paper-dim underline decoration-dotted hover:text-paper"
          >
            Hide contact info
          </button>
        ) : (
          <button
            onClick={() => setShowContact((v) => !v)}
            className="mt-1 whitespace-nowrap text-xs text-brass hover:opacity-80"
          >
            Show contact info
          </button>
        )}
      </div>

      {!unlocked && showContact && (
        <form
          onSubmit={handleUnlockSubmit}
          className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-ink-2 p-3"
        >
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Password"
            className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-ink px-3 py-2 text-sm text-paper outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="rounded-full bg-brass px-4 py-2 text-xs font-medium text-ink hover:opacity-90"
          >
            Unlock
          </button>
          {unlockError && (
            <p className="w-full text-xs text-ember">{unlockError}</p>
          )}
        </form>
      )}

      {rows === null ? (
        <p className="mt-4 text-paper-dim">Loading&hellip;</p>
      ) : (
        <p className="mt-4 text-paper-dim">
          {rows.length > 0
            ? `${rows.length} ${rows.length === 1 ? "response" : "responses"} · ${confirmedCount} confirmed.`
            : "No RSVPs yet — be the first to confirm."}
        </p>
      )}

      {loadError && (
        <p className="mt-6 rounded-lg border border-[var(--line)] bg-ink-2 p-4 text-sm text-paper-dim">
          {loadError}
        </p>
      )}

      {rows && rows.length > 0 && (
        <div className="mt-10 divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-ink-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4">
              <div>
                <span className="text-paper">
                  {r.first_name} {r.last_name}
                  {r.branch && (
                    <span className="ml-2 text-xs uppercase tracking-wide text-brass">
                      {r.branch}
                    </span>
                  )}
                </span>
                <p className="mt-1 text-xs text-paper-dim">
                  RSVP&rsquo;d {formatDate(r.created_at)}
                </p>
                {(r.email || r.phone) && (
                  <p className="mt-1 text-xs text-paper-dim">
                    {[r.email, r.phone].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  r.confirmed ? CONFIRMED_COLOR[r.confirmed] ?? "text-paper-dim" : "text-paper-dim"
                }`}
              >
                {r.confirmed ? CONFIRMED_LABEL[r.confirmed] ?? r.confirmed : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
