import type { Category } from "@/external/microcms/types";

export type CardTheme =
  | "blue"
  | "dark"
  | "green"
  | "purple"
  | "black"
  | "yellow";

const DEFAULT_THEME: CardTheme = "blue";

const CATEGORY_THEME: Record<string, CardTheme> = {
  React: "blue",
  TypeScript: "dark",
  "Next.js": "yellow",
  CSS: "purple",
  Testing: "green",
  Git: "black",
};

export function getCardTheme(categories: readonly Category[] = []): CardTheme {
  const first = categories[0];
  return first ? (CATEGORY_THEME[first.name] ?? DEFAULT_THEME) : DEFAULT_THEME;
}
