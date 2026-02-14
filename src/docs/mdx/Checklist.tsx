import type { ReactNode } from "react";
import { CheckCircle2, Circle } from "lucide-react";

export const Checklist = ({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) => {
  return (
    <div className="my-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-950">
      {title ? (
        <p className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </p>
      ) : null}
      <ul className="m-0 list-none space-y-2 p-0">{children}</ul>
    </div>
  );
};

export const CheckItem = ({
  checked = false,
  children,
}: {
  checked?: boolean;
  children: ReactNode;
}) => {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-7 text-zinc-800 dark:text-zinc-200">
      {checked ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-600" />
      )}
      <div className="min-w-0">{children}</div>
    </li>
  );
};

