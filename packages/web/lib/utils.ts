import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const domain = "standardschema.dev";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isLocalhost(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function isProduction(): boolean {
  return !isLocalhost() && process.env.VERCEL_ENV === "production";
}

export function getDomain(): string {
  if (isLocalhost()) {
    return "localhost";
  }
  if (isProduction()) {
    return domain;
  }
  return process.env.VERCEL_URL || domain;
}

export function getUrl(): URL {
  if (isLocalhost()) {
    return new URL("http://localhost:3000");
  }
  return new URL(`https://${getDomain()}`);
}
