import { useEffect, useMemo, useRef, useState } from "react";
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";
import { CalendarClock, Copy, Download, Sparkles } from "lucide-react";

const PRESETS = [
  { id: "every-minute", label: "每分钟", value: "* * * * *" },
  { id: "every-5", label: "每 5 分钟", value: "*/5 * * * *" },
  { id: "hourly", label: "每小时", value: "0 * * * *" },
  { id: "daily-9", label: "每天 09:00", value: "0 9 * * *" },
  { id: "weekday-9", label: "工作日 09:00", value: "0 9 * * 1-5" },
  { id: "monthly-1", label: "每月 1 日 09:00", value: "0 9 1 * *" },
] as const;

type BuilderState = {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
};

const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const CronToolPage = () => {
  const [expression, setExpression] = useState("*/5 * * * *");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"
  );
  const [use24h, setUse24h] = useState(true);
  const [builder, setBuilder] = useState<BuilderState>({
    minute: "*/5",
    hour: "*",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "*",
  });
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

  const fieldCount = useMemo(
    () => expression.trim().split(/\s+/).filter(Boolean).length,
    [expression]
  );

  const description = useMemo(() => {
    try {
      return cronstrue.toString(expression, {
        use24HourTimeFormat: use24h,
        verbose: true,
      });
    } catch {
      return "";
    }
  }, [expression, use24h]);

  const preview = useMemo(() => {
    try {
      const options: Record<string, string | Date> = {
        currentDate: new Date(),
      };
      if (timezone.trim()) {
        options.tz = timezone.trim();
      }
      const interval = CronExpressionParser.parse(expression, options);
      const nextDates = interval.take(10).map((date: { toDate: () => Date }) => date.toDate());
      return { nextDates, error: null as string | null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cron 解析失败";
      return { nextDates: [] as Date[], error: message };
    }
  }, [expression, timezone]);

  const generatedExpression = useMemo(() => {
    return `${builder.minute} ${builder.hour} ${builder.dayOfMonth} ${builder.month} ${builder.dayOfWeek}`;
  }, [builder]);

  const applyBuilder = () => {
    setExpression(generatedExpression);
    flashNotice("已生成 Cron 表达式");
  };

  const handleCopyExpression = async () => {
    if (!expression.trim()) return;
    try {
      await navigator.clipboard.writeText(expression.trim());
      flashNotice("已复制 Cron 表达式");
    } catch {
      flashNotice("复制失败");
    }
  };

  const handleCopyPreview = async () => {
    if (preview.nextDates.length === 0) return;
    try {
      const payload = preview.nextDates
        .map((date: Date) => date.toLocaleString())
        .join("\n");
      await navigator.clipboard.writeText(payload);
      flashNotice("已复制执行时间");
    } catch {
      flashNotice("复制失败");
    }
  };

  const handleDownloadPreview = () => {
    if (preview.nextDates.length === 0) return;
    const payload = preview.nextDates
      .map((date: Date) => date.toLocaleString())
      .join("\n");
    downloadText(payload, "cron-preview.txt");
    flashNotice("已下载预览");
  };

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              Cron 表达式解析器
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleCopyExpression}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Copy className="h-3.5 w-3.5" />
              复制表达式
            </button>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">
              Cron 表达式
            </label>
            <input
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              className="h-11 w-full rounded-2xl border border-black/10 bg-white/80 px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
                {fieldCount === 6 ? "包含秒" : "标准 5 段"}
              </span>
              <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
                <input
                  type="checkbox"
                  checked={use24h}
                  onChange={(event) => setUse24h(event.target.checked)}
                  className="h-3.5 w-3.5"
                />
                24 小时制描述
              </label>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
                时区
                <input
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  className="h-6 w-40 rounded-md border border-transparent bg-transparent px-2 text-xs text-slate-600 outline-none focus:border-slate-300 dark:text-slate-200 dark:focus:border-white/30"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">
              人类可读描述
            </label>
            <div className="rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              {description || "请输入合法的 Cron 表达式"}
            </div>
            {preview.error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
                {preview.error}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">
            常用模板
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setExpression(item.value)}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">
            生成 Cron
          </label>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-200">
            {(
              [
                { key: "minute", label: "分钟" },
                { key: "hour", label: "小时" },
                { key: "dayOfMonth", label: "日" },
                { key: "month", label: "月" },
                { key: "dayOfWeek", label: "周" },
              ] as const
            ).map((item) => (
              <div
                key={item.key}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10"
              >
                {item.label}
                <input
                  value={builder[item.key]}
                  onChange={(event) =>
                    setBuilder((prev) => ({
                      ...prev,
                      [item.key]: event.target.value,
                    }))
                  }
                  className="h-6 w-16 rounded-md border border-transparent bg-transparent px-1 text-xs text-slate-600 outline-none focus:border-slate-300 dark:text-slate-200 dark:focus:border-white/30"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={applyBuilder}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Sparkles className="h-3.5 w-3.5" />
              应用生成
            </button>
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              {generatedExpression}
            </span>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
          <span>未来执行时间（10 次）</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPreview}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Copy className="h-3.5 w-3.5" />
              复制
            </button>
            <button
              type="button"
              onClick={handleDownloadPreview}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Download className="h-3.5 w-3.5" />
              下载
            </button>
          </div>
        </div>
        <div className="tool-scrollbar min-h-0 flex-1 overflow-auto p-4">
          {preview.nextDates.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-300">
              暂无可用的执行时间
            </div>
          ) : (
            <ol className="grid gap-2 text-sm text-slate-700 dark:text-slate-200">
              {preview.nextDates.map((date, index) => (
                <li
                  key={`${date.toISOString()}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-black/5 bg-white/70 px-3 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-white/5"
                >
                  <span>#{index + 1}</span>
                  <span className="font-medium">{date.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
};
