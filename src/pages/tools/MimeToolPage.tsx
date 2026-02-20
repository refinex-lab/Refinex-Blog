import { useMemo, useState } from "react";
import { Copy, FileType2, Search } from "lucide-react";

type MimeCategory =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "application"
  | "font";

type MimeItem = {
  extension: string;
  mime: string;
  category: MimeCategory;
  description: string;
  commonUsage: string;
};

const MIME_DATA: MimeItem[] = [
  {
    extension: "txt",
    mime: "text/plain",
    category: "text",
    description: "纯文本文件",
    commonUsage: "日志、配置、说明文档",
  },
  {
    extension: "html",
    mime: "text/html",
    category: "text",
    description: "HTML 页面",
    commonUsage: "Web 页面内容",
  },
  {
    extension: "css",
    mime: "text/css",
    category: "text",
    description: "样式表",
    commonUsage: "网页样式资源",
  },
  {
    extension: "js",
    mime: "text/javascript",
    category: "text",
    description: "JavaScript 脚本",
    commonUsage: "前端脚本资源",
  },
  {
    extension: "json",
    mime: "application/json",
    category: "application",
    description: "JSON 数据",
    commonUsage: "接口响应与配置文件",
  },
  {
    extension: "xml",
    mime: "application/xml",
    category: "application",
    description: "XML 文档",
    commonUsage: "配置、数据交换",
  },
  {
    extension: "pdf",
    mime: "application/pdf",
    category: "application",
    description: "PDF 文档",
    commonUsage: "文档下载与预览",
  },
  {
    extension: "zip",
    mime: "application/zip",
    category: "application",
    description: "ZIP 压缩包",
    commonUsage: "文件打包分发",
  },
  {
    extension: "gz",
    mime: "application/gzip",
    category: "application",
    description: "GZIP 压缩文件",
    commonUsage: "压缩日志、归档文件",
  },
  {
    extension: "tar",
    mime: "application/x-tar",
    category: "application",
    description: "TAR 归档文件",
    commonUsage: "Linux 打包归档",
  },
  {
    extension: "svg",
    mime: "image/svg+xml",
    category: "image",
    description: "SVG 矢量图",
    commonUsage: "图标、可缩放图形",
  },
  {
    extension: "png",
    mime: "image/png",
    category: "image",
    description: "PNG 图片",
    commonUsage: "透明背景图片",
  },
  {
    extension: "jpg",
    mime: "image/jpeg",
    category: "image",
    description: "JPEG 图片",
    commonUsage: "照片、缩略图",
  },
  {
    extension: "jpeg",
    mime: "image/jpeg",
    category: "image",
    description: "JPEG 图片",
    commonUsage: "照片、缩略图",
  },
  {
    extension: "webp",
    mime: "image/webp",
    category: "image",
    description: "WebP 图片",
    commonUsage: "Web 优化图像",
  },
  {
    extension: "gif",
    mime: "image/gif",
    category: "image",
    description: "GIF 动图",
    commonUsage: "动画图像、表情图",
  },
  {
    extension: "mp3",
    mime: "audio/mpeg",
    category: "audio",
    description: "MP3 音频",
    commonUsage: "音乐播放",
  },
  {
    extension: "wav",
    mime: "audio/wav",
    category: "audio",
    description: "WAV 音频",
    commonUsage: "高质量音频素材",
  },
  {
    extension: "ogg",
    mime: "audio/ogg",
    category: "audio",
    description: "Ogg 音频",
    commonUsage: "开源音频格式",
  },
  {
    extension: "mp4",
    mime: "video/mp4",
    category: "video",
    description: "MP4 视频",
    commonUsage: "网页视频播放",
  },
  {
    extension: "webm",
    mime: "video/webm",
    category: "video",
    description: "WebM 视频",
    commonUsage: "浏览器友好视频格式",
  },
  {
    extension: "mov",
    mime: "video/quicktime",
    category: "video",
    description: "QuickTime 视频",
    commonUsage: "苹果设备视频素材",
  },
  {
    extension: "woff",
    mime: "font/woff",
    category: "font",
    description: "WOFF 字体",
    commonUsage: "Web 字体文件",
  },
  {
    extension: "woff2",
    mime: "font/woff2",
    category: "font",
    description: "WOFF2 字体",
    commonUsage: "高压缩 Web 字体",
  },
  {
    extension: "ttf",
    mime: "font/ttf",
    category: "font",
    description: "TrueType 字体",
    commonUsage: "桌面与网页字体",
  },
  {
    extension: "otf",
    mime: "font/otf",
    category: "font",
    description: "OpenType 字体",
    commonUsage: "字体设计与发布",
  },
];

const categoryLabelMap: Record<MimeCategory, string> = {
  text: "文本",
  image: "图片",
  audio: "音频",
  video: "视频",
  application: "应用",
  font: "字体",
};

const CATEGORY_OPTIONS: Array<{ id: "all" | MimeCategory; label: string }> = [
  { id: "all", label: "全部" },
  { id: "text", label: "文本" },
  { id: "image", label: "图片" },
  { id: "audio", label: "音频" },
  { id: "video", label: "视频" },
  { id: "application", label: "应用" },
  { id: "font", label: "字体" },
];

const normalizeExtension = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  const noQuery = trimmed.split("?")[0].split("#")[0];
  const cleaned = noQuery.replace(/^\./, "");
  if (cleaned.includes(".")) {
    const parts = cleaned.split(".");
    return parts[parts.length - 1] ?? "";
  }
  return cleaned;
};

export const MimeToolPage = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | MimeCategory>(
    "all"
  );
  const [selectedMime, setSelectedMime] = useState<MimeItem>(MIME_DATA[0]);
  const [copied, setCopied] = useState<string | null>(null);

  const normalizedExtension = useMemo(() => normalizeExtension(query), [query]);

  const list = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return MIME_DATA.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      if (!normalized) return true;
      const haystack = [
        item.extension,
        item.mime,
        item.description,
        item.commonUsage,
      ]
        .join(" ")
        .toLowerCase();
      return (
        haystack.includes(normalized) ||
        item.extension === normalizedExtension ||
        item.mime.includes(normalized)
      );
    });
  }, [activeCategory, normalizedExtension, query]);

  const guess = useMemo(
    () => MIME_DATA.find((item) => item.extension === normalizedExtension) ?? null,
    [normalizedExtension]
  );

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
            <FileType2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              MIME 类型查询
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              输入扩展名、文件名或 MIME 字符串，快速获取对应关系。
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例如：png、index.html、application/json"
              className="h-11 w-full rounded-xl border border-black/10 bg-white/85 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
            />
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

      {query.trim() ? (
        <section className="rounded-2xl border border-black/5 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-sm text-slate-600 dark:text-slate-200">
            解析输入：
            <span className="ml-1 font-mono text-slate-900 dark:text-white">
              {query.trim()}
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            识别扩展名：
            <span className="ml-1 font-mono text-slate-800 dark:text-slate-100">
              {normalizedExtension || "-"}
            </span>
            {guess ? (
              <span className="ml-2">
                → 推荐 MIME：
                <span className="ml-1 font-mono text-slate-900 dark:text-white">
                  {guess.mime}
                </span>
              </span>
            ) : null}
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-black/5 bg-white/85 p-3 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              匹配结果
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-300">
              {list.length} 条
            </span>
          </div>
          <div className="tool-scrollbar max-h-[60vh] space-y-2 overflow-auto pr-1">
            {list.map((item) => {
              const active =
                item.extension === selectedMime.extension && item.mime === selectedMime.mime;
              return (
                <button
                  key={`${item.extension}-${item.mime}`}
                  type="button"
                  onClick={() => setSelectedMime(item)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                      : "border-black/10 bg-white/90 hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm">.{item.extension}</span>
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      {categoryLabelMap[item.category]}
                    </span>
                  </div>
                  <p
                    className={`mt-1 truncate text-xs ${
                      active
                        ? "text-white/80 dark:text-slate-300"
                        : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    {item.mime}
                  </p>
                </button>
              );
            })}
            {!list.length ? (
              <div className="rounded-xl border border-dashed border-black/10 p-5 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
                暂无匹配，请尝试其他关键词或扩展名。
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            .{selectedMime.extension}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {selectedMime.description}
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  MIME
                </h3>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedMime.mime, "mime")}
                  className="inline-flex items-center gap-1 rounded-md border border-black/10 px-2 py-1 text-xs text-slate-600 transition hover:border-slate-300 dark:border-white/10 dark:text-slate-200"
                >
                  <Copy className="h-3.5 w-3.5" />
                  复制
                </button>
              </div>
              <p className="mt-2 rounded-lg bg-black/5 px-3 py-2 font-mono text-sm text-slate-800 dark:bg-white/10 dark:text-slate-100">
                {selectedMime.mime}
              </p>
            </div>

            <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  扩展名
                </h3>
                <button
                  type="button"
                  onClick={() => handleCopy(`.${selectedMime.extension}`, "ext")}
                  className="inline-flex items-center gap-1 rounded-md border border-black/10 px-2 py-1 text-xs text-slate-600 transition hover:border-slate-300 dark:border-white/10 dark:text-slate-200"
                >
                  <Copy className="h-3.5 w-3.5" />
                  复制
                </button>
              </div>
              <p className="mt-2 rounded-lg bg-black/5 px-3 py-2 font-mono text-sm text-slate-800 dark:bg-white/10 dark:text-slate-100">
                .{selectedMime.extension}
              </p>
            </div>

            <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                常见用途
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">
                {selectedMime.commonUsage}
              </p>
            </div>
          </div>

          {copied ? (
            <div className="mt-4 inline-flex rounded-full border border-emerald-300/50 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {copied === "mime" ? "已复制 MIME" : "已复制扩展名"}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};
