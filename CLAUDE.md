# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Type-check (tsc -b) then production build (vite build)
npm run lint     # ESLint across the project
npm run preview  # Preview the production build locally
```

No test framework is configured.

## Architecture

This is a React 19 SPA (not SSG) serving as a personal tech blog and developer tools hub. Built with Vite 7, TypeScript, Tailwind CSS v4, and Radix UI.

### Content System

- Blog content lives in `content/` as `.md` and `.mdx` files organized in folders that map directly to sidebar navigation.
- Ordering is controlled by `XX_` numeric prefixes on folder and file names (e.g. `01_开始使用/`, `02_快速开始.md`). Prefixes are stripped from display names and URLs at build time.
- Frontmatter fields: `title`, `description`, `cover`, `author`, `createdAt`, `updatedAt`. No `order` field needed — ordering comes from the filename prefix.
- `.md` files are loaded as raw strings via `import.meta.glob` and rendered client-side with `react-markdown`.
- `.mdx` files are compiled at build time by `@mdx-js/rollup` and dynamically imported as React components.
- Content indexing happens in `src/docs/contentIndex.ts` using Vite's `import.meta.glob`.
- Prefix parsing logic lives in `src/docs/utils.ts`: `parseOrderPrefix()`, `stripOrderPrefixFromPath()`, `orderFromPath()`.
- Full-text search uses FlexSearch with CJK encoder (`src/docs/search.ts`).
- Custom non-markdown pages can be registered in `src/docs/customPages.ts`.

### Routing (`src/App.tsx`)

- `/` — HomePage
- `/docs/*` — DocsPage (slug decoded from URL path; bare `/docs` redirects to `/docs/overview`)
- `/navigate` — Bookmarks/links page
- `/tools` — Tools index + 25 individual tool routes (`/tools/json`, `/tools/diff`, etc.)
- `/about` — Profile page
- `/ai` — AI hub page

### Key Directories

- `src/docs/` — Core documentation system: content indexing, markdown/MDX rendering, sidebar, TOC, search, and 14 custom MDX components in `src/docs/mdx/`.
- `src/pages/tools/` — 25+ standalone developer tool pages (JSON formatter, diff viewer, regex tester, whiteboard via Excalidraw, etc.).
- `src/config/` — Central configuration: `site.ts` (nav, footer, theme, icons), `profile.ts` (author data), `navigate.ts` (bookmarks).
- `src/providers/` — Theme provider with light/dark/system modes, persisted to `localStorage` under key `refinex-theme`.
- `src/components/ui/` — Shared UI primitives (Avatar, Card, Tag, IconFont).

### Rendering Pipeline

- `.md`: `react-markdown` + `remark-gfm` + `rehype-slug` + `rehype-autolink-headings`, with custom component overrides for code blocks (syntax highlighting via `react-syntax-highlighter`, Mermaid diagrams), links, and images.
- `.mdx`: Compiled by `@mdx-js/rollup` in `vite.config.ts` with the same remark/rehype plugins. Custom components are mapped in `src/docs/mdxComponents.tsx`.
- DocsPage layout: 3-column on XL (sidebar | content | TOC), 2-column on MD, single column on mobile.

### Notable Integrations

- `@excalidraw/excalidraw` for the whiteboard tool
- `@monaco-editor/react` for code editors in tool pages (JSON, diff, regex)
- `mermaid` for diagram rendering in markdown/MDX
- `iconfont` via Symbol/font-class modes configured in `src/config/site.ts`

## Content Conventions

- Content is in Chinese. Folder and file names use `XX_中文名称` format for ordering.
- To add a new doc: create `XX_名称.md` (or `.mdx`) in the appropriate `content/` subfolder. The numeric prefix controls sort order; the display name and URL are derived from the part after `XX_`.
- The site uses a custom lightweight frontmatter parser (not `gray-matter` at runtime) to avoid Node Buffer polyfills in the browser.
- MDX files have access to all components in `src/docs/mdx/`Tabs, Steps, Terminal, FileTree, Expandable, Definition, Kbd, KeyPoint, QuoteCard, Checklist, Badge, Counter) without explicit imports.
