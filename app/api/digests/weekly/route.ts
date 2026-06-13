import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireInternalSecret } from "@/lib/api-security";

const supabaseAdmin = createSupabaseAdmin();

export async function POST(req: Request) {
  if (!requireInternalSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: flag } = await supabaseAdmin
    .from("feature_flags")
    .select("enabled")
    .eq("key", "email_digests")
    .maybeSingle();

  if (!flag?.enabled) {
    return NextResponse.json({ skipped: true, reason: "Email digests are disabled" });
  }

  return NextResponse.json({
    ready: true,
    investorDigest: "5 new startups raising this week on Ventexx",
    founderDigest: "3 investors were active in your sector this week",
  });
}
