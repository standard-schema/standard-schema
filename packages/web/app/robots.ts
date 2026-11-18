import type { MetadataRoute } from "next";
import { DOMAIN } from "@/lib/utils";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `https://${DOMAIN}/sitemap.xml`,
  };
}
