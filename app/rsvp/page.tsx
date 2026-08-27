import RsvpForm from "@/components/RsvpForm";

export default function RsvpPage() {
  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-brass">RSVP</p>
      <h1 className="mt-3 font-display text-3xl text-paper sm:text-4xl">
        Confirm your seat at the table
      </h1>
      <p className="mt-4 text-paper-dim">
        Oct 24, 2026 (Sat) &middot; TMF Leadership Suite, Dallas TX. Let us
        know you&rsquo;re coming so we can plan the day.
      </p>

      <div className="mt-10">
        <RsvpForm />
      </div>
    </section>
  );
}
