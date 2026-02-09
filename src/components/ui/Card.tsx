import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={`rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur transition-colors hover:border-black/10 dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20 ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
};
