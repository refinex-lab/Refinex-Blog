export type ContentDoc = {
  slug: string;
  title: string;
  description?: string;
  cover?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  order: number;
  sourcePath: string;
  raw: string;
  body: string;
  format: "md" | "mdx";
};

export type DocsNavFolder = {
  type: "folder";
  id: string;
  title: string;
  order: number;
  children: DocsNavNode[];
};

export type DocsNavDocItem = {
  type: "doc";
  id: string;
  slug: string;
  title: string;
  description?: string;
  order: number;
  href: string;
};

export type DocsNavPageItem = {
  type: "page";
  id: string;
  title: string;
  description?: string;
  order: number;
  href: string;
};

export type DocsNavItem = DocsNavDocItem | DocsNavPageItem;

export type DocsNavNode = DocsNavFolder | DocsNavItem;

export type SearchHit = {
  id: string;
  title: string;
  href: string;
  description?: string;
  section?: string;
  snippet?: string;
};
