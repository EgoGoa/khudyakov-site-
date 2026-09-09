import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://khudyakov-site.vercel.app";

// Kept in sync by hand with the dynamic [param] routes, the same way
// PAGE_BLOCKS in VibeRail.tsx tracks each page's own chapter ids — there is
// no shared route registry to derive this from yet.
const CONTENT_DIRECTIONS = ["presentation", "advertising", "image", "ai-video", "graphics"];
const AI_TOOLS = ["video", "agent", "comms", "content", "ops", "crm", "voice", "personalization", "analytics", "training"];
const SITES_FORMATS = ["landing", "card", "turnkey", "assistant", "redesign"];
const SMM_FORMATS = ["reels", "stories", "carousel", "ads", "bloggers"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "/",
    "/content",
    "/ai",
    "/sites",
    "/smm",
    "/works",
    "/calculator",
    "/brief",
    "/smm/cases",
    "/smm/pricing",
  ];

  const dynamicRoutes = [
    ...CONTENT_DIRECTIONS.map((slug) => `/content/${slug}`),
    ...AI_TOOLS.map((slug) => `/ai/${slug}`),
    ...SITES_FORMATS.map((slug) => `/sites/${slug}`),
    ...SMM_FORMATS.map((slug) => `/smm/${slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
  }));
}
