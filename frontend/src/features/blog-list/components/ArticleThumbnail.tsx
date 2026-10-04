import type { CardTheme } from "@/shared/lib/card-theme";
import type { MicroCMSImage } from "microcms-js-sdk";
import Image from "next/image";

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
  eyecatch?: MicroCMSImage;
};

export function ArticleThumbnail({
  label,
  theme,
  eyecatch,
}: ArticleThumbnailProps) {
  if (eyecatch) {
    return (
      <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-md shadow sm:w-64 sm:shrink-0">
        <Image
          src={eyecatch.url}
          alt=""
          fill
          sizes="(min-width: 640px) 256px, 100vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
    );
  }
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
