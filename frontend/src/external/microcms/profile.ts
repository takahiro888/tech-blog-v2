import { microcmsClient } from "./client";
import type { Profile } from "./types";

export function getProfile() {
  return microcmsClient.getObject<Profile>({ endpoint: "profile" });
}
