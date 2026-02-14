import { Index } from "flexsearch";
import { docsCustomPages } from "./customPages";
import { markdownDocs } from "./contentIndex";
import type { SearchHit } from "./types";
import { getDocHref, stripMarkdown } from "./utils";

type SearchDoc = {
  id: string;
  title: string;
  href: string;
  description?: string;
  section?: string;
  text: string;
};

const buildSearchDocs = (): SearchDoc[] => {
  const custom = docsCustomPages.map<SearchDoc>((page) => ({
    id: `page:${page.slug}`,
    title: page.title,
    href: getDocHref(page.slug),
    description: page.description,
    section: page.category,
    text: page.description ?? "",
  }));

  const markdown = markdownDocs.map<SearchDoc>((doc) => ({
    id: `md:${doc.slug}`,
    title: doc.title,
    href: getDocHref(doc.slug),
    description: doc.description,
    section: doc.slug.split("/").at(0) ?? undefined,
    text: stripMarkdown(doc.body),
  }));

  return [...custom, ...markdown];
};

const searchDocs = buildSearchDocs();
const searchDocById = new Map<string, SearchDoc>(
  searchDocs.map((doc) => [doc.id, doc])
);

// Chinese-friendly: use CJK encoder + full tokenizer for substring matches.
const index = new Index({
  encoder: "CJK",
  tokenize: "full",
  resolution: 9,
  cache: 100,
});

for (const doc of searchDocs) {
  index.add(doc.id, `${doc.title}\n${doc.description ?? ""}\n${doc.text}`);
}

const makeSnippet = (text: string, query: string) => {
  const q = query.trim();
  if (!q) return undefined;

  const lowerText = text.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);

  const fallback = text.slice(0, 140).trim();
  if (idx < 0) return fallback || undefined;

  const start = Math.max(0, idx - 48);
  const end = Math.min(text.length, idx + q.length + 92);
  const slice = text.slice(start, end).trim();

  return `${start > 0 ? "..." : ""}${slice}${end < text.length ? "..." : ""}`;
};

export const searchDocsByQuery = (query: string, limit = 20): SearchHit[] => {
  const q = query.trim();
  if (!q) return [];

  const ids = index.search(q, { limit }) as Array<string | number>;

  return ids
    .map((id) => String(id))
    .flatMap((id) => {
      const doc = searchDocById.get(id);
      if (!doc) return [];

      const hit: SearchHit = {
        id: doc.id,
        title: doc.title,
        href: doc.href,
        snippet: makeSnippet(doc.text, q),
      };
      if (doc.description) hit.description = doc.description;
      if (doc.section) hit.section = doc.section;

      return [hit];
    });
};
