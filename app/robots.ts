import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ventex-eight.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/settings", "/dashboard", "/cart", "/orders", "/my-purchases"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
