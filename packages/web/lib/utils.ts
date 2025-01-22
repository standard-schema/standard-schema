import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const DOMAIN = "standardschema.dev";

console.log(process.env);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isPreview(): boolean {
  return process.env.CF_PAGES_BRANCH !== "main";
}

export function isProduction(): boolean {
  return process.env.CF_PAGES_BRANCH === "main";
}

export function getUrl(): string {
  if (isDevelopment()) {
    return "http://localhost:3000";
  }

  if (isPreview()) {
    return process.env.CF_PAGES_URL!;
  }

  return `https://${DOMAIN}`;
}
