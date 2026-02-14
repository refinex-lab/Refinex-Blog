import { Terminal as TerminalIcon } from "lucide-react";
import type { ReactNode } from "react";
import { CopyIconButton } from "./CopyIconButton";

const toText = (node: ReactNode): string => {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  return "";
};

export const Terminal = ({
  title = "terminal",
  children,
}: {
  title?: string;
  children: ReactNode;
}) => {
  const text = toText(children).replace(/\n$/, "");

  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-black/10 bg-zinc-950 text-zinc-50 dark:border-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2 text-[12px] text-zinc-300">
        <span className="inline-flex items-center gap-2 font-medium tracking-wide">
          <TerminalIcon className="h-4 w-4" />
          {title}
        </span>
        <CopyIconButton text={text} label="复制终端内容" variant="dark" />
      </div>
      <pre className="m-0 overflow-x-auto px-4 py-4 text-[13px] leading-6">
        <code className="font-mono">{text}</code>
      </pre>
    </div>
  );
};
