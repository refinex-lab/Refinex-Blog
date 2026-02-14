import { File, Folder, FolderTree } from "lucide-react";
import type { ReactNode } from "react";
import { CopyIconButton } from "./CopyIconButton";

const toText = (node: ReactNode): string => {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  return "";
};

export const FileTree = ({
  title = "file tree",
  children,
}: {
  title?: string;
  children: ReactNode;
}) => {
  const text = toText(children).replace(/\n$/, "");
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\t/g, "  "))
    .filter((line) => line.trim().length > 0);
  const entries = lines.map((line, index) => {
    const leadingSpaces = line.match(/^ */)?.[0].length ?? 0;
    const level = Math.floor(leadingSpaces / 2);
    const label = line.trim();
    const isDir = label.endsWith("/");

    return {
      key: `${index}-${label}`,
      level,
      label,
      isDir,
    };
  });

  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-2 text-[12px] text-zinc-500 dark:border-white/10 dark:text-zinc-400">
        <span className="inline-flex items-center gap-2 font-medium tracking-wide">
          <FolderTree className="h-4 w-4" />
          {title}
        </span>
        <CopyIconButton text={text} label="复制目录结构" />
      </div>
      <div className="overflow-x-auto px-4 py-4 text-[13px]">
        <div className="space-y-1 font-mono leading-6 text-zinc-700 dark:text-zinc-200">
          {entries.map((entry) => (
            <div
              key={entry.key}
              className="flex items-center gap-2"
              style={{ paddingLeft: entry.level * 14 }}
            >
              {entry.isDir ? (
                <Folder className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              ) : (
                <File className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              )}
              <span
                className={
                  entry.isDir
                    ? "font-medium text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-700 dark:text-zinc-200"
                }
              >
                {entry.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
