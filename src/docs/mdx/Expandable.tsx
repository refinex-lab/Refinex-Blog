import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export const Expandable = ({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) => {
  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-black/10 bg-white/70 dark:border-white/10 dark:bg-zinc-950/40">
      <Collapsible.Root defaultOpen={defaultOpen}>
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-zinc-900 transition hover:bg-black/[0.03] dark:text-zinc-50 dark:hover:bg-white/[0.06]"
          >
            <span className="truncate">{title}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-zinc-400" />
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content className="px-4 pb-4 text-sm leading-7 text-zinc-700 dark:text-zinc-200">
          {children}
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
};
