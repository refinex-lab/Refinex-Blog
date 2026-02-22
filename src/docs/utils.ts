import type { DocsNavNode, DocsNavFolder } from "./types";

export const DOCS_BASE_PATH = "/docs";

/**
 * Parse a "XX_名称" prefix from a folder or file name segment.
 * Returns the numeric order and the clean display name (without prefix).
 * If no prefix is found, returns Infinity and the original name.
 *
 * Examples:
 *   "01_开始使用"  → { order: 1, name: "开始使用" }
 *   "03_Spring AI" → { order: 3, name: "Spring AI" }
 *   "没有前缀"     → { order: Infinity, name: "没有前缀" }
 */
export const parseOrderPrefix = (
  segment: string
): { order: number; name: string } => {
  const match = segment.match(/^(\d+)_(.+)$/);
  if (match) {
    return { order: Number(match[1]), name: match[2] };
  }
  return { order: Number.POSITIVE_INFINITY, name: segment };
};

/**
 * Strip order prefixes from every segment of a slash-separated path.
 * "01_开始使用/02_快速开始" → "开始使用/快速开始"
 */
export const stripOrderPrefixFromPath = (path: string): string => {
  return path
    .split("/")
    .map((seg) => parseOrderPrefix(seg).name)
    .join("/");
};

/**
 * Extract the order number from the last segment of a path.
 * "01_开始使用/02_快速开始" → 2
 */
export const orderFromPath = (path: string): number => {
  const last = path.split("/").filter(Boolean).at(-1) ?? "";
  return parseOrderPrefix(last).order;
};

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
  children.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
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
