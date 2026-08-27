import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = {
  first_name: string;
  last_name: string;
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

async function loadRsvps(): Promise<{ rows: Row[]; error?: string }> {
  try {
    const db = await getDb();
    const { rows } = await db.query(
      `select first_name, last_name, branch, confirmed, created_at from rsvps where first_name is not null and first_name != '' order by created_at desc`
    );
    return { rows };
  } catch {
    return { rows: [], error: "RSVPs aren't available yet — connect a database to start collecting them." };
  }
}

export default async function RsvpListPage() {
  const { rows, error } = await loadRsvps();
  const confirmedCount = rows.filter((r) => r.confirmed === "yes").length;

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
          ? `${rows.length} ${rows.length === 1 ? "response" : "responses"} \u00b7 ${confirmedCount} confirmed.`
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
