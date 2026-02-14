import type { ReactNode } from "react";

const styles: Record<string, string> = {
  default:
    "border-black/10 bg-black/[0.03] text-zinc-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200",
  info: "border-blue-200/70 bg-blue-50/80 text-blue-900 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-100",
  success:
    "border-emerald-200/70 bg-emerald-50/80 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100",
  warning:
    "border-amber-200/70 bg-amber-50/80 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100",
  danger:
    "border-red-200/70 bg-red-50/80 text-red-900 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-100",
  beta: "border-violet-200/70 bg-violet-50/80 text-violet-900 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-100",
  new: "border-teal-200/70 bg-teal-50/80 text-teal-900 dark:border-teal-400/30 dark:bg-teal-500/10 dark:text-teal-100",
};

const defaultLabelByType: Record<string, string> = {
  beta: "Beta",
  new: "New",
  danger: "Danger",
  warning: "Warning",
  success: "Success",
  info: "Info",
};

export const Badge = ({
  type = "default",
  children,
}: {
  type?: keyof typeof styles | string;
  children?: ReactNode;
}) => {
  const label =
    children ?? defaultLabelByType[type] ?? (typeof type === "string" ? type : "");

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5 mr-2 ${styles[type] ?? styles.default}`}
    >
      {label}
    </span>
  );
};
