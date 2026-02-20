import { useEffect, useMemo, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Copy, Download, KeyRound, ShieldCheck } from "lucide-react";

type JwtHeader = {
  alg?: string;
  typ?: string;
  [key: string]: unknown;
};

type JwtPayload = {
  exp?: number;
  iat?: number;
  nbf?: number;
  iss?: string;
  aud?: string | string[];
  sub?: string;
  jti?: string;
  [key: string]: unknown;
};

const sampleJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlJlZmluZXgiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTg4ODg4ODg4OH0.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const formatTimestamp = (value?: number) => {
  if (!value) return "-";
  const date = new Date(value * 1000);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().replace("T", " ").replace("Z", " UTC");
};

const isExpired = (exp?: number) => {
  if (!exp) return false;
  return Date.now() / 1000 > exp;
};

export const JwtToolPage = () => {
  const [token, setToken] = useState(sampleJwt);
  const [error, setError] = useState<string | null>(null);
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

  const decoded = useMemo(() => {
    const trimmed = token.trim();
    if (!trimmed) {
      setError(null);
      return null;
    }
    try {
      const header = jwtDecode<JwtHeader>(trimmed, { header: true });
      const payload = jwtDecode<JwtPayload>(trimmed);
      setError(null);
      return { header, payload };
    } catch (err) {
      const message = err instanceof Error ? err.message : "JWT 解析失败";
      setError(message);
      return null;
    }
  }, [token]);

  const outputText = useMemo(() => {
    if (!decoded) return "";
    return JSON.stringify({ header: decoded.header, payload: decoded.payload }, null, 2);
  }, [decoded]);

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      flashNotice("已复制解析结果");
    } catch {
      flashNotice("复制失败");
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    downloadText(outputText, "jwt-decoded.json");
    flashNotice("已下载结果");
  };

  const metaItems = decoded?.payload
    ? [
        {
          label: "Issued At",
          value: formatTimestamp(decoded.payload.iat),
        },
        {
          label: "Not Before",
          value: formatTimestamp(decoded.payload.nbf),
        },
        {
          label: "Expires",
          value: formatTimestamp(decoded.payload.exp),
        },
      ]
    : [];

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              JWT 解析器
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Copy className="h-3.5 w-3.5" />
              复制结果
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Download className="h-3.5 w-3.5" />
              下载结果
            </button>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>JWT</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">Token</span>
          </div>
          <div className="min-h-0 flex-1 p-4">
            <textarea
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="h-full w-full resize-none rounded-xl border border-black/5 bg-white/80 p-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <div className="rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
              <KeyRound className="h-3.5 w-3.5" />
              解析信息
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-200">
              {metaItems.length === 0 ? (
                <p>请输入 JWT 以查看解析结果。</p>
              ) : (
                metaItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-300">{item.label}</span>
                    <span className="font-medium text-slate-800 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))
              )}
              {decoded?.payload?.exp ? (
                <div className="mt-2 rounded-xl border border-black/5 bg-black/5 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/10">
                  {isExpired(decoded.payload.exp)
                    ? "Token 已过期"
                    : "Token 仍在有效期内"}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
              <span>Header / Payload</span>
              <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">JSON</span>
            </div>
            <div className="min-h-0 flex-1 p-4">
              <textarea
                value={outputText}
                readOnly
                className="h-full w-full resize-none rounded-xl border border-black/5 bg-slate-50 p-4 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
