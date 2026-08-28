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
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement)
        .value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement)
        .value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      branch: (form.elements.namedItem("branch") as HTMLSelectElement).value,
      confirmed: (form.elements.namedItem("confirmed") as HTMLSelectElement)
        .value,
    };

    if (!data.email.trim() && !data.phone.trim()) {
      setStatus("error");
      setErrorMsg("Please provide at least an email or a phone number.");
      return;
    }

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
        <label htmlFor="firstName" className="text-sm text-paper-dim">
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          required
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none placeholder:text-paper-dim/60"
          placeholder="Your first name"
        />
      </div>

      <div>
        <label htmlFor="lastName" className="text-sm text-paper-dim">
          Last name
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none placeholder:text-paper-dim/60"
          placeholder="Your last name"
        />
      </div>

      <p className="text-xs text-paper-dim">
        Please provide at least one of email or phone &mdash; both are
        preferred so we can reach you.
      </p>

      <div>
        <label htmlFor="email" className="text-sm text-paper-dim">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none placeholder:text-paper-dim/60"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="text-sm text-paper-dim">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none placeholder:text-paper-dim/60"
          placeholder="Your phone number"
        />
      </div>

      <div>
        <label htmlFor="branch" className="text-sm text-paper-dim">
          Department
        </label>
        <select
          id="branch"
          name="branch"
          required
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none"
        >
          <option value="" disabled>
            Select your department
          </option>
          <option value="EEE">EEE</option>
          <option value="ECE">ECE</option>
          <option value="MECH">Mech</option>
        </select>
      </div>

      <div>
        <label htmlFor="confirmed" className="text-sm text-paper-dim">
          Are you confirmed to attend?
        </label>
        <select
          id="confirmed"
          name="confirmed"
          required
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-ink-2 px-4 py-3 text-paper outline-none"
        >
          <option value="" disabled>
            Select an option
          </option>
          <option value="yes">Yes, I&rsquo;m confirmed</option>
          <option value="maybe">Not sure yet</option>
          <option value="no">No, I can&rsquo;t make it</option>
        </select>
      </div>

      {status === "error" && (
        <p className="text-sm text-ember">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-brass px-7 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send RSVP"}
      </button>
    </form>
  );
}
