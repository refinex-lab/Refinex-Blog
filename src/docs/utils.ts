import type { DocsNavNode, DocsNavFolder } from "./types";

export const DOCS_BASE_PATH = "/docs";

export const normalizeContentFilePath = (modulePath: string) => {
  const normalized = modulePath.replaceAll("\\", "/");
  const marker = "/content/";
  const idx = normalized.lastIndexOf(marker);
  if (idx >= 0) {
    return normalized.slice(idx + marker.length);
  }
  const legacy = "../../content/";
  if (normalized.startsWith(legacy)) {
    return normalized.slice(legacy.length);
  }
  return normalized;
};

export const encodePathSegments = (path: string) => {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
};

export const getDocHref = (slug: string) => {
  return `${DOCS_BASE_PATH}/${encodePathSegments(slug)}`;
};

export const inferTitleFromMarkdown = (markdownBody: string) => {
  const match = markdownBody.match(/^\s*#\s+(.+?)\s*$/m);
  return match?.[1]?.trim();
};

export const toNumberOrInfinity = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return Number.POSITIVE_INFINITY;
};

export const stripMarkdown = (markdown: string) => {
  return markdown
    .replace(/^---[\s\S]*?---/m, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~`|-]/g, " ")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const zhCollator = new Intl.Collator("zh-Hans", {
  numeric: true,
  sensitivity: "base",
});

export const sortDocsNavChildren = (children: DocsNavNode[]) => {
  const typeRank = (node: DocsNavNode) => (node.type === "folder" ? 0 : 1);

  children.sort((a, b) => {
    const rankDiff = typeRank(a) - typeRank(b);
    if (rankDiff !== 0) {
      return rankDiff;
    }
    const aInf = !Number.isFinite(a.order);
    const bInf = !Number.isFinite(b.order);
    if (aInf !== bInf) {
      return aInf ? 1 : -1;
    }
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return zhCollator.compare(a.title, b.title);
  });
};

export const finalizeFolderOrders = (folder: DocsNavFolder): number => {
  let minOrder = Number.POSITIVE_INFINITY;
  for (const child of folder.children) {
    if (child.type === "folder") {
      const childOrder = finalizeFolderOrders(child);
      minOrder = Math.min(minOrder, childOrder);
      continue;
    }
    minOrder = Math.min(minOrder, child.order);
  }
  folder.order = minOrder;
  sortDocsNavChildren(folder.children);
  return minOrder;
};
