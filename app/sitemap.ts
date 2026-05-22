import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ventex.com";

  // 1. Static Pages
  const staticPages = [
    "",
    "/about",
    "/discover",
    "/marketplace",
    "/pricing",
    "/terms",
    "/privacy",
    "/seller-agreement",
  ];

  const staticUrls = staticPages.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Dynamic Pitch Pages
  let pitchUrls: any[] = [];
  try {
    const { data: pitches } = await supabase
      .from("pitches")
      .select("id, updated_at")
      .eq("status", "live");

    if (pitches) {
      pitchUrls = pitches.map((pitch) => ({
        url: `${siteUrl}/pitch/${pitch.id}`,
        lastModified: pitch.updated_at ? new Date(pitch.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Sitemap dynamic pitches error:", error);
  }

  // 3. Dynamic Product Pages
  let productUrls: any[] = [];
  try {
    const { data: products } = await supabase
      .from("products")
      .select("id, created_at")
      .eq("status", "live");

    if (products) {
      productUrls = products.map((product) => ({
        url: `${siteUrl}/marketplace/${product.id}`,
        lastModified: product.created_at ? new Date(product.created_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error("Sitemap dynamic products error:", error);
  }

  return [...staticUrls, ...pitchUrls, ...productUrls];
}
