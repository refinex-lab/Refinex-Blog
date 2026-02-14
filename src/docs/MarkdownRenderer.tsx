import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Components } from "react-markdown";
import { CodeBlock } from "./CodeBlock";
import { MermaidBlock } from "./MermaidBlock";
import { MarkdownImage } from "./MarkdownImage";
import "./markdown.css";

const components: Components = {
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children, ...props }) => {
    const code = String(children ?? "").replace(/\n$/, "");
    const match = /language-([^ ]+)/.exec(className ?? "");
    const language = match?.[1]?.trim().toLowerCase();

    // Some fenced blocks may not carry language className; newline means block.
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
};

export const MarkdownRenderer = ({ markdown }: { markdown: string }) => {
  return (
    <article className="docs-markdown w-full max-w-none pb-20 pt-10">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: ["docs-heading-anchor"] },
            },
          ],
        ]}
        components={components}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
};
