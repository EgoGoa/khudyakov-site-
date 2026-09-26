import type { MetadataRoute } from "next";
import { contentDirections } from "@/lib/service-content";
import { aiToolPages, aiCompactToolPages } from "@/components/home/direction/toolRegistry";
import { sitesFormatPages } from "@/components/home/direction/sitesFormatRegistry";
import { smmFormatPages } from "@/components/home/direction/smmFormatRegistry";
import { SITE_URL } from "@/lib/site";

// Same sources as each [param] route's generateStaticParams, so a page that
// builds is a page that's listed — a hand-kept copy here once dropped /ai/chat-hub.
const CONTENT_DIRECTIONS = contentDirections.map((d) => d.slug);
const AI_TOOLS = [...Object.keys(aiToolPages), ...Object.keys(aiCompactToolPages)];
const SITES_FORMATS = Object.keys(sitesFormatPages);
const SMM_FORMATS = Object.keys(smmFormatPages);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // "/" не входит: корень отдаёт 301 на /content/ (.htaccess), а в карте
  // сайта должны стоять только адреса, которые открываются сами.
  const staticRoutes = [
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
    // Со слешем на конце — как их отдаёт статичная версия (trailingSlash),
    // иначе каждый адрес из карты сначала упирается в редирект.
    url: `${SITE_URL}${path}/`,
    lastModified: now,
  }));
}
