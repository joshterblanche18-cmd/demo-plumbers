import type { MetadataRoute } from "next";

// Crawlers are allowed in so that they can read each page's noindex setting. A blocked page could still be listed.
export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || "http://localhost:3000";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: new URL("/sitemap.xml", base).toString(),
  };
}
