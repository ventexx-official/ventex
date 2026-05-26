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
  "Access a growing pipeline of Indian startups",
  "Review pitch context before requesting deeper diligence",
  "Connect with founders building software, products, and digital businesses",
  "Use one account for deal discovery and marketplace activity",
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
          <h2 className="text-2xl font-black tracking-[-.03em]">
            Investor benefits
          </h2>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-[var(--text2)] sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[var(--text)]" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        <Link href="/signup?role=investor" className="btn-primary mt-10 inline-flex">
          Join as investor →
        </Link>
      </section>
    </main>
  );
}
