import { useEffect, useRef, useState } from "react";
import SparkMD5 from "spark-md5";
import { Copy, Download, Fingerprint } from "lucide-react";

const ALGORITHMS = [
  { id: "MD5", label: "MD5" },
  { id: "SHA-1", label: "SHA-1" },
  { id: "SHA-256", label: "SHA-256" },
  { id: "SHA-512", label: "SHA-512" },
] as const;

type AlgorithmId = (typeof ALGORITHMS)[number]["id"];

const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const bufferToHex = (buffer: ArrayBuffer) => {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const HashToolPage = () => {
  const [algorithm, setAlgorithm] = useState<AlgorithmId>("SHA-256");
  const [input, setInput] = useState("Hello Refinex");
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

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
    }
  }, [input]);

  useEffect(() => {
    const compute = async () => {
      if (!input.trim()) {
        setOutput("");
        setError(null);
        return;
      }
      try {
        if (algorithm === "MD5") {
          const md5 = SparkMD5.hash(input);
          setOutput(md5);
          setError(null);
          return;
        }
        const data = new TextEncoder().encode(input);
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        setOutput(bufferToHex(hashBuffer));
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "哈希计算失败";
        setError(message);
        setOutput("");
      }
    };

    void compute();
  }, [algorithm, input]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      flashNotice("已复制哈希");
    } catch {
      flashNotice("复制失败");
    }
  };

  const handleDownload = () => {
    if (!output) return;
    downloadText(output, `hash-${algorithm.toLowerCase()}.txt`);
    flashNotice("已下载输出");
  };

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              哈希生成器
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex flex-wrap gap-1 rounded-xl border border-black/10 bg-white/70 p-1 text-xs dark:border-white/10 dark:bg-zinc-950/40">
              {ALGORITHMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAlgorithm(item.id)}
                  className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                    algorithm === item.id
                      ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                      : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

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
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">Text</span>
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
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">Hex</span>
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
