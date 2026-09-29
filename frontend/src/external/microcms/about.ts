import { microcmsClient } from "./client";
import type { About } from "./types";

export function getAbout() {
  return microcmsClient.getObject<About>({ endpoint: "about" });
}
