export function sortByPublishedAtDesc<T extends { publishedAt: string }>(
  articles: T[],
): T[] {
  return [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}
