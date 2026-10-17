import { microcmsClient } from "@/external/microcms/client";
import type { LegalPage } from "@/external/microcms/types";
import { buildCacheOptions } from "./endpoints";
export function getDisclaimer() {
  return microcmsClient.getObject<LegalPage>({
    endpoint: "disclaimer",
    customRequestInit: buildCacheOptions("disclaimer"),
  });
}
