import "server-only"
import { getRequiredEnv } from "./env"

export function getSiteUrl(): string {
  return getRequiredEnv("SITE_URL");
}

export function buildAbsoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}
