import { microcmsClient } from "./client";
import type { Profile } from "./types";
import { buildCacheOptions } from "./endpoints";

export function getProfile() {
  return microcmsClient.getObject<Profile>({
    endpoint: "profile",
    customRequestInit: buildCacheOptions("profile"),
  });
}
