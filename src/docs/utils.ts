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

const normalizeOrderKey = (value: string) => {
  return value.trim().replace(/\/$/, "").replace(/\.(md|mdx)$/i, "");
};

const getNodeOrderKey = (node: DocsNavNode) => {
  if (node.type === "folder") {
    const base = node.id.split("/").at(-1) ?? node.title;
    return normalizeOrderKey(base);
  }
  const id = node.type === "doc" ? node.slug : node.id;
  const base = id.split("/").at(-1) ?? node.title;
  return normalizeOrderKey(base);
};

export const sortDocsNavChildren = (children: DocsNavNode[], order?: string[]) => {
  const typeRank = (node: DocsNavNode) => (node.type === "folder" ? 0 : 1);
  const isPinnedLastFolder = (node: DocsNavNode) =>
    node.type === "folder" && node.title === "搭建本站";
  const orderIndex = new Map<string, number>();

  if (order) {
    order.forEach((key, index) => {
      const normalized = normalizeOrderKey(key);
      if (!normalized || orderIndex.has(normalized)) return;
      orderIndex.set(normalized, index);
    });
  }

  const getExplicitIndex = (node: DocsNavNode) => {
    if (orderIndex.size === 0) return undefined;
    return orderIndex.get(getNodeOrderKey(node));
  };

  children.sort((a, b) => {
    const aExplicit = getExplicitIndex(a);
    const bExplicit = getExplicitIndex(b);
    if (aExplicit !== undefined || bExplicit !== undefined) {
      if (aExplicit === undefined) return 1;
      if (bExplicit === undefined) return -1;
      if (aExplicit !== bExplicit) return aExplicit - bExplicit;
    }

    if (aExplicit === undefined && bExplicit === undefined) {
      const aPinned = isPinnedLastFolder(a);
      const bPinned = isPinnedLastFolder(b);
      if (aPinned !== bPinned) {
        return aPinned ? 1 : -1;
      }
    }

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

export const finalizeFolderOrders = (
  folder: DocsNavFolder,
  folderOrderById?: Map<string, string[]>
): number => {
  let minOrder = Number.POSITIVE_INFINITY;
  for (const child of folder.children) {
    if (child.type === "folder") {
      const childOrder = finalizeFolderOrders(child, folderOrderById);
      minOrder = Math.min(minOrder, childOrder);
      continue;
    }
    minOrder = Math.min(minOrder, child.order);
  }
  folder.order = minOrder;
  sortDocsNavChildren(folder.children, folderOrderById?.get(folder.id));
  return minOrder;
};
