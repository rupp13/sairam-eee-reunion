"use client";

import { useEffect, useState } from "react";

type Rsvp = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  branch: string;
  confirmed: string;
  created_at: string;
};

const BRANCHES = ["EEE", "ECE", "MECH"];
const CONFIRMED_OPTIONS = [
  { value: "yes", label: "Confirmed" },
  { value: "maybe", label: "Tentative" },
  { value: "no", label: "Can't make it" },
];

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Rsvp>>({});

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-secret");
    if (saved) {
      setSecret(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) loadRsvps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  async function loadRsvps() {
    setError("");
    const res = await fetch("/api/admin/rsvps", {
      headers: { "x-admin-secret": secret },
    });
    if (res.status === 401) {
      setAuthed(false);
      sessionStorage.removeItem("admin-secret");
      setError("Incorrect password.");
      return;
    }
    const json = await res.json();
    setRsvps(json.rsvps);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("admin-secret", secret);
    setAuthed(true);
  }

  function startEdit(r: Rsvp) {
    setEditingId(r.id);
    setDraft(r);
  }

  async function saveEdit(id: number) {
    const res = await fetch(`/api/admin/rsvps/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret,
      },
      body: JSON.stringify({
        firstName: draft.first_name,
        lastName: draft.last_name,
        email: draft.email,
        phone: draft.phone,
        branch: draft.branch,
        confirmed: draft.confirmed,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      loadRsvps();
    } else {
      const json = await res.json();
      setError(json.error || "Could not save changes.");
    }
  }

  async function deleteRsvp(id: number) {
    if (!confirm("Delete this RSVP? This can't be undone.")) return;
    const res = await fetch(`/api/admin/rsvps/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": secret },
    });
    if (res.ok) {
      loadRsvps();
    } else {
      const json = await res.json();
      setError(json.error || "Could not delete RSVP.");
    }
  }

  if (!authed) {
    return (
      <section className="mx-auto max-w-sm px-6 py-24">
        <p className="text-xs uppercase tracking-[0.25em] text-brass">Admin</p>
        <h1 className="mt-3 font-display text-3xl text-paper">Sign in</h1>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none"
            autoFocus
          />
          {error && <p className="text-sm text-ember">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-brass px-7 py-3 text-sm font-medium text-ink hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-brass">Admin</p>
      <h1 className="mt-3 font-display text-3xl text-paper">Manage RSVPs</h1>

      {error && <p className="mt-4 text-sm text-ember">{error}</p>}

      {rsvps === null ? (
        <p className="mt-8 text-paper-dim">Loading…</p>
      ) : rsvps.length === 0 ? (
        <p className="mt-8 text-paper-dim">No RSVPs yet.</p>
      ) : (
        <div className="mt-8 divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-ink-2">
          {rsvps.map((r) =>
            editingId === r.id ? (
              <div key={r.id} className="grid gap-3 px-5 py-4 sm:grid-cols-2">
                <input
                  value={draft.first_name ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, first_name: e.target.value })
                  }
                  placeholder="First name"
                  className="rounded-lg border border-[var(--line)] bg-ink px-3 py-2 text-paper outline-none"
                />
                <input
                  value={draft.last_name ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, last_name: e.target.value })
                  }
                  placeholder="Last name"
                  className="rounded-lg border border-[var(--line)] bg-ink px-3 py-2 text-paper outline-none"
                />
                <input
                  value={draft.email ?? ""}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  placeholder="Email"
                  type="email"
                  className="rounded-lg border border-[var(--line)] bg-ink px-3 py-2 text-paper outline-none"
                />
                <input
                  value={draft.phone ?? ""}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  placeholder="Phone number"
                  type="tel"
                  className="rounded-lg border border-[var(--line)] bg-ink px-3 py-2 text-paper outline-none"
                />
                <select
                  value={draft.branch ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, branch: e.target.value })
                  }
                  className="rounded-lg border border-[var(--line)] bg-ink px-3 py-2 text-paper outline-none"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <select
                  value={draft.confirmed ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, confirmed: e.target.value })
                  }
                  className="rounded-lg border border-[var(--line)] bg-ink px-3 py-2 text-paper outline-none"
                >
                  {CONFIRMED_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 sm:col-span-2">
                  <button
                    onClick={() => saveEdit(r.id)}
                    className="rounded-full bg-brass px-5 py-2 text-sm font-medium text-ink hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-full border border-[var(--line)] px-5 py-2 text-sm text-paper-dim hover:text-paper"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={r.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <span className="text-paper">
                    {r.first_name} {r.last_name}
                    <span className="ml-2 text-xs uppercase tracking-wide text-brass">
                      {r.branch}
                    </span>
                  </span>
                  <p className="mt-1 text-xs text-paper-dim">
                    {CONFIRMED_OPTIONS.find((c) => c.value === r.confirmed)
                      ?.label ?? r.confirmed}
                  </p>
                  {(r.email || r.phone) && (
                    <p className="mt-1 text-xs text-paper-dim">
                      {[r.email, r.phone].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(r)}
                    className="text-sm text-brass hover:opacity-80"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRsvp(r.id)}
                    className="text-sm text-ember hover:opacity-80"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}
