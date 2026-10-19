import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireInternalSecret } from "@/lib/api-security";

export async function POST(req: Request) {
  if (!requireInternalSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabaseAdmin = createSupabaseAdmin();
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
      investorDigest: "5 new startups raising this week on Ventex",
      founderDigest: "3 investors were active in your sector this week",
    });
  } catch (err: any) {
    console.error("[digests/weekly] error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
