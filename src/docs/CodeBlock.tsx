import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import kotlin from "react-syntax-highlighter/dist/esm/languages/prism/kotlin";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import properties from "react-syntax-highlighter/dist/esm/languages/prism/properties";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import xml from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import { useTheme } from "../providers/useTheme";

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("c", c);
SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("diff", diff);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("kotlin", kotlin);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("properties", properties);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("xml", xml);
SyntaxHighlighter.registerLanguage("yaml", yaml);

const SUPPORTED_LANGUAGES = new Set<string>([
  "bash",
  "c",
  "cpp",
  "css",
  "diff",
  "go",
  "java",
  "javascript",
  "json",
  "jsx",
  "kotlin",
  "markdown",
  "properties",
  "python",
  "sql",
  "tsx",
  "typescript",
  "xml",
  "yaml",
]);

const normalizeLanguage = (language?: string): string => {
  if (!language) return "text";
  const trimmed = language.trim().toLowerCase();
  if (!trimmed) return "text";

  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    yml: "yaml",
    html: "xml",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    kts: "kotlin",
    md: "markdown",
  };
  const normalized = aliases[trimmed] ?? trimmed;
  return SUPPORTED_LANGUAGES.has(normalized) ? normalized : "text";
};

export const CodeBlock = ({
  code,
  language,
}: {
  code: string;
  language?: string;
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [copied, setCopied] = useState(false);

  const normalizedCode = useMemo(() => code.replace(/\n$/, ""), [code]);
  const lang = normalizeLanguage(language);
  const theme = isDark ? oneDark : oneLight;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(normalizedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard might be unavailable (non-HTTPS). Fallback silently.
      setCopied(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-4 border-b border-black/5 px-4 py-2 text-[12px] text-zinc-500 dark:border-white/10 dark:text-zinc-400">
        <span className="font-medium tracking-wide">{lang}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50"
          aria-label="复制代码"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto px-4 py-4 text-[13px] leading-6">
        <SyntaxHighlighter
          language={lang}
          style={theme}
          wrapLongLines
          customStyle={{
            margin: 0,
            background: "transparent",
            padding: 0,
            fontSize: "13px",
            lineHeight: "1.6",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
            },
          }}
        >
          {normalizedCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
