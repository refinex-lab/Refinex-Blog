import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { IconFont } from "../../components/ui/IconFont";

const TOOL_ICON_IDS = {
  json: "icon-json",
  diff: "icon-chayiduibi",
  jwt: "icon-jwt-3",
  uuid: "icon-uuid",
  hash: "icon-hash",
  regex: "icon-zhengzechuli",
  cron: "icon-iconCron",
  timestamp: "icon-shijianchuo",
  ip: "icon-ipdizhi",
  linux: "icon-Linux",
  mime: "icon-MIME",
  whiteboard: "icon-Excalidraw",
  signature: "icon-dianziqianming",
  calculator: "icon-jisuanqi",
  base64: "icon-base64",
  "url-encode": "icon-copyUrl---B",
  "date-calc": "icon-riqijisuan_huaban",
  "image-convert": "icon-geshizhuanhuan-xuanzhong",
  "image-compress": "icon-tupianyasuo",
  "image-base64": "icon-base64",
  "color-picker": "icon-yansexuanzeqi",
  "http-status": "icon-HTTP",
  "user-agent": "icon-user_agent",
  "http-header": "icon-httpmoshi",
} as const;

const DEFAULT_TOOL_ICON_ID = "icon-tool-default";

const READY_ROUTES = new Set([
  "/tools/json",
  "/tools/diff",
  "/tools/base64",
  "/tools/url-encode",
  "/tools/jwt",
  "/tools/uuid",
  "/tools/hash",
  "/tools/regex",
  "/tools/cron",
  "/tools/timestamp",
  "/tools/date-calc",
  "/tools/image-convert",
  "/tools/image-compress",
  "/tools/image-base64",
  "/tools/color-picker",
  "/tools/http-status",
  "/tools/ip",
  "/tools/user-agent",
  "/tools/linux",
  "/tools/mime",
  "/tools/http-header",
  "/tools/signature",
  "/tools/calculator",
  "/tools/whiteboard",
]);

const TOOL_GROUPS = [
  {
    id: "data",
    title: "数据处理",
    description: "高频数据格式转换与校验处理",
    items: [
      {
        id: "json",
        name: "JSON 格式化与转换",
        route: "/tools/json",
        tags: [
          "json",
          "format",
          "minify",
          "yaml",
          "xml",
          "jsonpath",
        ],
      },
      {
        id: "diff",
        name: "文本差异对比",
        route: "/tools/diff",
        tags: ["diff", "text", "json", "compare"],
      },
      {
        id: "base64",
        name: "Base64 编码解码",
        route: "/tools/base64",
        tags: ["base64", "encode", "decode", "image"],
      },
      {
        id: "url-encode",
        name: "URL 编码解码",
        route: "/tools/url-encode",
        tags: ["url", "encode", "decode"],
      },
      {
        id: "jwt",
        name: "JWT 解析器",
        route: "/tools/jwt",
        tags: ["jwt", "token", "decode"],
      },
    ],
  },
  {
    id: "dev",
    title: "编码与开发",
    description: "常用工程工具与编码辅助",
    items: [
      {
        id: "uuid",
        name: "UUID 生成器",
        route: "/tools/uuid",
        tags: ["uuid", "generate"],
      },
      {
        id: "hash",
        name: "哈希生成器",
        route: "/tools/hash",
        tags: ["hash", "md5", "sha"],
      },
      {
        id: "regex",
        name: "正则表达式测试器",
        route: "/tools/regex",
        tags: ["regex", "test"],
      },
      {
        id: "cron",
        name: "Cron 表达式解析器",
        route: "/tools/cron",
        tags: ["cron", "schedule"],
      },
    ],
  },
  {
    id: "time",
    title: "时间与日期",
    description: "快速处理时间、日期与区间计算",
    items: [
      {
        id: "timestamp",
        name: "时间戳转换",
        route: "/tools/timestamp",
        tags: ["timestamp", "date"],
      },
      {
        id: "date-calc",
        name: "日期计算器",
        route: "/tools/date-calc",
        tags: ["date", "calc", "workday"],
      },
    ],
  },
  {
    id: "image",
    title: "图片工具",
    description: "图像转换、压缩与预览",
    items: [
      {
        id: "image-convert",
        name: "图片格式转换",
        route: "/tools/image-convert",
        tags: ["image", "convert", "png", "jpg", "webp"],
      },
      {
        id: "image-compress",
        name: "图片压缩",
        route: "/tools/image-compress",
        tags: ["image", "compress"],
      },
      {
        id: "image-base64",
        name: "图片 Base64 转换",
        route: "/tools/image-base64",
        tags: ["image", "base64"],
      },
      {
        id: "color-picker",
        name: "颜色选择器",
        route: "/tools/color-picker",
        tags: ["color", "picker", "rgb", "hsl"],
      },
    ],
  },
  {
    id: "network",
    title: "网络工具",
    description: "网络协议与请求信息查询",
    items: [
      {
        id: "http-status",
        name: "HTTP 状态码查询",
        route: "/tools/http-status",
        tags: ["http", "status"],
      },
      {
        id: "user-agent",
        name: "User-Agent 解析",
        route: "/tools/user-agent",
        tags: ["ua", "user-agent"],
      },
      {
        id: "ip",
        name: "IP 信息查询",
        route: "/tools/ip",
        tags: ["ip", "network"],
      },
    ],
  },
  {
    id: "reference",
    title: "开发参考",
    description: "常用参考资料与查询",
    items: [
      {
        id: "linux",
        name: "Linux 命令查询",
        route: "/tools/linux",
        tags: ["linux", "command"],
      },
      {
        id: "mime",
        name: "MIME 类型查询",
        route: "/tools/mime",
        tags: ["mime", "file"],
      },
      {
        id: "http-header",
        name: "HTTP Header 查询",
        route: "/tools/http-header",
        tags: ["http", "header"],
      },
    ],
  },
  {
    id: "utility",
    title: "实用工具",
    description: "办公与效率提升",
    items: [
      {
        id: "whiteboard",
        name: "在线白板",
        route: "/tools/whiteboard",
        tags: ["whiteboard", "canvas"],
      },
      {
        id: "signature",
        name: "电子签名",
        route: "/tools/signature",
        tags: ["signature", "canvas"],
      },
      {
        id: "calculator",
        name: "计算器",
        route: "/tools/calculator",
        tags: ["calculator", "math"],
      },
    ],
  },
] as const;

type ToolItem = (typeof TOOL_GROUPS)[number]["items"][number];

const highlightText = (text: string, query: string) => {
  const q = query.trim();
  if (!q) return text;
  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const idx = lower.indexOf(lowerQ);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-[var(--accent-color)]/30 px-0.5 text-inherit">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
};

export const ToolsPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const timerRef = useRef<number | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const filteredGroups = useMemo(() => {
    return TOOL_GROUPS.filter(
      (group) => activeGroup === "all" || group.id === activeGroup
    )
      .map((group) => {
        if (!normalizedQuery) return group;
        const items = group.items.filter((item) => {
          const haystack = [item.name, item.route, ...(item.tags ?? [])]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedQuery);
        });
        return { ...group, items };
      })
      .filter((group) => group.items.length > 0);
  }, [activeGroup, normalizedQuery]);

  const handleToolClick = (tool: ToolItem) => {
    if (READY_ROUTES.has(tool.route)) {
      navigate(tool.route);
      return;
    }
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setNotice("该工具敬请期待");
    timerRef.current = window.setTimeout(() => {
      setNotice(null);
    }, 1800);
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6 px-6 py-8">
      <section className="sticky top-[84px] z-20 flex flex-col gap-3 rounded-[24px] border border-black/5 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索工具名称、路由或能力关键词"
            className="h-12 w-full rounded-2xl border border-black/10 bg-white/80 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
          />
        </div>
        {notice ? (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
            {notice}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setActiveGroup("all")}
            className={`rounded-full border px-3 py-1 transition ${
              activeGroup === "all"
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                : "border-black/10 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/30"
            }`}
          >
            全部
          </button>
          {TOOL_GROUPS.map((group) => {
            const active = activeGroup === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroup(group.id)}
                className={`rounded-full border px-3 py-1 transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                    : "border-black/10 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/30"
                }`}
              >
                {group.title}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {group.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {group.description}
                </p>
              </div>
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {group.items.length} 项
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {group.items.map((tool) => {
                const isReady = READY_ROUTES.has(tool.route);
                const iconId =
                  TOOL_ICON_IDS[tool.id as keyof typeof TOOL_ICON_IDS] ??
                  DEFAULT_TOOL_ICON_ID;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleToolClick(tool)}
                    className="group relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl border border-black/5 bg-white/80 p-3 text-left shadow-sm transition hover:-translate-y-[1px] hover:border-slate-200 hover:shadow-md dark:border-white/10 dark:bg-slate-950/50 dark:hover:border-white/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/5 text-slate-600 transition group-hover:bg-black/10 dark:bg-white/10 dark:text-white">
                        <IconFont id={iconId} className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {highlightText(tool.name, query)}
                        </div>
                        <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-300">
                          {(tool.tags ?? []).slice(0, 3).join(" · ")}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`pointer-events-none absolute bottom-2 right-2 inline-flex min-w-14 items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 ${
                        isReady
                          ? "border-slate-900 bg-slate-900 text-white opacity-0 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                          : "border-black/10 bg-white/80 text-slate-500 opacity-0 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                      }`}
                    >
                      {isReady ? "Go" : "Soon"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/10 bg-white/70 p-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <div className="text-base font-semibold text-slate-800 dark:text-white">
              未找到匹配的工具
            </div>
            <p>尝试换一个关键词或者清空搜索。</p>
          </div>
        ) : null}
      </section>
    </div>
  );
};
