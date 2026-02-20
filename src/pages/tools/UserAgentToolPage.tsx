import { useEffect, useMemo, useRef, useState } from "react";
import Bowser from "bowser";
import { Copy, MonitorSmartphone, RefreshCw, Search } from "lucide-react";

type ParseResult = {
  browser: { name?: string; version?: string };
  os: { name?: string; version?: string; versionName?: string };
  platform: { type?: string; vendor?: string; model?: string };
  engine: { name?: string; version?: string };
};

const defaultResult: ParseResult = {
  browser: {},
  os: {},
  platform: {},
  engine: {},
};

const parseUA = (ua: string): ParseResult => {
  if (!ua.trim()) return defaultResult;
  const result = Bowser.parse(ua);
  return {
    browser: {
      name: result.browser.name,
      version: result.browser.version,
    },
    os: {
      name: result.os.name,
      version: result.os.version,
      versionName: result.os.versionName,
    },
    platform: {
      type: result.platform.type,
      vendor: result.platform.vendor,
      model: result.platform.model,
    },
    engine: {
      name: result.engine.name,
      version: result.engine.version,
    },
  };
};

const toDisplay = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
};

const getDefaultUa = () => {
  if (typeof navigator === "undefined") return "";
  return navigator.userAgent ?? "";
};

export const UserAgentToolPage = () => {
  const [uaInput, setUaInput] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [rawClientHints, setRawClientHints] = useState<Record<string, unknown> | null>(
    null
  );
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        globalThis.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const ua = getDefaultUa();
    setUaInput(ua);

    const nav = navigator as Navigator & {
      userAgentData?: {
        brands?: Array<{ brand: string; version: string }>;
        mobile?: boolean;
        platform?: string;
      };
    };

    if (nav.userAgentData) {
      setRawClientHints({
        brands: nav.userAgentData.brands,
        mobile: nav.userAgentData.mobile,
        platform: nav.userAgentData.platform,
      });
    }
  }, []);

  const flashNotice = (message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) {
      globalThis.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = globalThis.setTimeout(() => {
      setNotice(null);
    }, 1600);
  };

  const parsed = useMemo(() => parseUA(uaInput), [uaInput]);

  const summary = useMemo(() => {
    const browserName = toDisplay(parsed.browser.name);
    const browserVersion = toDisplay(parsed.browser.version);
    const osName = toDisplay(parsed.os.name);
    const osVersion = toDisplay(parsed.os.version);
    const type = toDisplay(parsed.platform.type);
    return `${browserName} ${browserVersion} · ${osName} ${osVersion} · ${type}`;
  }, [parsed]);

  const normalizedUa = uaInput.toLowerCase();
  const maybeBot =
    normalizedUa.includes("bot") ||
    normalizedUa.includes("spider") ||
    normalizedUa.includes("crawler") ||
    normalizedUa.includes("headless");

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
      <section className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <MonitorSmartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                User-Agent 解析
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                开源免费方案：Bowser 本地解析（免 key、免第三方请求）
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              默认已解析当前浏览器
            </span>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
          <textarea
            value={uaInput}
            onChange={(event) => setUaInput(event.target.value)}
            placeholder="粘贴 User-Agent 字符串进行解析"
            className="h-28 w-full resize-y rounded-2xl border border-black/10 bg-white/80 py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setUaInput(getDefaultUa())}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            还原当前设备 UA
          </button>
          <button
            type="button"
            onClick={() => handleCopy(uaInput)}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
          >
            <Copy className="h-3.5 w-3.5" />
            复制 UA
          </button>
          <button
            type="button"
            onClick={() => handleCopy(JSON.stringify(parsed, null, 2))}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
          >
            <Copy className="h-3.5 w-3.5" />
            复制解析结果
          </button>
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="tool-scrollbar min-h-0 overflow-auto rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">解析概览</h2>
          <p className="mt-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
            {summary}
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <article className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/10">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-300">浏览器</h3>
              <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                <p>名称：{toDisplay(parsed.browser.name)}</p>
                <p>版本：{toDisplay(parsed.browser.version)}</p>
                <p>内核：{toDisplay(parsed.engine.name)}</p>
                <p>内核版本：{toDisplay(parsed.engine.version)}</p>
              </div>
            </article>

            <article className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/10">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-300">系统与设备</h3>
              <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                <p>系统：{toDisplay(parsed.os.name)}</p>
                <p>系统版本：{toDisplay(parsed.os.version)}</p>
                <p>设备类型：{toDisplay(parsed.platform.type)}</p>
                <p>设备厂商：{toDisplay(parsed.platform.vendor)}</p>
                <p>设备型号：{toDisplay(parsed.platform.model)}</p>
              </div>
            </article>
          </div>

          <details className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/10">
            <summary className="cursor-pointer select-none font-semibold text-slate-700 dark:text-slate-200">
              查看原始解析 JSON
            </summary>
            <pre className="tool-scrollbar mt-3 max-h-80 overflow-auto rounded-xl bg-black/5 p-3 text-xs text-slate-700 dark:bg-black/30 dark:text-slate-200">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </details>

          {rawClientHints ? (
            <details className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/10">
              <summary className="cursor-pointer select-none font-semibold text-slate-700 dark:text-slate-200">
                查看 Client Hints（navigator.userAgentData）
              </summary>
              <pre className="tool-scrollbar mt-3 max-h-80 overflow-auto rounded-xl bg-black/5 p-3 text-xs text-slate-700 dark:bg-black/30 dark:text-slate-200">
                {JSON.stringify(rawClientHints, null, 2)}
              </pre>
            </details>
          ) : null}
        </div>

        <aside className="tool-scrollbar min-h-0 space-y-4 overflow-auto rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="rounded-2xl border border-black/10 bg-white/70 p-3 text-xs dark:border-white/10 dark:bg-white/10">
            <p className="font-semibold text-slate-700 dark:text-slate-200">UA 风险提示</p>
            <div className="mt-2 space-y-2 text-slate-500 dark:text-slate-300">
              <p>- UA 可伪造，服务端鉴权不要仅依赖 UA。</p>
              <p>- 现代浏览器可能逐步减少 UA 暴露字段。</p>
              <p>- 建议结合 Client Hints 和服务端日志交叉判断。</p>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/70 p-3 text-xs dark:border-white/10 dark:bg-white/10">
            <p className="font-semibold text-slate-700 dark:text-slate-200">当前判断</p>
            <div className="mt-2 space-y-1 text-slate-500 dark:text-slate-300">
              <p>
                Bot 特征：{" "}
                <span className={maybeBot ? "text-rose-500" : "text-emerald-500"}>
                  {maybeBot ? "疑似自动化请求" : "未发现明显 Bot 标记"}
                </span>
              </p>
              <p>平台类型：{toDisplay(parsed.platform.type)}</p>
              <p>浏览器：{toDisplay(parsed.browser.name)}</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};
