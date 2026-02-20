import { useEffect, useRef, useState } from "react";
import { Copy, Download, Link2, RotateCcw, Wand2 } from "lucide-react";

const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const UrlEncodeToolPage = () => {
  const [input, setInput] = useState("https://example.com?q=hello world&lang=zh-CN");
  const [output, setOutput] = useState("");
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

  const handleEncode = () => {
    try {
      setOutput(encodeURIComponent(input));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "编码失败";
      setError(message);
      setOutput("");
    }
  };

  const handleDecode = () => {
    try {
      setOutput(decodeURIComponent(input));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "解码失败";
      setError(message);
      setOutput("");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      flashNotice("已复制输出");
    } catch {
      flashNotice("复制失败");
    }
  };

  const handleDownload = () => {
    if (!output) return;
    downloadText(output, "url-encode.txt");
    flashNotice("已下载输出");
  };

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setOutput("");
    setError(null);
  };

  useEffect(() => {
    handleEncode();
  }, []);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <Link2 className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              URL 编码解码
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleEncode}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Wand2 className="h-3.5 w-3.5" />
              编码
            </button>
            <button
              type="button"
              onClick={handleDecode}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Wand2 className="h-3.5 w-3.5" />
              解码
            </button>
            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              交换
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Copy className="h-3.5 w-3.5" />
              复制输出
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Download className="h-3.5 w-3.5" />
              下载输出
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

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>输入</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">Raw</span>
          </div>
          <div className="min-h-0 flex-1 p-4">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="h-full w-full resize-none rounded-xl border border-black/5 bg-white/80 p-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>输出</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">Result</span>
          </div>
          <div className="min-h-0 flex-1 p-4">
            <textarea
              value={output}
              readOnly
              className="h-full w-full resize-none rounded-xl border border-black/5 bg-slate-50 p-4 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
