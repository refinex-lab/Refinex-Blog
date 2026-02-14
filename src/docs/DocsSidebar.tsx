import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { DocsNavFolder, DocsNavItem, DocsNavNode } from "./types";
import { DocsSearch } from "./DocsSearch";

const findAncestorFoldersByHref = (
  node: DocsNavNode,
  href: string,
  ancestors: string[] = []
): string[] | null => {
  if (node.type === "folder") {
    for (const child of node.children) {
      const next = findAncestorFoldersByHref(child, href, [
        ...ancestors,
        node.id,
      ]);
      if (next) return next;
    }
    return null;
  }
  return node.href === href ? ancestors : null;
};

const SidebarItem = ({
  item,
  depth,
}: {
  item: DocsNavItem;
  depth: number;
}) => {
  const paddingLeft = 12 + depth * 12;
  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `flex w-full items-center rounded-lg px-3 py-1.5 text-sm transition-colors ${
          isActive
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
            : "text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-zinc-50"
        }`
      }
      style={{ paddingLeft }}
      end
    >
      <span className="truncate">{item.title}</span>
    </NavLink>
  );
};

const SidebarFolder = ({
  folder,
  depth,
  forcedOpenIds,
  openIds,
  onToggle,
}: {
  folder: DocsNavFolder;
  depth: number;
  forcedOpenIds: Set<string>;
  openIds: Set<string>;
  onToggle: (id: string) => void;
}) => {
  const isTopLevel = depth === 0;
  const isOpen = isTopLevel || forcedOpenIds.has(folder.id) || openIds.has(folder.id);

  const headerPaddingLeft = 12 + depth * 12;

  return (
    <div className={isTopLevel ? "mt-4" : ""}>
      {isTopLevel ? (
        <div
          className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400"
          style={{ paddingLeft: headerPaddingLeft }}
        >
          {folder.title}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onToggle(folder.id)}
          className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-left text-sm font-medium text-zinc-700 transition hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10"
          style={{ paddingLeft: headerPaddingLeft, paddingRight: 12 }}
          aria-expanded={isOpen}
        >
          <span className="min-w-0 flex-1 truncate">{folder.title}</span>
          <span className="flex h-5 w-5 items-center justify-center text-zinc-500 dark:text-zinc-400">
            {/* OpenAI-like: caret is on the right; rotate when collapsed */}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? "rotate-0" : "-rotate-90"
              }`}
            />
          </span>
        </button>
      )}

      {isOpen ? (
        <div className="space-y-1">
          {folder.children.map((child) => (
            <SidebarNode
              key={`${child.type}:${child.id}`}
              node={child}
              depth={depth + 1}
              forcedOpenIds={forcedOpenIds}
              openIds={openIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const SidebarNode = ({
  node,
  depth,
  forcedOpenIds,
  openIds,
  onToggle,
}: {
  node: DocsNavNode;
  depth: number;
  forcedOpenIds: Set<string>;
  openIds: Set<string>;
  onToggle: (id: string) => void;
}) => {
  if (node.type === "folder") {
    return (
      <SidebarFolder
        folder={node}
        depth={depth}
        forcedOpenIds={forcedOpenIds}
        openIds={openIds}
        onToggle={onToggle}
      />
    );
  }
  return <SidebarItem item={node} depth={depth} />;
};

export const DocsSidebar = ({ tree }: { tree: DocsNavFolder }) => {
  const location = useLocation();
  const forcedOpenIds = useMemo(() => {
    const href = location.pathname;
    const ancestors = findAncestorFoldersByHref(tree, href) ?? [];
    return new Set(ancestors.filter(Boolean));
  }, [location.pathname, tree]);

  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    for (const child of tree.children) {
      if (child.type === "folder") {
        set.add(child.id);
      }
    }
    return set;
  });

  const toggleFolder = (id: string) => {
    if (forcedOpenIds.has(id)) return;
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-3 pt-4">
        <DocsSearch />
      </div>
      <nav className="flex-1 overflow-y-auto overscroll-contain px-2 pb-6">
        {tree.children.map((node) => (
          <SidebarNode
            key={`${node.type}:${node.id}`}
            node={node}
            depth={0}
            forcedOpenIds={forcedOpenIds}
            openIds={openIds}
            onToggle={toggleFolder}
          />
        ))}
      </nav>
    </div>
  );
};
