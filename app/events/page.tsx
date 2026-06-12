import type { Metadata } from "next";
import Link from "next/link";
import ArenaEvents from "@/components/ArenaEvents";
import ArenaWaitlistForm from "@/components/ArenaWaitlistForm";
import JsonLd from "@/components/JsonLd";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
 title: "Events",
 description: "Upcoming Ventex events, including The Arena live startup pitch series.",
 alternates: { canonical: "/events" },
 openGraph: {
 title: "Events",
 description: "Upcoming Ventex events, including The Arena live startup pitch series.",
 url: "/events",
 type: "website",
 images: [OG_IMAGE_URL],
 },
};

export default function EventsPage() {
 return (
 <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
 <JsonLd data={{
 "@context": "https://schema.org",
 "@type": "Event",
 "name": "The Arena - Season 1",
 "description": "A monthly live pitch event where India's boldest founders pitch to real investors - live, raw, and on record.",
 "startDate": "2026-06-15T18:00:00+05:30",
 "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
 "eventStatus": "https://schema.org/EventScheduled",
 "location": {
 "@type": "VirtualLocation",
 "url": "https://ventexx.com/arena"
 },
 "organizer": {
 "@type": "Organization",
 "name": "Ventex",
 "url": "https://ventexx.com"
 }
 }} />
 <section className="mx-auto max-w-6xl px-4 py-16">
 <p className="mono text-xs font-black uppercase tracking-[.16em] text-[var(--text3)]">Events</p>
 <h1 className="mt-3 text-4xl font-black tracking-[-.04em] md:text-6xl">Ventex Events.</h1>
 <p className="mt-4 max-w-2xl text-lg text-[var(--text2)]">Where the ecosystem meets.</p>
 <Link href="/arena" className="mt-10 block rounded-lg border border-amber-400/30 bg-[#120b08] p-6 text-[var(--text)] shadow-[0_0_40px_rgba(245,158,11,.12)]">
 <span className="mono text-xs font-black uppercase tracking-[.16em] text-amber-200/70">Featured event</span>
 <h2 className="mt-3 text-3xl font-black">The Arena - Season 1</h2>
 <p className="mt-3 max-w-2xl text-sm leading-7 text-orange-50/75">A monthly live pitch event where India&apos;s boldest founders pitch to real investors - live, raw, and on record.</p>
 </Link>
 </section>

 <section className="mx-auto max-w-6xl px-4 pb-16">
 <h2 className="mb-6 text-2xl font-black">All upcoming events</h2>
 <ArenaEvents />
 </section>

 <section className="mx-auto max-w-6xl border-t px-4 py-12" style={{ borderColor: "var(--border)" }}>
 <h2 className="text-2xl font-black">Past events archive</h2>
 <p className="mt-3 text-sm text-[var(--text2)]">Past events archived here.</p>
 </section>

 <section className="bg-[#090504] px-4 py-12 text-[var(--text)]">
 <div className="mx-auto max-w-6xl">
 <h2 className="text-2xl font-black">Get event updates</h2>
 <div className="mt-5 max-w-3xl">
 <ArenaWaitlistForm />
 </div>
 </div>
 </section>
 </main>
 );
}