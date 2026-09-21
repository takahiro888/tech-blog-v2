export const CATEGORIES = [
  "React",
  "TypeScript",
  "Next.js",
  "CSS",
  "Testing",
  "Git",
];

export type Category = {
  id: string;
  name: string;
};

export type Blog = {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  categories?: Category[];
  eyecatch?: {
    url: string;
    width: number;
    height: number;
  };
  publishedAt: string;
};
