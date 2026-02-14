import type { ComponentType } from "react";
import { OverviewPage } from "../pages/docs/custom/OverviewPage";

export type DocsCustomPage = {
  slug: string;
  title: string;
  description?: string;
  order: number;
  category: string;
  component: ComponentType;
  searchText?: string;
};

export const docsCustomPages: DocsCustomPage[] = [
  {
    slug: "overview",
    title: "概览",
    description: "了解当前博客文档系统的目录约定、渲染能力与扩展方式。",
    order: 1,
    category: "开始使用",
    component: OverviewPage,
    searchText:
      "content 目录约定、Markdown 渲染、目录树生成、亮暗主题、站内搜索、扩展能力",
  },
];

