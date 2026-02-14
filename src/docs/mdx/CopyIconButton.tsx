import { Check, Copy } from "lucide-react";
import { useState } from "react";

export const CopyIconButton = ({
  text,
  label = "复制",
  variant = "light",
}: {
  text: string;
  label?: string;
  variant?: "light" | "dark";
}) => {
  const [copied, setCopied] = useState(false);
  const variantClasses =
    variant === "dark"
      ? "text-zinc-300 hover:bg-white/10 hover:text-white"
      : "text-zinc-500 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${variantClasses}`}
      aria-label={label}
      title={copied ? "Copied" : "Copy"}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
};
