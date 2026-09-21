import { NEW_DAYS } from "./constants";
const DAY_MS = 24 * 60 * 60 * 1000;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function isNew(
  publishedAt: string,
  now: Date,
  days = NEW_DAYS,
): boolean {
  const elapsed =
    now.getTime() - new Date(publishedAt).getTime() - JST_OFFSET_MS;
  return elapsed >= 0 && elapsed <= days * DAY_MS;
}

export function formatPublishedDate(isoString: string): string {
  const jst = new Date(new Date(isoString).getTime() + JST_OFFSET_MS);
  const year = jst.getFullYear();
  const month = String(jst.getMonth() + 1).padStart(2, "0");
  const day = String(jst.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}