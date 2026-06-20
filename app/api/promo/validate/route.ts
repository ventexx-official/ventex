import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";

// Admin client is created lazily inside the handler so cold-start doesn't crash
function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  // Rate limit: 30 promo checks per minute per IP (prevents brute-force enumeration)
  const rl = rateLimit(req, 30, 60000);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests. Slow down." }, {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  try {
    const { code, productIds } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Promo code is required." }, { status: 400 });
    }

    const supabaseAdmin = getAdmin();

    // 1. Look up code (case-insensitive — stored uppercase)
    const { data: promo, error } = await supabaseAdmin
      .from("promo_codes")
      .select("id, code, discount_pct, is_active, expires_at, max_uses, used_count, product_id")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error || !promo) {
      return NextResponse.json({ error: "Invalid promo code." }, { status: 404 });
    }

    // 2. Active check
    if (!promo.is_active) {
      return NextResponse.json({ error: "This promo code is inactive." }, { status: 400 });
    }

    // 3. Expiry check
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: "This promo code has expired." }, { status: 400 });
    }

    // 4. Usage limit check
    if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ error: "This promo code has reached its usage limit." }, { status: 400 });
    }

    // 5. Product scope check
    if (promo.product_id) {
      const match = Array.isArray(productIds) && productIds.includes(promo.product_id);
      if (!match) {
        return NextResponse.json({
          error: "This promo code is not applicable to the items in your cart.",
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      discountPct: promo.discount_pct,
      codeId: promo.id,
      message: `Promo code "${promo.code}" applied!`,
    });
  } catch (error: any) {
    console.error("[Promo Validation Error]:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}