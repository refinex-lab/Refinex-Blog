import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import monacoEditorPluginImport from "vite-plugin-monaco-editor";

const monacoEditorPlugin =
  (monacoEditorPluginImport as any).default ?? monacoEditorPluginImport;

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "refinex-blog",
    rollupOptions: {
      output: {
        manualChunks: {
          // 核心框架单独打包
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // UI 组件库单独打包
          "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-hover-card"],
          // 图标库单独打包
          "vendor-icons": ["lucide-react", "react-icons"],
          // Monaco Editor 单独打包（大型依赖）
          "vendor-monaco": ["@monaco-editor/react", "monaco-editor"],
          // Excalidraw 单独打包（大型依赖）
          "vendor-excalidraw": ["@excalidraw/excalidraw"],
        },
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 提高 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
  },
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
    monacoEditorPlugin({
      languageWorkers: [
        "editorWorkerService",
        "typescript",
        "json",
        "html",
        "css",
      ],
    }),
  ],
});
