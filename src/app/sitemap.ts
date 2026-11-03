import type { MetadataRoute } from "next";
import { areaContent, serviceContent } from "@/config/content";
import { routes } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || "http://localhost:3000";
  const paths = [
    routes.home,
    routes.services,
    ...serviceContent.map((s) => `/services/${s.slug}`),
    ...areaContent.map((a) => `/areas/${a.slug}`),
    routes.about,
    routes.pricing,
    routes.faq,
    routes.contact,
    routes.book,
    routes.privacy,
    routes.terms,
  ];
  return paths.map((path) => ({ url: new URL(path, base).toString() }));
}
