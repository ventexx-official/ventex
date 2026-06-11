import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/discover",
    "/marketplace",
    "/catalyst",
    "/pricing",
    "/arena",
    "/arena/apply",
    "/events",
    "/about",
    "/investors",
    "/contact",
    "/terms",
    "/privacy",
    "/seller-agreement",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}