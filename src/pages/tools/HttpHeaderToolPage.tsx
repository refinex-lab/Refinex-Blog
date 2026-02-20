import { useMemo, useState } from "react";
import { Copy, Search, Waypoints } from "lucide-react";

type HeaderDirection = "request" | "response" | "both";
type HeaderCategory =
  | "auth"
  | "cache"
  | "content"
  | "cors"
  | "security"
  | "network"
  | "cookie";

type HttpHeaderItem = {
  name: string;
  direction: HeaderDirection;
  category: HeaderCategory;
  purpose: string;
  format: string;
  example: string;
  notes: string;
};

const HEADERS: HttpHeaderItem[] = [
  {
    name: "Authorization",
    direction: "request",
    category: "auth",
    purpose: "携带访问凭证（如 Bearer Token）。",
    format: "Authorization: <type> <credentials>",
    example: "Authorization: Bearer eyJhbGciOi...",
    notes: "敏感信息，不应打印到前端日志。",
  },
  {
    name: "WWW-Authenticate",
    direction: "response",
    category: "auth",
    purpose: "告知客户端需要何种认证方案。",
    format: "WWW-Authenticate: <scheme> realm=\"...\"",
    example: "WWW-Authenticate: Bearer realm=\"api\"",
    notes: "常与 401 状态码一起返回。",
  },
  {
    name: "Content-Type",
    direction: "both",
    category: "content",
    purpose: "声明消息体媒体类型。",
    format: "Content-Type: <mime>; charset=<encoding>",
    example: "Content-Type: application/json; charset=utf-8",
    notes: "接口交互中最常见且最关键的头之一。",
  },
  {
    name: "Accept",
    direction: "request",
    category: "content",
    purpose: "声明客户端可接受的响应类型。",
    format: "Accept: <mime>[, <mime>...]",
    example: "Accept: application/json",
    notes: "可配合内容协商返回不同格式。",
  },
  {
    name: "Content-Length",
    direction: "both",
    category: "network",
    purpose: "声明消息体字节长度。",
    format: "Content-Length: <bytes>",
    example: "Content-Length: 348",
    notes: "与 Transfer-Encoding 互斥。",
  },
  {
    name: "Host",
    direction: "request",
    category: "network",
    purpose: "声明目标主机与端口。",
    format: "Host: <domain>[:port]",
    example: "Host: api.example.com",
    notes: "HTTP/1.1 必选请求头。",
  },
  {
    name: "User-Agent",
    direction: "request",
    category: "network",
    purpose: "描述发起请求的客户端信息。",
    format: "User-Agent: <product>/<version>",
    example: "User-Agent: Mozilla/5.0 ...",
    notes: "用于统计与兼容判断，但不应作为安全判断依据。",
  },
  {
    name: "Referer",
    direction: "request",
    category: "network",
    purpose: "标识当前请求来源页面。",
    format: "Referer: <url>",
    example: "Referer: https://example.com/docs",
    notes: "受 Referrer-Policy 控制。",
  },
  {
    name: "Cache-Control",
    direction: "both",
    category: "cache",
    purpose: "定义缓存策略。",
    format: "Cache-Control: <directive>[, <directive>...]",
    example: "Cache-Control: public, max-age=3600",
    notes: "强缓存与协商缓存都依赖该头控制。",
  },
  {
    name: "ETag",
    direction: "response",
    category: "cache",
    purpose: "资源版本标识，用于协商缓存。",
    format: "ETag: \"<token>\"",
    example: "ETag: \"v2.1.7-abc\"",
    notes: "客户端可通过 If-None-Match 携带该值。",
  },
  {
    name: "If-None-Match",
    direction: "request",
    category: "cache",
    purpose: "携带缓存版本进行条件请求。",
    format: "If-None-Match: <etag>",
    example: "If-None-Match: \"v2.1.7-abc\"",
    notes: "资源未变化时服务端通常返回 304。",
  },
  {
    name: "Last-Modified",
    direction: "response",
    category: "cache",
    purpose: "声明资源上次修改时间。",
    format: "Last-Modified: <HTTP-date>",
    example: "Last-Modified: Tue, 18 Feb 2026 10:00:00 GMT",
    notes: "可与 If-Modified-Since 配合。",
  },
  {
    name: "If-Modified-Since",
    direction: "request",
    category: "cache",
    purpose: "按修改时间发起条件请求。",
    format: "If-Modified-Since: <HTTP-date>",
    example: "If-Modified-Since: Tue, 18 Feb 2026 10:00:00 GMT",
    notes: "时间精度限制下可能不如 ETag 精确。",
  },
  {
    name: "Set-Cookie",
    direction: "response",
    category: "cookie",
    purpose: "向客户端写入 Cookie。",
    format: "Set-Cookie: name=value; Path=/; HttpOnly; Secure",
    example: "Set-Cookie: sid=abc123; Path=/; HttpOnly; Secure",
    notes: "建议设置 HttpOnly、Secure、SameSite。",
  },
  {
    name: "Cookie",
    direction: "request",
    category: "cookie",
    purpose: "客户端向服务端发送 Cookie。",
    format: "Cookie: name=value; name2=value2",
    example: "Cookie: sid=abc123; theme=dark",
    notes: "Cookie 体积过大将影响请求性能。",
  },
  {
    name: "Access-Control-Allow-Origin",
    direction: "response",
    category: "cors",
    purpose: "声明允许跨域访问的来源。",
    format: "Access-Control-Allow-Origin: <origin>|*",
    example: "Access-Control-Allow-Origin: https://app.example.com",
    notes: "若带凭证，不可配置为 *。",
  },
  {
    name: "Access-Control-Allow-Methods",
    direction: "response",
    category: "cors",
    purpose: "声明允许的跨域方法。",
    format: "Access-Control-Allow-Methods: GET, POST, PUT, DELETE",
    example: "Access-Control-Allow-Methods: GET, POST",
    notes: "预检请求中尤为关键。",
  },
  {
    name: "Access-Control-Allow-Headers",
    direction: "response",
    category: "cors",
    purpose: "声明允许的跨域请求头。",
    format: "Access-Control-Allow-Headers: Header-1, Header-2",
    example: "Access-Control-Allow-Headers: Authorization, Content-Type",
    notes: "自定义头未被允许会触发浏览器拦截。",
  },
  {
    name: "Origin",
    direction: "request",
    category: "cors",
    purpose: "声明发起跨域请求的源。",
    format: "Origin: <scheme>://<host>[:port]",
    example: "Origin: https://app.example.com",
    notes: "服务端据此判断是否允许跨域。",
  },
  {
    name: "Strict-Transport-Security",
    direction: "response",
    category: "security",
    purpose: "启用 HSTS 强制 HTTPS。",
    format: "Strict-Transport-Security: max-age=<seconds>[; includeSubDomains]",
    example: "Strict-Transport-Security: max-age=31536000; includeSubDomains",
    notes: "启用前需确保 HTTPS 配置成熟。",
  },
  {
    name: "Content-Security-Policy",
    direction: "response",
    category: "security",
    purpose: "限制页面可加载资源来源，降低 XSS 风险。",
    format: "Content-Security-Policy: <directive> <source-list>; ...",
    example: "Content-Security-Policy: default-src 'self'; img-src 'self' data:",
    notes: "建议先以 report-only 方式灰度验证。",
  },
  {
    name: "X-Frame-Options",
    direction: "response",
    category: "security",
    purpose: "限制页面是否可被 iframe 嵌套。",
    format: "X-Frame-Options: DENY | SAMEORIGIN",
    example: "X-Frame-Options: SAMEORIGIN",
    notes: "也可通过 CSP 的 frame-ancestors 替代。",
  },
  {
    name: "X-Content-Type-Options",
    direction: "response",
    category: "security",
    purpose: "禁止浏览器 MIME 嗅探。",
    format: "X-Content-Type-Options: nosniff",
    example: "X-Content-Type-Options: nosniff",
    notes: "配合正确的 Content-Type 使用效果最佳。",
  },
];

const DIRECTION_OPTIONS: Array<{ id: "all" | HeaderDirection; label: string }> = [
  { id: "all", label: "全部" },
  { id: "request", label: "请求头" },
  { id: "response", label: "响应头" },
  { id: "both", label: "双向" },
];

const CATEGORY_OPTIONS: Array<{ id: "all" | HeaderCategory; label: string }> = [
  { id: "all", label: "全部" },
  { id: "auth", label: "认证授权" },
  { id: "cache", label: "缓存" },
  { id: "content", label: "内容协商" },
  { id: "cors", label: "跨域" },
  { id: "security", label: "安全" },
  { id: "network", label: "网络传输" },
  { id: "cookie", label: "Cookie" },
];

const directionLabelMap: Record<HeaderDirection, string> = {
  request: "请求",
  response: "响应",
  both: "双向",
};

const categoryLabelMap: Record<HeaderCategory, string> = {
  auth: "认证授权",
  cache: "缓存",
  content: "内容协商",
  cors: "跨域",
  security: "安全",
  network: "网络传输",
  cookie: "Cookie",
};

export const HttpHeaderToolPage = () => {
  const [query, setQuery] = useState("");
  const [activeDirection, setActiveDirection] = useState<"all" | HeaderDirection>(
    "all"
  );
  const [activeCategory, setActiveCategory] = useState<"all" | HeaderCategory>(
    "all"
  );
  const [selectedHeader, setSelectedHeader] = useState<HttpHeaderItem>(HEADERS[0]);
  const [copied, setCopied] = useState<string | null>(null);

  const list = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return HEADERS.filter((item) => {
      if (activeDirection !== "all" && item.direction !== activeDirection) {
        return false;
      }
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      if (!normalized) return true;
      const haystack = [
        item.name,
        item.purpose,
        item.format,
        item.example,
        item.notes,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [activeCategory, activeDirection, query]);

  const handleCopy = async (value: string, flag: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(flag);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 px-6 py-8">
      <section className="rounded-2xl border border-black/5 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100">
            <Waypoints className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              HTTP Header 查询
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              按请求/响应、分类与关键词快速检索常用 Header。
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索 Header 名称、用途、格式或示例"
              className="h-11 w-full rounded-xl border border-black/10 bg-white/85 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {DIRECTION_OPTIONS.map((option) => {
              const active = option.id === activeDirection;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveDirection(option.id)}
                  className={`rounded-full border px-3 py-1 transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                      : "border-black/10 bg-white/80 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {CATEGORY_OPTIONS.map((option) => {
              const active = option.id === activeCategory;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveCategory(option.id)}
                  className={`rounded-full border px-3 py-1 transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                      : "border-black/10 bg-white/80 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-black/5 bg-white/85 p-3 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Header 列表
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-300">
              {list.length} 条
            </span>
          </div>

          <div className="tool-scrollbar max-h-[60vh] space-y-2 overflow-auto pr-1">
            {list.map((item) => {
              const active = item.name === selectedHeader.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedHeader(item)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                      : "border-black/10 bg-white/90 hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold">{item.name}</span>
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      {directionLabelMap[item.direction]}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-xs ${
                      active
                        ? "text-white/80 dark:text-slate-300"
                        : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    {item.purpose}
                  </p>
                </button>
              );
            })}

            {!list.length ? (
              <div className="rounded-xl border border-dashed border-black/10 p-5 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
                没有找到匹配 Header，请切换筛选条件。
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-mono text-2xl font-semibold text-slate-900 dark:text-white">
                {selectedHeader.name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-black/10 bg-white/80 px-2 py-1 text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                  {directionLabelMap[selectedHeader.direction]}
                </span>
                <span className="rounded-full border border-black/10 bg-white/80 px-2 py-1 text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                  {categoryLabelMap[selectedHeader.category]}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(selectedHeader.name, "name")}
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/80 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            >
              <Copy className="h-4 w-4" />
              复制名称
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                用途
              </h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                {selectedHeader.purpose}
              </p>
            </div>

            <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  格式
                </h3>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedHeader.format, "format")}
                  className="inline-flex items-center gap-1 rounded-md border border-black/10 px-2 py-1 text-xs text-slate-600 transition hover:border-slate-300 dark:border-white/10 dark:text-slate-200"
                >
                  <Copy className="h-3.5 w-3.5" />
                  复制
                </button>
              </div>
              <p className="mt-2 rounded-lg bg-black/5 px-3 py-2 font-mono text-sm text-slate-800 dark:bg-white/10 dark:text-slate-100">
                {selectedHeader.format}
              </p>
            </div>

            <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                示例
              </h3>
              <p className="mt-2 rounded-lg bg-black/5 px-3 py-2 font-mono text-sm text-slate-800 dark:bg-white/10 dark:text-slate-100">
                {selectedHeader.example}
              </p>
            </div>

            <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                注意事项
              </h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                {selectedHeader.notes}
              </p>
            </div>
          </div>

          {copied ? (
            <div className="mt-4 inline-flex rounded-full border border-emerald-300/50 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {copied === "name" ? "已复制 Header 名称" : "已复制 Header 格式"}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};
