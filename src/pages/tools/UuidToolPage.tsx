import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Hash, Plus, Trash2 } from "lucide-react";
import { v7 as uuidv7 } from "uuid";

const MODES = [
  { id: "v4", label: "UUID v4" },
  { id: "v7", label: "UUID v7" },
] as const;

type ModeId = (typeof MODES)[number]["id"];

const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const UuidToolPage = () => {
  const [mode, setMode] = useState<ModeId>("v4");
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState("");
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

  const safeCount = useMemo(() => {
    if (!Number.isFinite(count)) return 1;
    return Math.min(Math.max(Math.floor(count), 1), 200);
  }, [count]);

  const generate = () => {
    const list = Array.from({ length: safeCount }, () => {
      return mode === "v7" ? uuidv7() : crypto.randomUUID();
    });
    setOutput(list.join("\n"));
  };

  useEffect(() => {
    generate();
  }, [mode]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      flashNotice("已复制 UUID");
    } catch {
      flashNotice("复制失败");
    }
  };

  const handleDownload = () => {
    if (!output) return;
    downloadText(output, `uuid-${mode}.txt`);
    flashNotice("已下载输出");
  };

  const handleClear = () => {
    setOutput("");
  };

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <Hash className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              UUID 生成器
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex flex-wrap gap-1 rounded-xl border border-black/10 bg-white/70 p-1 text-xs dark:border-white/10 dark:bg-zinc-950/40">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                    mode === item.id
                      ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                      : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              数量
              <input
                type="number"
                min={1}
                max={200}
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
                className="h-7 w-16 rounded-md border border-transparent bg-transparent px-2 text-xs text-slate-700 outline-none focus:border-slate-300 dark:text-slate-200 dark:focus:border-white/30"
              />
            </div>

            <button
              type="button"
              onClick={generate}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Plus className="h-3.5 w-3.5" />
              生成
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Copy className="h-3.5 w-3.5" />
              复制
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Download className="h-3.5 w-3.5" />
              下载
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              清空
            </button>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
        <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
          <span>输出</span>
          <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">List</span>
        </div>
        <div className="min-h-0 flex-1 p-4">
          <textarea
            value={output}
            readOnly
            className="h-full w-full resize-none rounded-xl border border-black/5 bg-slate-50 p-4 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
          />
        </div>
      </section>
    </div>
  );
};
