import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const domain = "standardschema.dev";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isLocalhost(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function isPreview(): boolean {
  // cloudflare pages
  return process.env.DEPLOYMENT === "preview";
}
export function isProduction(): boolean {
  return !isPreview() && !isLocalhost();
}

export function getDomain(): string {
  if (isLocalhost()) {
    return "localhost";
  }
  if (isProduction()) {
    return domain;
  }
  return process.env.VERCEL_URL ?? process.env.CF_PAGES_URL;
}

export function getUrl(): string {
  if (isLocalhost()) {
    return "http://localhost:3000";
  }
  if (isProduction()) return `https://${getDomain()}`;
  const preview = process.env.VERCEL_URL ?? process.env.CF_PAGES_URL;
  if (!preview) throw new Error("Preview URL not found");
  return `https://${preview}`;
  // return new URL(`https://${getDomain()}`);
}
