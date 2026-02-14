import type { ReactNode } from "react";

export const Definition = ({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) => {
  return (
    <div className="my-5 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-zinc-950/40">
      <p className="m-0 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {term}
      </p>
      <div className="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-200">
        {children}
      </div>
    </div>
  );
};

