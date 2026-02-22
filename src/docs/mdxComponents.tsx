import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "./CodeBlock";
import { MermaidBlock } from "./MermaidBlock";
import { MarkdownImage } from "./MarkdownImage";
import { Callout } from "./mdx/Callout";
import { Counter } from "./mdx/Counter";
import { Badge } from "./mdx/Badge";
import { Tabs, Tab } from "./mdx/Tabs";
import { Steps, Step } from "./mdx/Steps";
import { Terminal } from "./mdx/Terminal";
import { FileTree } from "./mdx/FileTree";
import { Expandable } from "./mdx/Expandable";
import { Definition } from "./mdx/Definition";
import { Kbd } from "./mdx/Kbd";
import { KeyPoint } from "./mdx/KeyPoint";
import { QuoteCard } from "./mdx/QuoteCard";
import { Checklist, CheckItem } from "./mdx/Checklist";
import { LinkCard } from "./mdx/LinkCard";

export const mdxComponents: MDXComponents = {
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children, ...props }) => {
    const code = String(children ?? "").replace(/\n$/, "");
    const match = /language-([^ ]+)/.exec(className ?? "");
    const language = match?.[1]?.trim().toLowerCase();

    const isInline = !className && !code.includes("\n");
    if (isInline) {
      return (
        <code
          className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.9em] text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          {...props}
        >
          {children}
        </code>
      );
    }

    if (language === "mermaid") {
      return <MermaidBlock chart={code} />;
    }

    return <CodeBlock code={code} language={language} />;
  },
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
      {...props}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }) => (
    <MarkdownImage src={src} alt={alt} {...props} />
  ),
  Callout,
  Counter,
  Badge,
  Tabs,
  Tab,
  Steps,
  Step,
  Terminal,
  FileTree,
  Expandable,
  Definition,
  Kbd,
  KeyPoint,
  QuoteCard,
  Checklist,
  CheckItem,
  LinkCard,
};
