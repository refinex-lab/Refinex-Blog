import type { ComponentType } from "react";
import { OverviewPage } from "../pages/docs/custom/OverviewPage";

export type DocsCustomPage = {
  slug: string;
  title: string;
  description?: string;
  order: number;
  component: ComponentType;
  searchText?: string;
  fullWidth?: boolean;
};

export const docsCustomPages: DocsCustomPage[] = [
  {
    slug: "overview",
    title: "文档中心",
    description: "浏览所有文档分类与近期更新",
    order: 0,
    component: OverviewPage,
    searchText: "文档中心、分类浏览、近期更新、文章总览",
    fullWidth: true,
  },
];

