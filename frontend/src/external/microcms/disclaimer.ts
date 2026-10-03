import { microcmsClient } from "@/external/microcms/client";
import type { LegalPage } from "@/external/microcms/types";

export function getDisclaimer() {
  return microcmsClient.getObject<LegalPage>({ endpoint: "disclaimer" });
}
