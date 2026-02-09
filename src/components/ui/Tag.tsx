import type { ReactNode } from "react";

type TagProps = {
  children: ReactNode;
  className?: string;
};

export const Tag = ({ children, className }: TagProps) => {
  return (
    <span
      className={`rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-slate-600 transition-colors hover:border-black/20 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-white/10 ${
        className ?? ""
      }`}
    >
      {children}
    </span>
  );
};
