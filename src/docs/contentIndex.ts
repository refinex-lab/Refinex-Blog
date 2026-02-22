import { docsCustomPages } from "./customPages";
import type {
  ContentDoc,
  DocsNavFolder,
  DocsNavItem,
  DocsNavNode,
} from "./types";
import {
  finalizeFolderOrders,
  getDocHref,
  inferTitleFromMarkdown,
  normalizeContentFilePath,
  orderFromPath,
  parseOrderPrefix,
  stripOrderPrefixFromPath,
  toNumberOrInfinity,
} from "./utils";

const mdModules = import.meta.glob("../../content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const mdxRawModules = import.meta.glob("../../content/**/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, unknown>;

const mdxMetaModules = import.meta.glob("../../content/**/*.mdx", {
  import: "frontmatter",
  eager: true,
}) as Record<string, unknown>;

const mdxModules = import.meta.glob("../../content/**/*.mdx", {
  import: "default",
}) as Record<string, () => Promise<unknown>>;

const parseFrontmatter = (
  raw: unknown
): { data: Record<string, unknown>; body: string } => {
  if (typeof raw !== "string") {
    return { data: {}, body: "" };
  }

  if (!raw.startsWith("---")) {
    return { data: {}, body: raw };
  }

  const lines = raw.split(/\r?\n/);
  if (lines[0].trim() !== "---") {
    return { data: {}, body: raw };
  }

  const data: Record<string, unknown> = {};
  let i = 1;
  let foundEnd = false;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "---") {
      i++;
      foundEnd = true;
      break;
    }
    if (!line.trim() || line.trimStart().startsWith("#")) continue;

    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    let value: unknown = match[2] ?? "";

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (
        (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ) {
        value = trimmed.slice(1, -1);
      } else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        value = Number(trimmed);
      } else {
        value = trimmed;
      }
    }

    data[key] = value;
  }

  if (!foundEnd) {
    return { data: {}, body: raw };
  }

  const body = lines.slice(i).join("\n");
  return { data, body };
};

const asText = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  return undefined;
};

const asCover = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const pickFirstText = (
  data: Record<string, unknown>,
  keys: string[]
): string | undefined => {
  for (const key of keys) {
    const text = asText(data[key]);
    if (text) return text;
  }
  return undefined;
};

const parseMdDoc = (modulePath: string, raw: string): ContentDoc => {
  const sourcePath = normalizeContentFilePath(modulePath);
  // Strip XX_ prefixes from the slug so URLs and display names are clean.
  const slug = stripOrderPrefixFromPath(sourcePath.replace(/\.md$/i, ""));
  // Derive order from the file name prefix (e.g. "01_快速开始.md" → 1).
  const order = orderFromPath(sourcePath.replace(/\.md$/i, ""));
  const parsed = parseFrontmatter(raw);

  const titleFromMatter =
    typeof parsed.data.title === "string" ? parsed.data.title.trim() : undefined;
  const titleFromHeading = inferTitleFromMarkdown(parsed.body);
  const fallbackTitle = slug.split("/").at(-1) ?? slug;

  const title =
    titleFromMatter || titleFromHeading || fallbackTitle.replace(/[-_]/g, " ");

  const description =
    typeof parsed.data.description === "string"
      ? parsed.data.description.trim()
      : undefined;

  const cover = asCover(parsed.data.cover);
  const author = pickFirstText(parsed.data, ["author"]);
  const createdAt = pickFirstText(parsed.data, ["createdAt", "created"]);
  const updatedAt = pickFirstText(parsed.data, ["updatedAt", "updated"]);

  // Frontmatter order can still override the prefix-based order.
  const fmOrder = toNumberOrInfinity(parsed.data.order);
  const finalOrder = Number.isFinite(fmOrder) ? fmOrder : order;

  return {
    slug,
    title,
    description,
    cover,
    author,
    createdAt,
    updatedAt,
    order: finalOrder,
    sourcePath,
    raw,
    body: parsed.body.trim(),
    format: "md",
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const parseMdxDoc = (modulePath: string): ContentDoc => {
  const sourcePath = normalizeContentFilePath(modulePath);
  const slug = stripOrderPrefixFromPath(sourcePath.replace(/\.mdx$/i, ""));
  const order = orderFromPath(sourcePath.replace(/\.mdx$/i, ""));

  const meta = mdxMetaModules[modulePath];
  const data = isRecord(meta) ? meta : {};

  const rawMaybe = mdxRawModules[modulePath];
  const raw = typeof rawMaybe === "string" ? rawMaybe : "";
  const parsed = raw ? parseFrontmatter(raw) : { data: {}, body: "" };

  const titleFromMatter =
    typeof data.title === "string"
      ? data.title.trim()
      : typeof parsed.data.title === "string"
        ? parsed.data.title.trim()
        : undefined;

  const titleFromHeading = inferTitleFromMarkdown(parsed.body);
  const fallbackTitle = slug.split("/").at(-1) ?? slug;

  const title =
    titleFromMatter || titleFromHeading || fallbackTitle.replace(/[-_]/g, " ");

  const description =
    typeof data.description === "string"
      ? data.description.trim()
      : typeof parsed.data.description === "string"
        ? parsed.data.description.trim()
        : undefined;

  const cover = asCover(data.cover ?? parsed.data.cover);
  const author =
    pickFirstText(data, ["author"]) ?? pickFirstText(parsed.data, ["author"]);
  const createdAt =
    pickFirstText(data, ["createdAt", "created"]) ??
    pickFirstText(parsed.data, ["createdAt", "created"]);
  const updatedAt =
    pickFirstText(data, ["updatedAt", "updated"]) ??
    pickFirstText(parsed.data, ["updatedAt", "updated"]);

  const fmOrder = toNumberOrInfinity(data.order ?? parsed.data.order);
  const finalOrder = Number.isFinite(fmOrder) ? fmOrder : order;

  return {
    slug,
    title,
    description,
    cover,
    author,
    createdAt,
    updatedAt,
    order: finalOrder,
    sourcePath,
    raw,
    body: parsed.body.trim(),
    format: "mdx",
  };
};

export const contentDocs: ContentDoc[] = [
  ...Object.entries(mdModules).map(([modulePath, raw]) => parseMdDoc(modulePath, raw)),
  ...Object.keys(mdxMetaModules).map((modulePath) => parseMdxDoc(modulePath)),
].sort((a, b) => a.slug.localeCompare(b.slug, "zh-Hans"));

export const contentDocBySlug = new Map<string, ContentDoc>(
  contentDocs.map((doc) => [doc.slug, doc])
);

export const mdxDocComponentLoaderBySlug = new Map<
  string,
  () => Promise<unknown>
>(
  Object.entries(mdxModules).map(([modulePath, loader]) => {
    const sourcePath = normalizeContentFilePath(modulePath);
    const slug = stripOrderPrefixFromPath(sourcePath.replace(/\.mdx$/i, ""));
    return [slug, loader];
  })
);

const createFolder = (id: string, title: string, order: number): DocsNavFolder => ({
  type: "folder",
  id,
  title,
  order,
  children: [],
});

const ensureFolder = (
  folderMap: Map<string, DocsNavFolder>,
  parent: DocsNavFolder,
  id: string,
  title: string,
  order: number
) => {
  const existing = folderMap.get(id);
  if (existing) {
    // Keep the smallest (most explicit) order seen for this folder.
    if (order < existing.order) {
      existing.order = order;
    }
    return existing;
  }
  const folder = createFolder(id, title, order);
  folderMap.set(id, folder);
  parent.children.push(folder);
  return folder;
};

const insertLeaf = (
  folderMap: Map<string, DocsNavFolder>,
  root: DocsNavFolder,
  rawNavPath: string,
  leaf: DocsNavItem
) => {
  const segments = rawNavPath.split("/").filter(Boolean);
  let parent = root;
  let parentId = root.id;

  for (const seg of segments) {
    const { order, name } = parseOrderPrefix(seg);
    const nextId = parentId ? `${parentId}/${name}` : name;
    parent = ensureFolder(folderMap, parent, nextId, name, order);
    parentId = nextId;
  }

  parent.children.push(leaf);
};

const buildDocsNavTree = (): DocsNavFolder => {
  const root = createFolder("", "root", Number.POSITIVE_INFINITY);
  const folderMap = new Map<string, DocsNavFolder>([[root.id, root]]);

  // Insert custom pages (non-Markdown).
  for (const page of docsCustomPages) {
    const leaf: DocsNavItem = {
      type: "page",
      id: page.slug,
      title: page.title,
      description: page.description,
      order: page.order,
      href: `${getDocHref(page.slug)}`,
    };
    root.children.push(leaf);
  }

  // Insert Markdown docs based on file-system structure.
  // We use the raw sourcePath (with XX_ prefixes) for folder ordering,
  // but the clean slug (without prefixes) for display and URLs.
  for (const doc of contentDocs) {
    // Reconstruct the raw folder path from sourcePath (still has prefixes).
    const rawSegments = doc.sourcePath
      .replace(/\.(md|mdx)$/i, "")
      .split("/")
      .filter(Boolean);
    const rawNavPath = rawSegments.slice(0, -1).join("/");

    const leaf: DocsNavItem = {
      type: "doc",
      id: doc.slug,
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      order: doc.order,
      href: getDocHref(doc.slug),
    };

    insertLeaf(folderMap, root, rawNavPath, leaf);
  }

  finalizeFolderOrders(root);
  return root;
};

export const docsNavTree: DocsNavFolder = buildDocsNavTree();

export const flattenDocsNavItems = (node: DocsNavNode): DocsNavItem[] => {
  if (node.type === "folder") {
    return node.children.flatMap(flattenDocsNavItems);
  }
  return [node];
};
