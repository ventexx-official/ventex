"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ArenaWaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("saving");
    const { error } = await supabase.from("arena_waitlist").insert({ email });
    setStatus(error ? "error" : "done");
    if (!error) setEmail("");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email for Arena updates"
        className="min-h-11 flex-1 rounded-full border border-amber-300/30 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-orange-100/50"
      />
      <button type="submit" disabled={status === "saving"} className="min-h-11 rounded-full bg-amber-300 px-5 text-sm font-black text-[#160b04] disabled:opacity-60">
        {status === "saving" ? "Joining..." : "Notify Me"}
      </button>
      {status === "done" ? <p className="text-sm font-semibold text-amber-100 sm:self-center">You&apos;re on the list. We&apos;ll notify you before Season 1 goes live.</p> : null}
      {status === "error" ? <p className="text-sm font-semibold text-red-200 sm:self-center">Could not save this email. Please try again.</p> : null}
    </form>
  );
}
