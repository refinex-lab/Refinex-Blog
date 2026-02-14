import type { ReactNode } from "react";

const PageSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  const sectionId = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-");

  return (
    <section className="space-y-3">
      <h2
        id={sectionId}
        className="scroll-mt-24 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
      >
        {title}
      </h2>
      <div className="space-y-2 text-[15px] leading-7 text-zinc-600 dark:text-zinc-300">
        {children}
      </div>
    </section>
  );
};

export const OverviewPage = () => {
  return (
    <article className="w-full max-w-none space-y-10 pb-20 pt-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          Refinex Docs
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Static Blog Documentation
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          这是一个面向技术博客的静态文档系统：左侧目录树自动从
          <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] dark:bg-zinc-800">
            /content
          </code>
          目录构建，右侧支持自定义页面和 Markdown 渲染，支持亮/暗主题与站内搜索。
        </p>
      </header>

      <PageSection title="核心能力">
        <ul className="list-disc space-y-1 pl-5">
          <li>自动扫描目录树并生成导航（文件夹可展开/折叠）</li>
          <li>支持中文路径、中文标题与中文搜索</li>
          <li>Markdown 支持代码高亮、表格、任务列表、锚点标题</li>
          <li>统一布局风格，接近 OpenAI Developers 文档体验</li>
        </ul>
      </PageSection>

      <PageSection title="目录约定">
        <p>推荐把博客内容组织为以下结构：</p>
        <pre className="overflow-x-auto rounded-2xl border border-black/10 bg-zinc-50 p-4 text-[13px] leading-6 dark:border-white/10 dark:bg-zinc-900">
          {`content
  ├─ Java
  │   ├─ 基础入门
  │   │   └─ 基本介绍.md
  │   └─ 集合框架
  │       └─ List 与 Set.md
  └─ Spring Boot
      └─ 基础概念
          └─ 什么是 SpringBoot.md`}
        </pre>
      </PageSection>

      <PageSection title="后续扩展建议">
        <ol className="list-decimal space-y-1 pl-5">
          <li>接入 MDX，实现 React 组件级内容能力。</li>
          <li>将搜索结果增加关键词高亮与分词建议。</li>
          <li>引入阅读进度、文档贡献时间与标签体系。</li>
        </ol>
      </PageSection>
    </article>
  );
};
