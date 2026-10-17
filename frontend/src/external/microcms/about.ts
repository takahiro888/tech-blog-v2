import { microcmsClient } from "./client";
import type { About } from "./types";
import { buildCacheOptions } from "./endpoints";
export function getAbout() {
  return microcmsClient.getObject<About>({
    endpoint: "about",
    customRequestInit: buildCacheOptions("about"),
  });
}
