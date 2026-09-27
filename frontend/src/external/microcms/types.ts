export const CATEGORIES = [
  "React",
  "TypeScript",
  "Next.js",
  "CSS",
  "Testing",
  "Git",
];

export type Category = string;

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

export type MicroCMSImage = {
  url: string;
  width: number;
  height: number;
};

export type SnsLink = {
  fieldId: string;
  type: string[];
  url: string;
};

export type Profile = {
  name: string;
  role: string;
  bio: string;
  avatar?: MicroCMSImage;
  mainImage?: MicroCMSImage;
  content: string;
  snsLinks?: SnsLink[];
};
