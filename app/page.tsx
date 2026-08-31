import Image from "next/image";
import Link from "next/link";
import ScheduleTable, { type ScheduleItem } from "@/components/ScheduleTable";

// Add `description`, `photos` (array of image URLs), and/or `links` (array of
// { label, url }) to any row below to give it an expand arrow with more info.
// Rows without any of those render as a plain row, same as before.
const schedule: ScheduleItem[] = [
  {
    time: "9 AM – 12 Noon",
    activity: "Meet and Greet",
    location: "TMF Leadership Suite",
    address: "3705 Cedar Springs Road, Dallas, TX 75219",
    description:
      "2 flatscreens with Apple TV, whiteboard, and multi-level seating. The suite can accommodate roughly 25–30 people.",
    photos: [
      "https://framerusercontent.com/images/9FT3CAdSWLX3INcVTmfEBfLCAM.webp",
      "https://framerusercontent.com/images/pZelMrPOpduWZXbUwppWJYa62U.webp",
    ],
  },
  {
    time: "12 Noon – 1:30 PM",
    activity: "Lunch",
    location: "Gyanna Indian Restaurant",
    address: "1408–1410 Main St, Dallas, TX 75202",
  },
  {
    time: "2 PM – 4 PM",
    activity: "Event",
    location: "Game Show Battle Rooms",
    address: "4887 Alpha Rd #250, Farmers Branch, TX 75244",
    description: "Estimated cost $35–38 per person.",
    videoUrl: "https://youtu.be/zP6ilJ13Z_c",
    links: [
      { label: "Website", url: "https://gameshowbattlerooms.com/" },
    ],
  },
  {
    time: "5 PM – 8 PM",
    activity: "Dinner",
    location: "The Hampton Social – Dallas",
    address: "1520 Main St, Dallas, TX 75201",
  },
  {
    time: "8 PM – 9 PM",
    activity: "Send off and good bye",
    location: "—",
    address: "",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://framerusercontent.com/images/aw8q3YmtvOsP43QALPGMlxnmlo.jpg"
            alt="Dallas skyline at dusk"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/70 to-ink" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-16 sm:pt-36 sm:pb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-brass">
            Sai Ram Engineering College &middot; Reunion 1997&ndash;2001
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight text-paper sm:text-5xl">
            25th Year Re-Union &mdash; USA Event
          </h1>
          <p className="mt-4 font-display text-2xl text-brass sm:text-3xl">
            Oct 24, 2026 (Sat) &middot; Dallas, TX
          </p>
          <p className="mt-6 max-w-xl text-paper-dim">
            A warm gathering to reconnect with classmates, remember the labs
            and lecture halls, and celebrate the friendships that kept
            glowing long after graduation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/rsvp"
              className="inline-block rounded-full bg-brass px-7 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
            >
              Confirm your RSVP
            </Link>
            <Link
              href="/rsvp-list"
              className="inline-block rounded-full bg-brass px-7 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
            >
              See who&rsquo;s coming
            </Link>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-20">
        <h2 className="font-display text-3xl text-paper sm:text-4xl">
          Things we will do together{" "}
          <span className="text-paper-dim">(Suggested)</span>
        </h2>

        <ScheduleTable schedule={schedule} />
      </section>

      <div className="mx-auto max-w-5xl px-6">
        <div className="rule" />
      </div>

      {/* Milestone / Department / RSVP callout */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brass">
              Milestone
            </p>
            <p className="mt-3 text-paper-dim">
              Celebrating 25 years since 2001 batch walked out into the
              world.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brass">
              Department
            </p>
            <p className="mt-3 text-paper-dim">EEE, ECE, Mech</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brass">
              RSVP
            </p>
            <p className="mt-3 text-paper-dim">
              Let the group know if you&rsquo;re confirmed to attend the
              celebration.
            </p>
            <Link
              href="/rsvp"
              className="mt-4 inline-block text-sm font-medium text-brass underline underline-offset-4"
            >
              Confirm your RSVP &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
