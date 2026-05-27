"use client";

import { useState } from "react";
import { Mail, MapPin, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      const { error: insertError } = await supabase.from("contact_submissions").insert(form);
      if (insertError) throw insertError;

      await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact_submission",
          recipientEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "support@ventex.app",
          data: form,
        }),
      });

      setSuccess("Message sent. The Ventex team will reply as soon as possible.");
      setForm({ name: "", email: "", subject: "General", message: "" });
    } catch (err: any) {
      setError(err.message || "Could not submit your message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F2F0] px-4 py-16 text-[#222222] dark:bg-[#111111] dark:text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 border-b border-black/10 pb-8 dark:border-white/10">
          <p className="mono mb-3 text-xs font-bold uppercase tracking-[.16em] text-[#666666] dark:text-gray-400">Support</p>
          <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">Contact Ventex</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#666666] dark:text-gray-300">
            Send account, billing, marketplace, privacy, partnership, and grievance requests to the Ventex team.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            <section className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a]">
              <Mail className="mb-4 h-6 w-6" />
              <h2 className="mb-2 text-lg font-black">Support Email</h2>
              <a className="text-sm font-bold underline underline-offset-4" href="mailto:support@ventex.app">support@ventex.app</a>
              <p className="mt-3 text-xs leading-5 text-[#666666] dark:text-gray-400">Target response time: 2 business days.</p>
            </section>
            <section className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a]">
              <ShieldCheck className="mb-4 h-6 w-6" />
              <h2 className="mb-2 text-lg font-black">Grievance Officer</h2>
              <p className="text-sm font-bold">Ventex Support Desk</p>
              <p className="mt-3 text-xs leading-5 text-[#666666] dark:text-gray-400">Use the form for escalation, privacy, and compliance requests.</p>
            </section>
            <section className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a]">
              <MapPin className="mb-4 h-6 w-6" />
              <h2 className="mb-2 text-lg font-black">Business Address</h2>
              <p className="text-sm font-bold">Ventex, Global Remote</p>
              <p className="mt-3 text-xs leading-5 text-[#666666] dark:text-gray-400">Add registered entity details before live commercial launch.</p>
            </section>
          </div>

          <form onSubmit={submit} className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a] space-y-4">
            <h2 className="text-xl font-black">Send a message</h2>
            {success ? <div className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{success}</div> : null}
            {error ? <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div> : null}
            <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="w-full rounded-xl border border-black/10 bg-[#F8F8F8] px-4 py-3 text-sm font-bold text-[#222222] outline-none" />
            <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full rounded-xl border border-black/10 bg-[#F8F8F8] px-4 py-3 text-sm font-bold text-[#222222] outline-none" />
            <select value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} className="w-full rounded-xl border border-black/10 bg-[#F8F8F8] px-4 py-3 text-sm font-bold text-[#222222] outline-none">
              {['General', 'Bug Report', 'Partnership', 'Press', 'Other'].map((subject) => <option key={subject}>{subject}</option>)}
            </select>
            <textarea required value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="Message" rows={6} className="w-full resize-none rounded-xl border border-black/10 bg-[#F8F8F8] px-4 py-3 text-sm font-bold text-[#222222] outline-none" />
            <button disabled={submitting} className="w-full rounded-xl bg-[#222222] py-3 text-sm font-black text-white disabled:opacity-50">
              {submitting ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
