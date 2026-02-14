import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export const KeyPoint = ({
  title = "Key point",
  children,
}: {
  title?: string;
  children: ReactNode;
}) => {
  return (
    <div className="my-4 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100">
      <div className="flex gap-2.5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700 dark:text-zinc-200" />
        <div className="min-w-0">
          <p className="mb-1 text-sm font-semibold">{title}</p>
          <div className="text-sm leading-7 text-zinc-800 dark:text-zinc-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

