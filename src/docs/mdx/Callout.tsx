import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  NotebookPen,
  OctagonAlert,
  TriangleAlert,
} from "lucide-react";

type CalloutType = "info" | "note" | "tip" | "success" | "warning" | "danger";

const stylesByType: Record<CalloutType, string> = {
  info: "border-blue-200/80 bg-blue-50/80 text-blue-900 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-100",
  note: "border-zinc-200/80 bg-zinc-50/80 text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100",
  tip: "border-emerald-200/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100",
  success:
    "border-emerald-200/80 bg-emerald-50/60 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100",
  warning:
    "border-amber-200/80 bg-amber-50/80 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100",
  danger:
    "border-red-200/80 bg-red-50/80 text-red-900 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-100",
};

const iconByType: Record<CalloutType, ReactNode> = {
  info: <Info className="mt-0.5 h-4 w-4 shrink-0" />,
  note: <NotebookPen className="mt-0.5 h-4 w-4 shrink-0" />,
  tip: <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />,
  success: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />,
  warning: <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />,
  danger: <OctagonAlert className="mt-0.5 h-4 w-4 shrink-0" />,
};

export const Callout = ({
  type = "info",
  title,
  collapsible = false,
  defaultOpen = true,
  children,
}: {
  type?: CalloutType;
  title?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}) => {
  const style = stylesByType[type];
  const [open, setOpen] = useState(defaultOpen);

  const header = useMemo(() => {
    const titleNode = title ? (
      <p className="text-sm font-semibold">{title}</p>
    ) : (
      <p className="text-sm font-semibold">{type.toUpperCase()}</p>
    );

    return (
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-2.5">
          {iconByType[type]}
          <div className="min-w-0">{titleNode}</div>
        </div>
        {collapsible ? (
          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-current/70">
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        ) : null}
      </div>
    );
  }, [collapsible, open, title, type]);

  if (!collapsible) {
    return (
      <div className={`my-4 rounded-xl border px-4 py-3 ${style}`}>
        <div className="flex gap-2.5">
          {iconByType[type]}
          <div className="min-w-0">
            {title ? <p className="mb-1 text-sm font-semibold">{title}</p> : null}
            <div className="text-sm leading-7">{children}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className={`my-4 rounded-xl border px-4 py-3 ${style}`}>
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="w-full cursor-pointer text-left"
            aria-label={open ? "收起 Callout" : "展开 Callout"}
          >
            {header}
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div className="mt-2 text-sm leading-7">{children}</div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
};
