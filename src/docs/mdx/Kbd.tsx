import type { ReactNode } from "react";

export const Kbd = ({ children }: { children: ReactNode }) => {
  return (
    <kbd className="rounded-lg border border-black/10 bg-white px-2 py-0.5 font-sans text-[12px] text-zinc-700 shadow-sm shadow-black/[0.03] dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200">
      {children}
    </kbd>
  );
};

