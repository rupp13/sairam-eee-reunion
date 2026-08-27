"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function RsvpForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      branch: (form.elements.namedItem("branch") as HTMLSelectElement).value,
      guests: Number(
        (form.elements.namedItem("guests") as HTMLInputElement).value || 1
      ),
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit RSVP.");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-ink-2 p-8 text-center">
        <p className="font-display text-xl text-brass">You&rsquo;re on the list!</p>
        <p className="mt-2 text-paper-dim">
          Thanks for confirming &mdash; we&rsquo;ll see you in Dallas on
          October 24th.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="text-sm text-paper-dim">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none placeholder:text-paper-dim/60"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="text-sm text-paper-dim">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none placeholder:text-paper-dim/60"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="branch" className="text-sm text-paper-dim">
          Branch
        </label>
        <select
          id="branch"
          name="branch"
          required
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none"
        >
          <option value="" disabled>
            Select your branch
          </option>
          <option value="EEE">EEE</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
        </select>
      </div>

      <div>
        <label htmlFor="guests" className="text-sm text-paper-dim">
          Number attending (including you)
        </label>
        <input
          id="guests"
          name="guests"
          type="number"
          min={1}
          max={20}
          defaultValue={1}
          required
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none"
        />
      </div>

      <div>
        <label htmlFor="message" className="text-sm text-paper-dim">
          Message (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none placeholder:text-paper-dim/60"
          placeholder="Dietary notes, arrival time, anything else"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-ember">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-brass px-7 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Confirm your RSVP"}
      </button>
    </form>
  );
}
