import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { CalendarClock, Copy, RefreshCw } from "lucide-react";

const formatDateTimeLocal = (date: Date) =>
  dayjs(date).format("YYYY-MM-DDTHH:mm:ss");

export const TimestampToolPage = () => {
  const [unit, setUnit] = useState<"ms" | "s">("ms");
  const [timestampInput, setTimestampInput] = useState("");
  const [dateInput, setDateInput] = useState(() => formatDateTimeLocal(new Date()));
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

  const timestampNumber = useMemo(() => {
    if (!timestampInput.trim()) return null;
    const value = Number(timestampInput.trim());
    return Number.isFinite(value) ? value : null;
  }, [timestampInput]);

  const timestampDate = useMemo(() => {
    if (timestampNumber === null) return null;
    const ms = unit === "s" ? timestampNumber * 1000 : timestampNumber;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }, [timestampNumber, unit]);

  const parsedDate = useMemo(() => {
    if (!dateInput.trim()) return null;
    const date = dayjs(dateInput);
    if (!date.isValid()) return null;
    return date.toDate();
  }, [dateInput]);

  const timestampFromDate = useMemo(() => {
    if (!parsedDate) return null;
    const ms = parsedDate.getTime();
    return {
      ms,
      s: Math.floor(ms / 1000),
    };
  }, [parsedDate]);

  const handleCopy = async (payload: string) => {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      flashNotice("已复制");
    } catch {
      flashNotice("复制失败");
    }
  };

  const applyNow = () => {
    const now = Date.now();
    setTimestampInput(unit === "s" ? String(Math.floor(now / 1000)) : String(now));
    setDateInput(formatDateTimeLocal(new Date(now)));
  };

  useEffect(() => {
    if (!timestampInput.trim()) return;
    const now = Date.now();
    if (timestampNumber === null) return;
    const ms = unit === "s" ? timestampNumber * 1000 : timestampNumber;
    if (!Number.isFinite(ms)) return;
    if (Math.abs(ms - now) < 1000) {
      setDateInput(formatDateTimeLocal(new Date(ms)));
    }
  }, [timestampNumber, unit]);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              时间戳转换
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 dark:border-white/10 dark:bg-white/10">
              <button
                type="button"
                onClick={() => setUnit("ms")}
                className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition ${
                  unit === "ms"
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-600 hover:bg-white dark:text-slate-200 dark:hover:bg-white/10"
                }`}
              >
                毫秒
              </button>
              <button
                type="button"
                onClick={() => setUnit("s")}
                className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition ${
                  unit === "s"
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-600 hover:bg-white dark:text-slate-200 dark:hover:bg-white/10"
                }`}
              >
                秒
              </button>
            </div>
            <button
              type="button"
              onClick={applyNow}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              当前时间
            </button>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>时间戳 → 日期</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">{unit}</span>
          </div>
          <div className="min-h-0 flex-1 space-y-3 p-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                时间戳
              </label>
              <input
                value={timestampInput}
                onChange={(event) => setTimestampInput(event.target.value)}
                placeholder={unit === "s" ? "1700000000" : "1700000000000"}
                className="mt-2 h-11 w-full rounded-2xl border border-black/10 bg-white/80 px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
              />
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              {timestampDate ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>本地时间</span>
                    <span className="font-semibold">
                      {dayjs(timestampDate).format("YYYY-MM-DD HH:mm:ss")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ISO</span>
                    <span className="font-semibold">{timestampDate.toISOString()}</span>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400">请输入合法时间戳</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    timestampDate ? timestampDate.toISOString() : ""
                  )
                }
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                <Copy className="h-3.5 w-3.5" />
                复制 ISO
              </button>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>日期 → 时间戳</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">Local</span>
          </div>
          <div className="min-h-0 flex-1 space-y-3 p-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                日期时间
              </label>
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(event) => setDateInput(event.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-black/10 bg-white/80 px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
              />
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              {timestampFromDate ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>毫秒</span>
                    <span className="font-semibold">{timestampFromDate.ms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>秒</span>
                    <span className="font-semibold">{timestampFromDate.s}</span>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400">请选择日期时间</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleCopy(timestampFromDate ? String(timestampFromDate.ms) : "")
                }
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                <Copy className="h-3.5 w-3.5" />
                复制毫秒
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCopy(timestampFromDate ? String(timestampFromDate.s) : "")
                }
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                <Copy className="h-3.5 w-3.5" />
                复制秒
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
