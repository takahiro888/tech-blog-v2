import type { CardTheme } from "@/shared/lib/card-theme";

const THEME_CLASSES: Record<CardTheme, string> = {
  blue: "bg-blue-100 text-blue-700",
  dark: "bg-slate-900 text-white",
  green: "bg-emerald-100 text-emerald-700",
  purple: "bg-purple-100 text-purple-700",
  black: "bg-neutral-900 text-white",
  yellow: "bg-amber-100 text-amber-700",
};

type ArticleThumbnailProps = {
  label: string;
  theme: CardTheme;
};

export function ArticleThumbnail({
  label,
  theme,
}: ArticleThumbnailProps) {
  return (
    <div
      className={`flex h-40 w-full flex-col justify-between rounded-md p-4 sm:w-64 sm:shrink-0 ${THEME_CLASSES[theme]}`}
    >
      <span className="font-mono text-[10px] tracking-widest opacity-70">
        MARGIN / TECH NOTE
      </span>
      <span className="text-2xl font-bold">{label}</span>
    </div>
  );
}
