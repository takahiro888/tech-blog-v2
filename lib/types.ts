export type Article = {
  title: string;
  date: string;
  url: string;
  thumbnail: string;
};

export type Blog = {
  id: string;
  title: string;
  content: string;
  eyecatch?: {
    url: string;
    width: number;
    height: number;
  };
  publishedAt: string;
};
