export type MarkdownDoc = {
  slug: string;
  title: string;
  description?: string;
  order: number;
  sourcePath: string;
  raw: string;
  body: string;
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

