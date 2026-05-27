import Link from "next/link";

const events = [
  {
    name: "The Arena - Season 1, Episode 1",
    theme: "India's Next Big Idea",
    format: "5 founders x 5 minutes each",
    investorPanel: "To be announced",
    location: "Online (Live Stream)",
  },
  {
    name: "The Arena - Season 1, Episode 2",
    theme: "Deep Tech & AI Founders",
    format: "5 founders x 5 minutes each",
    investorPanel: "To be announced",
    location: "Online (Live Stream)",
  },
  {
    name: "The Arena - Season 1, Episode 3",
    theme: "SaaS & B2B Startups",
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
          className="relative overflow-hidden rounded-lg border border-amber-400/30 bg-[#120b08] p-5 text-white shadow-[0_0_40px_rgba(245,158,11,.12)]"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <h3 className="pr-16 text-lg font-black tracking-[-.02em]">{event.name}</h3>
            <span className="absolute right-4 top-4 rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-[10px] font-black text-amber-200">
              UPCOMING
            </span>
          </div>
          <p className="mt-4 text-sm font-bold text-amber-200">{event.theme}</p>
          <div className="mt-5 space-y-2 text-xs leading-5 text-orange-50/70">
            <p>Dates to be announced</p>
            <p>{event.format}</p>
            <p>Investor Panel: {event.investorPanel}</p>
            <p>{event.location}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/arena/apply" className="rounded-full bg-amber-300 px-4 py-2 text-xs font-black text-[#160b04]">
              Apply to Pitch
            </Link>
            <Link href="/arena#notify" className="rounded-full border border-amber-300/40 px-4 py-2 text-xs font-black text-amber-100">
              Get Notified
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
