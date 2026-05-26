import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-5">
            <h1 className="text-4xl font-black tracking-[-.04em] sm:text-5xl">
              About Ventex
            </h1>
            <p className="max-w-3xl text-base leading-7 text-[var(--text2)] sm:text-lg">
              Ventex is a platform where startups can pitch, raise interest from investors,
              and sell digital products in one focused workspace. It brings discovery,
              marketplace tools, and founder workflows together so builders can move from
              idea to traction without scattering their work across disconnected tools.
            </p>
            <p className="max-w-3xl text-base leading-7 text-[var(--text2)] sm:text-lg">
              It was built for India because Indian founders are building from every city,
              campus, and small team setup, often before they have access to traditional
              venture networks. Ventex gives those founders a clearer way to be seen,
              trusted, and supported by the people who can help them grow.
            </p>
          </div>

          <section className="border-t pt-8" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-2xl font-black tracking-[-.03em]">
              Built by founders, for founders.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text3)]">
              The team is shaping Ventex around the realities of early building: limited
              time, limited access, and the need to earn trust quickly.
            </p>
          </section>

          <Link href="/signup" className="btn-primary inline-flex">
            Join the platform →
          </Link>
        </div>
      </section>
    </main>
  );
}
