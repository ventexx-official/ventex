import Link from "next/link";
import { BadgeCheck, ChartNoAxesCombined, Search } from "lucide-react";

const features = [
  {
    title: "Discover deals",
    description: "Browse startup pitches and surface opportunities by sector, stage, and signal.",
    icon: Search,
  },
  {
    title: "Verify identity",
    description: "Review founder profiles and platform context before starting serious conversations.",
    icon: BadgeCheck,
  },
  {
    title: "Track portfolio",
    description: "Keep interest, responses, and startup updates easier to follow from one place.",
    icon: ChartNoAxesCombined,
  },
];

const benefits = [
  {
    title: "Curated deal flow",
    description: "Access a growing pipeline of global startups with stage, sector, and traction context.",
  },
  {
    title: "Confidential diligence",
    description: "Request deeper founder details only after account verification and member checks.",
  },
  {
    title: "Founder contact readiness",
    description: "Save pitches, track follow-ups, and move serious conversations into the right workflow.",
  },
];

export default function InvestorsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-5">
          <h1 className="text-4xl font-black tracking-[-.04em] sm:text-5xl">
            For Investors
          </h1>
          <p className="text-base leading-7 text-[var(--text2)] sm:text-lg">
            Ventex helps investors find startup opportunities, understand founder context,
            and keep promising companies organized as they move from discovery to follow-up.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="border bg-[var(--bg2)] p-6"
                style={{ borderColor: "var(--border)" }}
              >
                <Icon className="h-5 w-5 text-[var(--text)]" />
                <h2 className="mt-5 text-lg font-black tracking-[-.02em]">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text3)]">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>

        <section className="mt-12 border-t pt-8" style={{ borderColor: "var(--border)" }}>
          <div className="mb-8 border bg-[var(--bg2)] p-5" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-xl font-black tracking-[-.03em]">Investor verification notice</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Ventex conducts identity verification for all investor accounts. You will be asked to complete KYC before accessing founder contact details or data rooms.
            </p>
            <p className="mt-3 text-sm font-bold text-[var(--text)]">Applications reviewed by Ventex team. Investor accounts are verified before activation.</p>
          </div>

          <h2 className="text-2xl font-black tracking-[-.03em]">
            Why join as investor
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="border bg-[var(--bg2)] p-5" style={{ borderColor: "var(--border)" }}>
                <h3 className="font-black">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{benefit.description}</p>
              </article>
            ))}
          </div>
        </section>

        <Link href="/signup?role=investor" className="btn-primary mt-10 inline-flex px-7 py-4 text-base">
          Join as investor
        </Link>
      </section>
    </main>
  );
}
