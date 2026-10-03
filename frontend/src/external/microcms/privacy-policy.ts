import { microcmsClient } from "./client";
import type { LegalPage } from "./types";

export function getPrivacyPolicy() {
  return microcmsClient.getObject<LegalPage>({ endpoint: "privacy-policy" });
}
