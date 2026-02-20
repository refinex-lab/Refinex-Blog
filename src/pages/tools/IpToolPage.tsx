import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Loader2, Network, Search } from "lucide-react";

type ProviderId = "auto" | "ipapi" | "ipsb" | "freeipapi";

type IpLookupResult = {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  asn?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  network?: string;
  source: Exclude<ProviderId, "auto">;
  raw: unknown;
};

const PROVIDER_LABEL: Record<Exclude<ProviderId, "auto">, string> = {
  ipapi: "ipapi.co",
  ipsb: "api.ip.sb",
  freeipapi: "freeipapi.com",
};

const providerChain: Array<Exclude<ProviderId, "auto">> = [
  "ipapi",
  "ipsb",
  "freeipapi",
];

const isValidIpv4 = (value: string) => {
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    if (part.length > 1 && part.startsWith("0")) return false;
    const num = Number(part);
    return Number.isInteger(num) && num >= 0 && num <= 255;
  });
};

const isValidIp = (value: string) => {
  const ip = value.trim();
  if (!ip) return true;
  if (isValidIpv4(ip)) return true;
  if (ip.includes(":")) {
    return /^[0-9a-fA-F:.]+$/.test(ip);
  }
  return false;
};

const withTimeout = async (input: RequestInfo | URL, init?: RequestInit) => {
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return response;
  } finally {
    globalThis.clearTimeout(timer);
  }
};

const buildUrl = (provider: Exclude<ProviderId, "auto">, ip: string) => {
  if (provider === "ipapi") {
    return ip ? `https://ipapi.co/${encodeURIComponent(ip)}/json/` : "https://ipapi.co/json/";
  }
  if (provider === "ipsb") {
    return ip ? `https://api.ip.sb/geoip/${encodeURIComponent(ip)}` : "https://api.ip.sb/geoip";
  }
  return ip
    ? `https://freeipapi.com/api/json/${encodeURIComponent(ip)}`
    : "https://freeipapi.com/api/json";
};

const parseIpApi = (payload: any): IpLookupResult | null => {
  if (!payload || typeof payload !== "object") return null;
  const ip = String(payload.ip ?? "").trim();
  if (!ip) return null;
  return {
    ip,
    country: payload.country_name,
    region: payload.region,
    city: payload.city,
    isp: payload.org,
    asn: payload.asn,
    timezone: payload.timezone,
    latitude:
      typeof payload.latitude === "number" ? payload.latitude : Number(payload.latitude),
    longitude:
      typeof payload.longitude === "number" ? payload.longitude : Number(payload.longitude),
    network: payload.network,
    source: "ipapi",
    raw: payload,
  };
};

const parseIpSb = (payload: any): IpLookupResult | null => {
  if (!payload || typeof payload !== "object") return null;
  const ip = String(payload.ip ?? "").trim();
  if (!ip) return null;
  return {
    ip,
    country: payload.country,
    region: payload.region,
    city: payload.city,
    isp: payload.organization ?? payload.isp,
    asn: payload.asn ? String(payload.asn) : undefined,
    timezone: payload.timezone,
    latitude: typeof payload.latitude === "number" ? payload.latitude : Number(payload.latitude),
    longitude:
      typeof payload.longitude === "number" ? payload.longitude : Number(payload.longitude),
    network: payload.network,
    source: "ipsb",
    raw: payload,
  };
};

const parseFreeIpApi = (payload: any): IpLookupResult | null => {
  if (!payload || typeof payload !== "object") return null;
  const ip = String(payload.ipAddress ?? "").trim();
  if (!ip) return null;
  return {
    ip,
    country: payload.countryName,
    region: payload.regionName,
    city: payload.cityName,
    timezone: payload.timeZone,
    latitude: typeof payload.latitude === "number" ? payload.latitude : Number(payload.latitude),
    longitude: typeof payload.longitude === "number" ? payload.longitude : Number(payload.longitude),
    source: "freeipapi",
    raw: payload,
  };
};

const providerParsers: Record<Exclude<ProviderId, "auto">, (payload: any) => IpLookupResult | null> = {
  ipapi: parseIpApi,
  ipsb: parseIpSb,
  freeipapi: parseFreeIpApi,
};

const parseByProvider = (
  provider: Exclude<ProviderId, "auto">,
  payload: any
): IpLookupResult | null => {
  return providerParsers[provider](payload);
};

const toDisplay = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "number" && Number.isNaN(value)) return "-";
  return String(value);
};

export const IpToolPage = () => {
  const [ipInput, setIpInput] = useState("");
  const [provider, setProvider] = useState<ProviderId>("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<IpLookupResult | null>(null);
  const [recentIps, setRecentIps] = useState<string[]>([]);
  const noticeTimerRef = useRef<number | null>(null);
  const hasAutoQueriedRef = useRef(false);

  const canSubmit = useMemo(() => isValidIp(ipInput), [ipInput]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        globalThis.clearTimeout(noticeTimerRef.current);
      }
    };
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

  const updateRecent = (ip: string) => {
    if (!ip) return;
    setRecentIps((prev) => [ip, ...prev.filter((item) => item !== ip)].slice(0, 8));
  };

  const queryIp = async (targetIp: string) => {
    const ip = targetIp.trim();
    if (!isValidIp(ip)) {
      setError("请输入合法 IPv4 或 IPv6 地址");
      return;
    }

    setLoading(true);
    setError(null);

    const selectedProviders =
      provider === "auto" ? providerChain : [provider as Exclude<ProviderId, "auto">];

    try {
      let matched: IpLookupResult | null = null;
      let failCount = 0;

      for (const currentProvider of selectedProviders) {
        try {
          const response = await withTimeout(buildUrl(currentProvider, ip));
          if (!response.ok) {
            failCount += 1;
            continue;
          }
          const data = await response.json();
          const parsed = parseByProvider(currentProvider, data);
          if (!parsed) {
            failCount += 1;
            continue;
          }
          matched = parsed;
          break;
        } catch {
          failCount += 1;
        }
      }

      if (!matched) {
        setResult(null);
        setError(
          failCount === selectedProviders.length
            ? "查询失败：当前数据源不可用或被限流，请稍后重试"
            : "查询失败：未解析到有效结果"
        );
        return;
      }

      setResult(matched);
      updateRecent(matched.ip);
      if (provider === "auto") {
        flashNotice(`已使用 ${PROVIDER_LABEL[matched.source]} 返回结果`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      flashNotice("已复制");
    } catch {
      flashNotice("复制失败");
    }
  };

  useEffect(() => {
    if (hasAutoQueriedRef.current) return;
    hasAutoQueriedRef.current = true;
    queryIp("");
  }, []);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                IP 信息查询
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                支持本机公网 IP 查询与指定 IPv4/IPv6 归属地、网络信息查询
              </p>
            </div>
          </div>
          {notice ? (
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              {notice}
            </span>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={ipInput}
              onChange={(event) => setIpInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canSubmit && !loading) {
                  queryIp(ipInput);
                }
              }}
              placeholder="留空查询当前公网 IP，或输入 8.8.8.8 / 2408:xxxx"
              className="h-11 w-full rounded-2xl border border-black/10 bg-white/80 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
            />
          </div>

          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value as ProviderId)}
            className="h-11 rounded-2xl border border-black/10 bg-white/80 px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
          >
            <option value="auto">自动选择数据源</option>
            <option value="ipapi">ipapi.co</option>
            <option value="ipsb">api.ip.sb</option>
            <option value="freeipapi">freeipapi.com</option>
          </select>

          <button
            type="button"
            disabled={loading || !canSubmit}
            onClick={() => queryIp(ipInput)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            查询 IP
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => queryIp("")}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white/80 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
          >
            我的 IP
          </button>
        </div>

        {canSubmit ? null : (
          <p className="text-xs text-rose-500">IP 格式不正确，请输入合法 IPv4 或 IPv6</p>
        )}
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="tool-scrollbar min-h-0 overflow-auto rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-900/20 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          {result ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{result.ip}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    数据源：{PROVIDER_LABEL[result.source]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(result.ip)}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
                >
                  <Copy className="h-3.5 w-3.5" />
                  复制 IP
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <article className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/10">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-300">地理位置</h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                    <p>国家：{toDisplay(result.country)}</p>
                    <p>省/州：{toDisplay(result.region)}</p>
                    <p>城市：{toDisplay(result.city)}</p>
                    <p>时区：{toDisplay(result.timezone)}</p>
                  </div>
                </article>

                <article className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/10">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-300">网络信息</h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                    <p>ISP：{toDisplay(result.isp)}</p>
                    <p>ASN：{toDisplay(result.asn)}</p>
                    <p>网段：{toDisplay(result.network)}</p>
                    <p>
                      坐标：{toDisplay(result.latitude)} / {toDisplay(result.longitude)}
                    </p>
                  </div>
                </article>
              </div>

              <details className="rounded-2xl border border-black/10 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/10">
                <summary className="cursor-pointer select-none font-semibold text-slate-700 dark:text-slate-200">
                  查看原始响应 JSON
                </summary>
                <pre className="tool-scrollbar mt-3 max-h-80 overflow-auto rounded-xl bg-black/5 p-3 text-xs text-slate-700 dark:bg-black/30 dark:text-slate-200">
                  {JSON.stringify(result.raw, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/70 p-8 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              输入 IP 后点击“查询 IP”，或直接点击“我的 IP”开始查询
            </div>
          )}
        </div>

        <aside className="tool-scrollbar min-h-0 space-y-4 overflow-auto rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">最近查询</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {recentIps.length > 0 ? (
                recentIps.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setIpInput(item);
                      queryIp(item);
                    }}
                    className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
                  >
                    {item}
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-300">暂无查询记录</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/70 p-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
            <p className="font-semibold text-slate-700 dark:text-slate-200">数据源说明</p>
            <ul className="mt-2 space-y-1">
              <li>- 默认“自动选择”会按可用性依次尝试多个免费接口</li>
              <li>- 查询结果仅供定位与排查参考，可能受 CDN/代理影响</li>
              <li>- 接口来自开源整理：ihmily/ip-info-api</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
};
