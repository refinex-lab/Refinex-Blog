import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Search, Wifi } from "lucide-react";

type StatusCategory = "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

type HttpStatusItem = {
  code: number;
  title: string;
  category: StatusCategory;
  summary: string;
  detail: string;
  useCase: string;
  hint: string;
};

const CATEGORY_OPTIONS: Array<{ id: "all" | StatusCategory; label: string }> = [
  { id: "all", label: "全部" },
  { id: "1xx", label: "1xx 信息" },
  { id: "2xx", label: "2xx 成功" },
  { id: "3xx", label: "3xx 重定向" },
  { id: "4xx", label: "4xx 客户端错误" },
  { id: "5xx", label: "5xx 服务端错误" },
];

const HTTP_STATUS_LIST: HttpStatusItem[] = [
  {
    code: 100,
    title: "Continue",
    category: "1xx",
    summary: "服务器已收到请求头，客户端可继续发送请求体。",
    detail: "常见于大文件上传或 Expect: 100-continue 场景。",
    useCase: "网关确认后再上传大体积数据，降低无效传输。",
    hint: "若无该机制，客户端也可直接发送请求体。",
  },
  {
    code: 101,
    title: "Switching Protocols",
    category: "1xx",
    summary: "服务端同意切换协议。",
    detail: "常见于 HTTP 升级到 WebSocket。",
    useCase: "握手成功后进入双向通信。",
    hint: "关注 Upgrade 与 Connection 请求头是否匹配。",
  },
  {
    code: 200,
    title: "OK",
    category: "2xx",
    summary: "请求成功并返回预期结果。",
    detail: "最常见成功状态，GET/POST/PUT/DELETE 都可使用。",
    useCase: "接口正常返回数据、更新成功。",
    hint: "建议统一响应结构，便于前端解析。",
  },
  {
    code: 201,
    title: "Created",
    category: "2xx",
    summary: "资源已创建成功。",
    detail: "通常用于创建类接口，推荐返回新资源地址。",
    useCase: "创建用户、创建订单、创建文章。",
    hint: "可配合 Location 响应头返回资源 URL。",
  },
  {
    code: 202,
    title: "Accepted",
    category: "2xx",
    summary: "请求已接收，但尚未完成处理。",
    detail: "适用于异步任务排队处理。",
    useCase: "导出报表、视频转码等后台任务。",
    hint: "建议返回任务 ID 供轮询查询。",
  },
  {
    code: 204,
    title: "No Content",
    category: "2xx",
    summary: "请求成功，但响应体为空。",
    detail: "常用于删除成功或无需返回内容的更新请求。",
    useCase: "DELETE 操作完成后返回。",
    hint: "前端不要再按 JSON 解析空响应体。",
  },
  {
    code: 206,
    title: "Partial Content",
    category: "2xx",
    summary: "返回部分资源内容。",
    detail: "通常配合 Range 请求头实现断点续传。",
    useCase: "音视频拖拽播放、分段下载。",
    hint: "需正确处理 Content-Range。",
  },
  {
    code: 301,
    title: "Moved Permanently",
    category: "3xx",
    summary: "资源永久迁移到新地址。",
    detail: "搜索引擎会更新索引到新 URL。",
    useCase: "站点域名迁移、路径规范化。",
    hint: "避免链式重定向影响性能。",
  },
  {
    code: 302,
    title: "Found",
    category: "3xx",
    summary: "资源临时位于其他地址。",
    detail: "浏览器可能将 POST 转为 GET。",
    useCase: "临时活动页跳转。",
    hint: "需保留方法时优先考虑 307/308。",
  },
  {
    code: 304,
    title: "Not Modified",
    category: "3xx",
    summary: "资源未变化，可使用缓存副本。",
    detail: "常由 ETag 或 Last-Modified 协商缓存触发。",
    useCase: "静态资源缓存命中。",
    hint: "可显著降低带宽和响应时间。",
  },
  {
    code: 307,
    title: "Temporary Redirect",
    category: "3xx",
    summary: "临时重定向且保持原请求方法。",
    detail: "比 302 语义更明确。",
    useCase: "临时切流到新网关。",
    hint: "对非 GET 请求更安全。",
  },
  {
    code: 308,
    title: "Permanent Redirect",
    category: "3xx",
    summary: "永久重定向且保持原请求方法。",
    detail: "结合了 301 的永久语义与方法保留。",
    useCase: "API 路径永久升级。",
    hint: "客户端与网关需共同支持。",
  },
  {
    code: 400,
    title: "Bad Request",
    category: "4xx",
    summary: "请求参数或格式不合法。",
    detail: "通常是前端参数校验不完整或协议不匹配。",
    useCase: "缺少必填字段、JSON 格式错误。",
    hint: "返回字段级错误信息可提升排查效率。",
  },
  {
    code: 401,
    title: "Unauthorized",
    category: "4xx",
    summary: "缺少认证信息或认证失败。",
    detail: "常见于 token 缺失、过期、签名无效。",
    useCase: "登录态失效后访问受保护资源。",
    hint: "通常配合 WWW-Authenticate 头。",
  },
  {
    code: 403,
    title: "Forbidden",
    category: "4xx",
    summary: "身份已识别，但无权限执行当前操作。",
    detail: "与 401 的区别是身份校验通常已通过。",
    useCase: "普通用户访问管理员接口。",
    hint: "注意权限模型与资源边界的设计。",
  },
  {
    code: 404,
    title: "Not Found",
    category: "4xx",
    summary: "请求资源不存在。",
    detail: "可能是 URL 错误、资源被删除或未发布。",
    useCase: "请求不存在的文章、接口路径拼写错误。",
    hint: "建议记录路径来源，便于定位错误入口。",
  },
  {
    code: 405,
    title: "Method Not Allowed",
    category: "4xx",
    summary: "资源存在但不支持当前请求方法。",
    detail: "常见于路由仅开放 GET 却发送 POST。",
    useCase: "调用方式与接口定义不一致。",
    hint: "可返回 Allow 头提示允许的方法。",
  },
  {
    code: 408,
    title: "Request Timeout",
    category: "4xx",
    summary: "客户端请求超时。",
    detail: "服务端在规定时间内未接收到完整请求。",
    useCase: "弱网环境下上传超时。",
    hint: "可结合重试与分片上传改善体验。",
  },
  {
    code: 409,
    title: "Conflict",
    category: "4xx",
    summary: "请求与当前资源状态冲突。",
    detail: "常见于并发写入、版本冲突。",
    useCase: "乐观锁更新失败、重复创建。",
    hint: "建议返回冲突原因和可恢复策略。",
  },
  {
    code: 410,
    title: "Gone",
    category: "4xx",
    summary: "资源已永久不可用。",
    detail: "语义上比 404 更明确，表示资源已下线。",
    useCase: "历史内容清退、接口废弃。",
    hint: "对爬虫和客户端都更友好。",
  },
  {
    code: 413,
    title: "Payload Too Large",
    category: "4xx",
    summary: "请求体超过服务端限制。",
    detail: "上传文件过大或批量请求过重时常见。",
    useCase: "上传超限、批量导入过大。",
    hint: "返回最大限制可减少重复失败。",
  },
  {
    code: 415,
    title: "Unsupported Media Type",
    category: "4xx",
    summary: "请求内容类型不被支持。",
    detail: "通常是 Content-Type 设置不正确。",
    useCase: "接口要求 application/json 却传 form-data。",
    hint: "明确文档并做服务端兜底校验。",
  },
  {
    code: 422,
    title: "Unprocessable Entity",
    category: "4xx",
    summary: "语法正确但业务语义校验失败。",
    detail: "常用于参数格式正确但不满足业务规则。",
    useCase: "邮箱格式正确但已被占用。",
    hint: "适合返回字段级校验详情。",
  },
  {
    code: 429,
    title: "Too Many Requests",
    category: "4xx",
    summary: "请求频率超过限流策略。",
    detail: "高并发或恶意请求常触发该状态。",
    useCase: "短信发送频率限制、API 防刷。",
    hint: "可返回 Retry-After 指导重试。",
  },
  {
    code: 500,
    title: "Internal Server Error",
    category: "5xx",
    summary: "服务端发生未预期异常。",
    detail: "属于兜底错误，根因可能在业务、依赖或基础设施。",
    useCase: "空指针、数据库异常、配置错误。",
    hint: "需要日志与链路追踪快速定位。",
  },
  {
    code: 501,
    title: "Not Implemented",
    category: "5xx",
    summary: "服务器不支持当前请求功能。",
    detail: "常见于方法或能力未实现。",
    useCase: "接口定义存在但暂未开发。",
    hint: "可在文档中明确能力可用范围。",
  },
  {
    code: 502,
    title: "Bad Gateway",
    category: "5xx",
    summary: "网关收到上游无效响应。",
    detail: "常见于反向代理或微服务网关场景。",
    useCase: "上游进程异常退出、返回格式异常。",
    hint: "优先排查网关到上游的网络与健康状态。",
  },
  {
    code: 503,
    title: "Service Unavailable",
    category: "5xx",
    summary: "服务暂不可用。",
    detail: "可能因维护、过载、依赖故障导致。",
    useCase: "系统发布维护窗口、突发流量打满。",
    hint: "可配合 Retry-After 和降级策略。",
  },
  {
    code: 504,
    title: "Gateway Timeout",
    category: "5xx",
    summary: "网关等待上游响应超时。",
    detail: "多见于链路过长或下游响应慢。",
    useCase: "聚合接口依赖多个慢服务。",
    hint: "应设置合理超时与熔断隔离。",
  },
  {
    code: 505,
    title: "HTTP Version Not Supported",
    category: "5xx",
    summary: "服务器不支持请求所用 HTTP 版本。",
    detail: "客户端和服务端协议能力不兼容。",
    useCase: "老旧客户端与新网关协议冲突。",
    hint: "统一网关协议策略可减少兼容问题。",
  },
];

const getCategoryStyle = (category: StatusCategory) => {
  if (category === "1xx") {
    return "bg-sky-500/10 text-sky-600 dark:text-sky-300";
  }
  if (category === "2xx") {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
  }
  if (category === "3xx") {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-300";
  }
  if (category === "4xx") {
    return "bg-orange-500/10 text-orange-600 dark:text-orange-300";
  }
  return "bg-rose-500/10 text-rose-600 dark:text-rose-300";
};

const highlightText = (text: string, query: string) => {
  const keyword = query.trim();
  if (!keyword) return text;
  const lower = text.toLowerCase();
  const key = keyword.toLowerCase();
  const idx = lower.indexOf(key);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-(--accent-color)/30 px-0.5 text-inherit">
        {text.slice(idx, idx + keyword.length)}
      </mark>
      {text.slice(idx + keyword.length)}
    </>
  );
};

export const HttpStatusToolPage = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | StatusCategory>("all");
  const [activeCode, setActiveCode] = useState<number>(200);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const flashNotice = (message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
    }, 1600);
  };

  const filteredList = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return HTTP_STATUS_LIST.filter((item) => {
      if (category !== "all" && item.category !== category) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const text = [
        item.code,
        item.title,
        item.summary,
        item.detail,
        item.useCase,
        item.hint,
        item.category,
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(normalizedQuery);
    });
  }, [category, query]);

  useEffect(() => {
    if (filteredList.length === 0) return;
    if (!filteredList.some((item) => item.code === activeCode)) {
      setActiveCode(filteredList[0].code);
    }
  }, [activeCode, filteredList]);

  const activeStatus =
    filteredList.find((item) => item.code === activeCode) ?? filteredList[0] ?? null;

  const relatedList = useMemo(() => {
    if (!activeStatus) return [];
    return HTTP_STATUS_LIST.filter(
      (item) => item.category === activeStatus.category && item.code !== activeStatus.code
    ).slice(0, 4);
  }, [activeStatus]);

  const handleCopy = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      flashNotice("已复制");
    } catch {
      flashNotice("复制失败");
    }
  };

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-4 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                HTTP 状态码查询
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                快速检索状态码语义、常见场景与排查建议
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              共 {HTTP_STATUS_LIST.length} 条
            </span>
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              命中 {filteredList.length} 条
            </span>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入状态码、英文名称或关键词，例如 404 / timeout / unauthorized"
            className="h-11 w-full rounded-2xl border border-black/10 bg-white/80 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
          {CATEGORY_OPTIONS.map((option) => {
            const active = category === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setCategory(option.id)}
                className={`rounded-full border px-3 py-1 font-semibold transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                    : "border-black/10 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/30"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="min-h-0 overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>状态码列表</span>
            <span>{filteredList.length} 条</span>
          </div>
          <div className="tool-scrollbar max-h-full space-y-2 overflow-auto p-3">
            {filteredList.length > 0 ? (
              filteredList.map((item) => {
                const active = activeStatus?.code === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setActiveCode(item.code)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                        : "border-black/10 bg-white/70 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{item.code}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          active
                            ? "bg-black/10 text-inherit dark:bg-black/10"
                            : getCategoryStyle(item.category)
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{highlightText(item.title, query)}</p>
                    <p
                      className={`mt-1 line-clamp-2 text-xs ${
                        active ? "text-slate-100 dark:text-slate-300" : "text-slate-500 dark:text-slate-300"
                      }`}
                    >
                      {highlightText(item.summary, query)}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-black/10 bg-white/70 p-4 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                未找到匹配状态码
              </div>
            )}
          </div>
        </div>

        <div className="tool-scrollbar min-h-0 overflow-auto rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          {activeStatus ? (
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {activeStatus.code}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getCategoryStyle(
                        activeStatus.category
                      )}`}
                    >
                      {activeStatus.category}
                    </span>
                  </div>
                  <p className="mt-1 text-base font-semibold text-slate-700 dark:text-slate-200">
                    {activeStatus.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    {activeStatus.summary}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopy(String(activeStatus.code))}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    复制状态码
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(`HTTP/1.1 ${activeStatus.code} ${activeStatus.title}`)
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    复制状态行
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <article className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/10">
                  <h3 className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-300">
                    语义说明
                  </h3>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                    {activeStatus.detail}
                  </p>
                </article>
                <article className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/10">
                  <h3 className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-300">
                    典型场景
                  </h3>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                    {activeStatus.useCase}
                  </p>
                </article>
                <article className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/10">
                  <h3 className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-300">
                    排查建议
                  </h3>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                    {activeStatus.hint}
                  </p>
                </article>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/10">
                <h3 className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-300">
                  同类常见状态
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {relatedList.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setActiveCode(item.code)}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-white/30"
                    >
                      <span>{item.code}</span>
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-sm text-slate-500 dark:text-slate-300">
              请先选择一个状态码
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
