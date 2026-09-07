import type { MetadataRoute } from "next";
import { contentDirections } from "@/lib/service-content";

// Falls back to the production domain so a sitemap still resolves to
// absolute URLs on a preview deploy that forgot to set the env var.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hdkv.agency";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/content",
    "/ai",
    "/sites",
    "/smm",
    "/smm/cases",
    "/smm/pricing",
    "/works",
    "/calculator",
    "/brief",
  ];

  const directionRoutes = contentDirections.map((d) => `/content/${d.slug}`);

  return [...staticRoutes, ...directionRoutes].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
}
