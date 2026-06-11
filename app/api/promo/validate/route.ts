import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { code, productIds } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Promo code is required." }, { status: 400 });
    }

    // 1. Look up code (case-insensitive, but uppercase is stored)
    const { data: promo, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error || !promo) {
      return NextResponse.json({ error: "Invalid promo code." }, { status: 404 });
    }

    // 2. Validate active status
    if (!promo.is_active) {
      return NextResponse.json({ error: "This promo code is inactive." }, { status: 400 });
    }

    // 3. Validate expiration
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: "This promo code has expired." }, { status: 400 });
    }

    // 4. Validate usage limit (exhausted)
    if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ error: "This promo code has reached its usage limit." }, { status: 400 });
    }

    // 5. Validate optional product scope restriction
    if (promo.product_id) {
      const match = Array.isArray(productIds) && productIds.includes(promo.product_id);
      if (!match) {
        return NextResponse.json({
          error: "This promo code is not applicable to the items in your cart."
        }, { status: 400 });
      }
    }

    // Success response
    return NextResponse.json({
      success: true,
      discountPct: promo.discount_pct,
      codeId: promo.id,
      message: `Promo code "${promo.code}" successfully applied!`,
    });
  } catch (error: any) {
    console.error("[Promo Validation Error]:", error);
    return NextResponse.json({ error: "Internal server error during promo validation." }, { status: 500 });
  }
}