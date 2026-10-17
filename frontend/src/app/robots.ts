import { MetadataRoute } from "next";
import { buildAbsoluteUrl } from "@/shared/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: buildAbsoluteUrl("/sitemap.xml"),
  };
}
