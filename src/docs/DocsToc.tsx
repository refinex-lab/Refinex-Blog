import { useEffect, useState } from "react";
import type { RefObject } from "react";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

const buildTocItems = (root: HTMLElement): TocItem[] => {
  const headings = Array.from(root.querySelectorAll<HTMLElement>("h2[id], h3[id]"));

  const items: TocItem[] = [];
  for (const el of headings) {
    const text = el.textContent?.trim() ?? "";
    if (!text) continue;
    const level = el.tagName.toUpperCase() === "H3" ? 3 : 2;
    items.push({ id: el.id, text, level });
  }
  return items;
};

export const DocsToc = ({
  contentRef,
  docKey,
}: {
  contentRef: RefObject<HTMLElement | null>;
  docKey: string;
}) => {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Rebuild on navigation/content change (the DOM under contentRef will be replaced).
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const nextItems = buildTocItems(root);
    setItems(nextItems);
    setActiveId((prev) => prev || nextItems[0]?.id || "");

    const headings = nextItems
      .map((item) => root.querySelector<HTMLElement>(`#${CSS.escape(item.id)}`))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).getBoundingClientRect().top -
              (b.target as HTMLElement).getBoundingClientRect().top
          );

        const topMost = visible[0]?.target as HTMLElement | undefined;
        if (topMost?.id) {
          setActiveId(topMost.id);
        }
      },
      {
        root: null,
        // Account for the sticky header + a little breathing room.
        rootMargin: "-96px 0px -70% 0px",
        threshold: 0,
      }
    );

    for (const el of headings) observer.observe(el);
    return () => observer.disconnect();
  }, [contentRef, docKey]);

  const hasItems = items.length > 0;

  if (!hasItems) {
    return null;
  }

  return (
    <div className="flex h-full flex-col px-4 py-5">
      <nav className="flex-1 overflow-y-auto overscroll-contain">
        <div className="border-l border-black/10 pl-3 dark:border-white/10">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative -ml-[13px] block rounded-md py-1.5 pl-4 text-sm transition-colors ${
                  item.level === 3 ? "pl-7" : ""
                } ${
                  isActive
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                <span
                  className={`absolute bottom-1 top-1 left-0 w-px rounded-full ${
                    isActive
                      ? "bg-zinc-900 dark:bg-zinc-100"
                      : "bg-transparent"
                  }`}
                />
                {item.text}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
