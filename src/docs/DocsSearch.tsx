import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchDocsByQuery } from "./search";

const highlight = (text: string, query: string) => {
  const q = query.trim();
  if (!q) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx < 0) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);

  return (
    <>
      {before}
      <mark className="rounded bg-[var(--accent-color)]/40 px-0.5 text-inherit dark:bg-[var(--accent-color)]/35">
        {match}
      </mark>
      {after}
    </>
  );
};

export const DocsSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  // Close the dialog after navigation.
  useEffect(() => {
    if (!open) return;
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const results = useMemo(() => searchDocsByQuery(query, 30), [query]);

  const handleSelect = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-left text-sm text-zinc-500 transition hover:bg-white dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-400 dark:hover:bg-zinc-950/70"
          aria-label="站内搜索"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 truncate">Search</span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            <kbd className="rounded border border-black/10 bg-white px-1.5 py-0.5 font-sans dark:border-white/10 dark:bg-zinc-900">
              ⌘
            </kbd>
            <kbd className="rounded border border-black/10 bg-white px-1.5 py-0.5 font-sans dark:border-white/10 dark:bg-zinc-900">
              K
            </kbd>
          </span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm dark:bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-[12vh] z-50 w-[min(720px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl border border-black/10 bg-white shadow-2xl shadow-black/15 outline-none dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/40">
          <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3 dark:border-white/10">
            <Search className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the docs"
              className="h-10 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50"
                aria-label="关闭搜索"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="max-h-[56vh] overflow-y-auto px-2 py-2">
            {query.trim() ? (
              <p className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                {results.length} results for{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {query.trim()}
                </span>
              </p>
            ) : (
              <p className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                输入关键字开始搜索（支持中文）。
              </p>
            )}

            <div className="space-y-1 px-1 pb-2">
              {results.map((hit) => (
                <button
                  key={hit.id}
                  type="button"
                  onClick={() => handleSelect(hit.href)}
                  className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {highlight(hit.title, query)}
                    </p>
                    {hit.section ? (
                      <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                        {hit.section}
                      </span>
                    ) : null}
                  </div>
                  {hit.snippet ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      {highlight(hit.snippet, query)}
                    </p>
                  ) : null}
                </button>
              ))}

              {query.trim() && results.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  没有找到匹配结果
                </div>
              ) : null}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

