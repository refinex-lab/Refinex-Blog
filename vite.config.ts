import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Compile `.mdx` to React components at build time.
    // Must run before the React plugin (MDX outputs JSX).
    mdx({
      // Only treat `.mdx` as MDX. Keep `.md` as plain markdown text so `?raw`
      // imports keep working and existing markdown rendering is not affected.
      include: ["**/*.mdx"],
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [
        remarkGfm,
        [remarkFrontmatter, ["yaml"]],
        remarkMdxFrontmatter,
      ],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: { className: ["docs-heading-anchor"] },
          },
        ],
      ],
    }),
    react(),
    tailwindcss(),
  ],
});
