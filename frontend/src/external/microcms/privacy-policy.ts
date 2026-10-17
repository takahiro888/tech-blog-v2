import { microcmsClient } from "./client";
import type { LegalPage } from "./types";
import { buildCacheOptions } from "./endpoints";

export function getPrivacyPolicy() {
  return microcmsClient.getObject<LegalPage>({
    endpoint: "privacy-policy",
    customRequestInit: buildCacheOptions("privacy-policy"),
  });
}
