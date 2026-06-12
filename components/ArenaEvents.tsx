import Link from "next/link";

const events = [
  {
    name: "The Arena - Season 1, Episode 1",
    label: "Season 1 Ep 1",
    theme: "India's Next Big Idea",
    format: "5 founders x 5 minutes each",
    investorPanel: "To be announced",
    location: "Online (Live Stream)",
  },
  {
    name: "The Arena - Season 1, Episode 2",
    label: "Season 1 Ep 2",
    theme: "Deep Tech & AI",
    format: "5 founders x 5 minutes each",
    investorPanel: "To be announced",
    location: "Online (Live Stream)",
  },
  {
    name: "The Arena - Season 1, Episode 3",
    label: "Season 1 Ep 3",
    theme: "SaaS & B2B",
    format: "5 founders x 5 minutes each",
    investorPanel: "To be announced",
    location: "Online (Live Stream)",
  },
];

export default function ArenaEvents({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${compact ? "lg:grid-cols-3" : "md:grid-cols-3"}`}>
      {events.map((event) => (
        <article
          key={event.name}
          className="relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-5 text-[var(--text)] shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <h3 className="pr-16 text-lg font-black tracking-[-.02em]">{event.label}</h3>
            <span className="absolute right-4 top-4 rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 text-[10px] font-black text-[var(--text)]">
              UPCOMING
            </span>
          </div>
          <p className="mt-4 text-sm font-bold text-[var(--text)]">{event.theme}</p>
          <div className="mt-5 space-y-2 text-xs leading-5 text-[var(--text2)]">
            <p>Season 1 dates will be announced. Stay tuned.</p>
            <p>{event.format}</p>
            <p>Investor Panel: {event.investorPanel}</p>
            <p>{event.location}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/arena#notify" className="rounded-full bg-[var(--text)] px-4 py-2 text-xs font-black text-[var(--bg)]">
              Notify Me
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
