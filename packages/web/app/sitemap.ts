import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { MetadataRoute } from "next";
import { DOMAIN } from "@/lib/utils";

export const dynamic = "force-static";

// Every page.tsx under app/ is a public page.
function getRoutes(dir: string, route = ""): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(
        ...getRoutes(join(dir, entry.name), `${route}/${entry.name}`),
      );
    } else if (/^page\.(tsx|ts|jsx|js|mdx)$/.test(entry.name)) {
      routes.push(route);
    }
  }
  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return getRoutes(join(process.cwd(), "app"))
    .sort()
    .map((route) => ({ url: `https://${DOMAIN}${route || "/"}` }));
}
