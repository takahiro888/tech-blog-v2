import { NextRequest, NextResponse } from "next/server";
import { getRequiredEnv } from "@/shared/lib/env";
import {
  verifyWebhookSignature,
  resolveRevalidateTag,
} from "@/external/microcms/webhook";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  // 署名は受け取った本文そのものに対して作られるため、JSONにする前の文字列で検証する
  const body = await request.text();
  const signature = request.headers.get("x-microcms-signature");
  const secret = getRequiredEnv("MICROCMS_WEBHOOK_SECRET");

  if (!verifyWebhookSignature(body, signature, secret)) {
    return NextResponse.json(
      { message: "署名が正しくありません" },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { message: "本文がJSONではありません" },
      { status: 400 },
    );
  }

  const tag = resolveRevalidateTag(payload);
  if (!tag) {
    return NextResponse.json({ message: "対象外のAPIです" }, { status: 400 });
  }

  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tag });
}
