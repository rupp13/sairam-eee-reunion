import RsvpForm from "@/components/RsvpForm";

export default function RsvpPage() {
  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-brass">RSVP</p>
      <h1 className="mt-3 font-display text-3xl text-paper sm:text-4xl">
        Will you join us?
      </h1>
      <p className="mt-4 text-paper-dim">
        Share your name and let us know if you&rsquo;re confirmed to attend
        the Sai Ram 25 year reunion.
      </p>

      <div className="mt-10">
        <RsvpForm />
      </div>
    </section>
  );
}
