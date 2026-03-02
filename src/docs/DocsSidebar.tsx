import { ChevronDown, FileText, Folder } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { DocsNavFolder, DocsNavItem, DocsNavNode } from "./types";
import { DocsSearch } from "./DocsSearch";
import { IconFont } from "../components/ui/IconFont";

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
        `flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
          isActive
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
            : "text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-zinc-50"
        }`
      }
      style={{ paddingLeft }}
      end
    >
      {item.icon ? (
        <IconFont id={item.icon} className="h-4 w-4 shrink-0" />
      ) : (
        <FileText className="h-4 w-4 shrink-0" />
      )}
      <span className="truncate">{item.title}</span>
    </NavLink>
  );
};

const SidebarFolder = ({
  folder,
  depth,
  forcedOpenIds,
  openIds,
  manuallyClosedIds,
  onToggle,
}: {
  folder: DocsNavFolder;
  depth: number;
  forcedOpenIds: Set<string>;
  openIds: Set<string>;
  manuallyClosedIds: Set<string>;
  onToggle: (id: string) => void;
}) => {
  const isTopLevel = depth === 0;
  const isOpen =
    isTopLevel ||
    ((forcedOpenIds.has(folder.id) || openIds.has(folder.id)) &&
      !manuallyClosedIds.has(folder.id));

  const headerPaddingLeft = 12 + depth * 12;

  return (
    <div className={isTopLevel ? "mt-4" : ""}>
      {isTopLevel ? (
        <div
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400"
          style={{ paddingLeft: headerPaddingLeft }}
        >
          {folder.icon ? (
            <IconFont id={folder.icon} className="h-3.5 w-3.5 shrink-0" />
          ) : null}
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
          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
            {folder.icon ? (
              <IconFont id={folder.icon} className="h-4 w-4 shrink-0" />
            ) : (
              <Folder className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{folder.title}</span>
          </span>
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
        <div className="mt-1 space-y-1">
          {folder.children.map((child) => (
            <SidebarNode
              key={`${child.type}:${child.id}`}
              node={child}
              depth={depth + 1}
              forcedOpenIds={forcedOpenIds}
              openIds={openIds}
              manuallyClosedIds={manuallyClosedIds}
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
  manuallyClosedIds,
  onToggle,
}: {
  node: DocsNavNode;
  depth: number;
  forcedOpenIds: Set<string>;
  openIds: Set<string>;
  manuallyClosedIds: Set<string>;
  onToggle: (id: string) => void;
}) => {
  if (node.type === "folder") {
    return (
      <SidebarFolder
        folder={node}
        depth={depth}
        forcedOpenIds={forcedOpenIds}
        openIds={openIds}
        manuallyClosedIds={manuallyClosedIds}
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

  const [manuallyClosedIds, setManuallyClosedIds] = useState<Set<string>>(
    () => new Set()
  );

  // When navigation moves into a new folder, re-open it even if the user had closed it.
  useEffect(() => {
    setManuallyClosedIds((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set(prev);
      for (const id of forcedOpenIds) next.delete(id);
      return next.size === prev.size ? prev : next;
    });
  }, [forcedOpenIds]);

  const toggleFolder = (id: string) => {
    const isCurrentlyOpen =
      (forcedOpenIds.has(id) || openIds.has(id)) &&
      !manuallyClosedIds.has(id);

    if (isCurrentlyOpen) {
      setManuallyClosedIds((prev) => new Set(prev).add(id));
    } else {
      setManuallyClosedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setOpenIds((prev) => new Set(prev).add(id));
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-3 pt-4">
        <DocsSearch />
      </div>
      <nav
        className="app-scrollbar flex-1 overflow-y-auto overscroll-contain px-2 pb-6 pr-1"
        style={{ scrollbarGutter: "stable" }}
      >
        {tree.children.map((node) => (
          <SidebarNode
            key={`${node.type}:${node.id}`}
            node={node}
            depth={0}
            forcedOpenIds={forcedOpenIds}
            openIds={openIds}
            manuallyClosedIds={manuallyClosedIds}
            onToggle={toggleFolder}
          />
        ))}
      </nav>
    </div>
  );
};
