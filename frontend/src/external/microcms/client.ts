import "server-only"
import { createClient } from "microcms-js-sdk";
import { getRequiredEnv } from "@/shared/lib/env";


export const microcmsClient = createClient({
  serviceDomain: getRequiredEnv("MICROCMS_SERVICE_DOMAIN"),
  apiKey: getRequiredEnv("MICROCMS_API_KEY"),
});
