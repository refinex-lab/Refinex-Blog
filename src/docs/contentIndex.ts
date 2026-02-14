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

const orderModules = import.meta.glob("../../content/**/_order.json", {
  import: "default",
  eager: true,
}) as Record<string, { order?: unknown }>;

const folderOrderById = new Map<string, string[]>();

for (const [modulePath, config] of Object.entries(orderModules)) {
  const sourcePath = normalizeContentFilePath(modulePath);
  const folderId =
    sourcePath === "_order.json"
      ? ""
      : sourcePath.replace(/\/_order\.json$/i, "");

  if (!config || !Array.isArray(config.order)) continue;
  const order = config.order.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
  if (order.length === 0) continue;
  folderOrderById.set(folderId, order);
}

const parseFrontmatter = (
  raw: unknown
): { data: Record<string, unknown>; body: string } => {
  // Minimal frontmatter parser to avoid Node-only Buffer/polyfills in the browser.
  // Supports:
  // ---
  // title: xxx
  // order: 1
  // description: yyy
  // ---
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

  // If we started parsing frontmatter but never found the closing delimiter,
  // treat the whole document as markdown (common when a file starts with `---`
  // as a horizontal rule).
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
  const slug = sourcePath.replace(/\.md$/i, "");
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

  const order = toNumberOrInfinity(parsed.data.order);

  return {
    slug,
    title,
    description,
    cover,
    author,
    createdAt,
    updatedAt,
    order,
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
  const slug = sourcePath.replace(/\.mdx$/i, "");

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

  const order = toNumberOrInfinity(data.order ?? parsed.data.order);

  return {
    slug,
    title,
    description,
    cover,
    author,
    createdAt,
    updatedAt,
    order,
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
    const slug = sourcePath.replace(/\.mdx$/i, "");
    return [slug, loader];
  })
);

const createFolder = (id: string, title: string): DocsNavFolder => ({
  type: "folder",
  id,
  title,
  order: Number.POSITIVE_INFINITY,
  children: [],
});

const ensureFolder = (
  folderMap: Map<string, DocsNavFolder>,
  parent: DocsNavFolder,
  id: string,
  title: string
) => {
  const existing = folderMap.get(id);
  if (existing) {
    return existing;
  }
  const folder = createFolder(id, title);
  folderMap.set(id, folder);
  parent.children.push(folder);
  return folder;
};

const insertLeaf = (
  folderMap: Map<string, DocsNavFolder>,
  root: DocsNavFolder,
  navPath: string,
  leaf: DocsNavItem
) => {
  const segments = navPath.split("/").filter(Boolean);
  let parent = root;
  let parentId = root.id;

  for (const seg of segments) {
    const nextId = parentId ? `${parentId}/${seg}` : seg;
    parent = ensureFolder(folderMap, parent, nextId, seg);
    parentId = nextId;
  }

  parent.children.push(leaf);
};

const buildDocsNavTree = (): DocsNavFolder => {
  const root = createFolder("", "root");
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
    insertLeaf(folderMap, root, page.category, leaf);
  }

  // Insert Markdown docs based on file-system structure.
  for (const doc of contentDocs) {
    const segments = doc.slug.split("/").filter(Boolean);
    const leafTitle = doc.title;
    const navPath = segments.slice(0, -1).join("/");
    const leaf: DocsNavItem = {
      type: "doc",
      id: doc.slug,
      slug: doc.slug,
      title: leafTitle,
      description: doc.description,
      order: doc.order,
      href: getDocHref(doc.slug),
    };

    insertLeaf(folderMap, root, navPath, leaf);
  }

  finalizeFolderOrders(root, folderOrderById);
  return root;
};

export const docsNavTree: DocsNavFolder = buildDocsNavTree();

export const flattenDocsNavItems = (node: DocsNavNode): DocsNavItem[] => {
  if (node.type === "folder") {
    return node.children.flatMap(flattenDocsNavItems);
  }
  return [node];
};
