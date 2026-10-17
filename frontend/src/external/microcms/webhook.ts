import { timingSafeEqual, createHmac } from "crypto";
import { MICROCMS_ENDPOINTS, MicrocmsEndpoint } from "./endpoints";

// microCMSは本文をシークレットでHMAC-SHA256署名し、X-MICROCMS-SIGNATUREヘッダーで送る
export function verifyWebhookSignature(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;

  const expected = Buffer.from(
    createHmac("sha256", secret).update(body).digest("hex"),
  );
  const actual = Buffer.from(signature);
  // timingSafeEqualは長さが違うと例外になるため先に比べる
  if (expected.length !== actual.length) return false;
  // 文字列の比較にかかる時間から署名を推測されないよう、一定時間で比較する
  return timingSafeEqual(expected, actual);
}

// ペイロードのapi(エンドポイント名)が許可リストにあれば、それを再検証するタグとして返す
export function resolveRevalidateTag(
  payload: unknown,
): MicrocmsEndpoint | null {
  if (typeof payload !== "object" || payload === null || !("api" in payload)) {
    return null;
  }
  return (
    MICROCMS_ENDPOINTS.find((endpoint) => endpoint === payload.api) ?? null
  );
}
