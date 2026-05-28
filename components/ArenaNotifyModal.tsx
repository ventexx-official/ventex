"use client";

import { useState } from "react";
import ArenaWaitlistForm from "./ArenaWaitlistForm";

export default function ArenaNotifyModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-amber-300/40 px-6 py-3 text-sm font-black text-amber-100"
      >
        Get Notified →
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-amber-300/25 bg-[#120b08] p-6 text-white shadow-[0_0_60px_rgba(245,158,11,.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Get notified</h2>
                <p className="mt-2 text-sm leading-6 text-orange-50/70">We will email you before Season 1 goes live.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-sm font-black text-amber-100">
                Close
              </button>
            </div>
            <div className="mt-6">
              <ArenaWaitlistForm />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
