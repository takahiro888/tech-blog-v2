import { microcmsClient } from "@/external/microcms/client";
import type { LegalPage } from "@/external/microcms/types";

export function getPrivacyPolicy() {
  return microcmsClient.getObject<LegalPage>({ endpoint: "privacy-policy" });
}
