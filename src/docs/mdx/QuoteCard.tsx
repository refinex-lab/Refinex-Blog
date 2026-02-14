import type { ReactNode } from "react";
import { Quote } from "lucide-react";

export const QuoteCard = ({
  author,
  source,
  children,
}: {
  author?: string;
  source?: string;
  children: ReactNode;
}) => {
  return (
    <figure className="my-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex gap-2.5">
        <Quote className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
        <blockquote className="m-0 min-w-0 border-l-0 pl-0 text-sm leading-7 text-zinc-800 dark:text-zinc-200">
          {children}
        </blockquote>
      </div>
      {(author || source) && (
        <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {author ? <span className="font-medium">{author}</span> : null}
          {author && source ? <span className="mx-1">·</span> : null}
          {source ? <span>{source}</span> : null}
        </figcaption>
      )}
    </figure>
  );
};
