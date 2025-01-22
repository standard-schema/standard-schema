import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const domain = "standardschema.dev";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

console.log(process.env);

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isPreview(): boolean {
  return process.env.CF_PAGES_BRANCH !== "main";
}

export function isProduction(): boolean {
  return process.env.CF_PAGES_BRANCH === "main";
}

export function getDomain(): string {
  if (isDevelopment()) {
    return "localhost";
  }
  if (isPreview()) {
    return process.env.CF_PAGES_URL!;
  }
  return domain;
}

export function getUrl(): string {
  if (isDevelopment()) {
    return "http://localhost:3000";
  }

  return `https://${getDomain()}`;
}
