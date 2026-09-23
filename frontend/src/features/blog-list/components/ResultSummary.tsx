export function ResultSummary({
  totalCount,
  displayStart,
  displayEnd,
}: {
  totalCount: number;
  displayStart: number;
  displayEnd: number;
}) {
  if (totalCount === 0) return null;
  return (
    <p className="text-sm text-base-content/60">
      {totalCount}件中 {displayStart} - {displayEnd} 件を表示
    </p>
  );
}
