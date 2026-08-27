import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { name: string; branch: string | null; guests: number; created_at: string };

async function loadRsvps(): Promise<{ rows: Row[]; error?: string }> {
  try {
    const db = await getDb();
    const { rows } = await db.query(
      `select name, branch, guests, created_at from rsvps order by created_at desc`
    );
    return { rows };
  } catch {
    return { rows: [], error: "RSVPs aren't available yet — connect a database to start collecting them." };
  }
}

export default async function RsvpListPage() {
  const { rows, error } = await loadRsvps();
  const totalGuests = rows.reduce((sum, r) => sum + (r.guests || 0), 0);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-brass">
        RSVP List
      </p>
      <h1 className="mt-3 font-display text-3xl text-paper sm:text-4xl">
        Who&rsquo;s coming
      </h1>
      <p className="mt-4 text-paper-dim">
        {rows.length > 0
          ? `${rows.length} ${rows.length === 1 ? "RSVP" : "RSVPs"} confirmed \u00b7 ${totalGuests} total attending.`
          : "No RSVPs yet \u2014 be the first to confirm."}
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-[var(--line)] bg-ink-2 p-4 text-sm text-paper-dim">
          {error}
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-10 divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-ink-2">
          {rows.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-4"
            >
              <span className="text-paper">
                {r.name}
                {r.branch && (
                  <span className="ml-2 text-xs uppercase tracking-wide text-brass">
                    {r.branch}
                  </span>
                )}
              </span>
              <span className="text-sm text-paper-dim">
                {r.guests} {r.guests === 1 ? "guest" : "guests"}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
