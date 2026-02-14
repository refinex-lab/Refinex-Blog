import { docsCustomPages } from "./customPages";
import type {
  DocsNavFolder,
  DocsNavItem,
  DocsNavNode,
  MarkdownDoc,
} from "./types";
import {
  finalizeFolderOrders,
  getDocHref,
  inferTitleFromMarkdown,
  normalizeContentFilePath,
  toNumberOrInfinity,
} from "./utils";

const markdownModules = import.meta.glob("../../content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const parseFrontmatter = (raw: string): { data: Record<string, unknown>; body: string } => {
  // Minimal frontmatter parser to avoid Node-only Buffer/polyfills in the browser.
  // Supports:
  // ---
  // title: xxx
  // order: 1
  // description: yyy
  // ---
  if (!raw.startsWith("---")) {
    return { data: {}, body: raw };
  }

  const lines = raw.split(/\r?\n/);
  if (lines[0].trim() !== "---") {
    return { data: {}, body: raw };
  }

  const data: Record<string, unknown> = {};
  let i = 1;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "---") {
      i++;
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

  const body = lines.slice(i).join("\n");
  return { data, body };
};

const parseMarkdownDoc = (modulePath: string, raw: string): MarkdownDoc => {
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

  const order = toNumberOrInfinity(parsed.data.order);

  return {
    slug,
    title,
    description,
    order,
    sourcePath,
    raw,
    body: parsed.body.trim(),
  };
};

export const markdownDocs: MarkdownDoc[] = Object.entries(markdownModules)
  .map(([modulePath, raw]) => parseMarkdownDoc(modulePath, raw))
  .sort((a, b) => a.slug.localeCompare(b.slug, "zh-Hans"));

export const markdownDocBySlug = new Map<string, MarkdownDoc>(
  markdownDocs.map((doc) => [doc.slug, doc])
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
  for (const doc of markdownDocs) {
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
