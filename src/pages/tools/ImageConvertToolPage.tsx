import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightLeft, Download, Image as ImageIcon, Upload } from "lucide-react";

const formatBytes = (size: number) => {
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

type ConvertMode = "png-to-jpg" | "webp-to-png";

export const ImageConvertToolPage = () => {
  const [mode, setMode] = useState<ConvertMode>("png-to-jpg");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [sourceUrl, outputUrl]);

  const flashNotice = (message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 1600);
  };

  const acceptType = useMemo(() => {
    return mode === "png-to-jpg" ? "image/png" : "image/webp";
  }, [mode]);

  const outputType = useMemo(() => {
    return mode === "png-to-jpg" ? "image/jpeg" : "image/png";
  }, [mode]);

  const outputExt = useMemo(() => {
    return mode === "png-to-jpg" ? "jpg" : "png";
  }, [mode]);

  const handleFileSelect = async (file: File) => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setSourceFile(file);
    const url = URL.createObjectURL(file);
    setSourceUrl(url);

    const image = new Image();
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      flashNotice("无法获取 canvas 画布");
      return;
    }
    if (outputType === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), outputType, 0.92)
    );

    if (!blob) {
      flashNotice("转换失败");
      return;
    }
    setOutputBlob(blob);
    const outUrl = URL.createObjectURL(blob);
    setOutputUrl(outUrl);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void handleFileSelect(file);
    event.target.value = "";
  };

  const handleDownload = () => {
    if (!outputBlob || !sourceFile) return;
    const anchor = document.createElement("a");
    anchor.href = outputUrl ?? URL.createObjectURL(outputBlob);
    const baseName = sourceFile.name.replace(/\.[^/.]+$/, "");
    anchor.download = `${baseName}.${outputExt}`;
    anchor.click();
    flashNotice("已下载转换结果");
  };

  const warning = useMemo(() => {
    if (!sourceFile) return "";
    if (mode === "png-to-jpg" && sourceFile.type !== "image/png") {
      return "当前文件不是 PNG，仍可尝试转换。";
    }
    if (mode === "webp-to-png" && sourceFile.type !== "image/webp") {
      return "当前文件不是 WEBP，仍可尝试转换。";
    }
    return "";
  }, [mode, sourceFile]);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              图片格式转换
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 dark:border-white/10 dark:bg-white/10">
              <button
                type="button"
                onClick={() => setMode("png-to-jpg")}
                className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition ${
                  mode === "png-to-jpg"
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-600 hover:bg-white dark:text-slate-200 dark:hover:bg-white/10"
                }`}
              >
                PNG → JPG
              </button>
              <button
                type="button"
                onClick={() => setMode("webp-to-png")}
                className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition ${
                  mode === "webp-to-png"
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-600 hover:bg-white dark:text-slate-200 dark:hover:bg-white/10"
                }`}
              >
                WEBP → PNG
              </button>
            </div>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30">
            <Upload className="h-3.5 w-3.5" />
            选择图片
            <input
              type="file"
              accept={acceptType}
              className="hidden"
              onChange={handleInputChange}
            />
          </label>
          {sourceFile ? (
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
              {sourceFile.name} · {formatBytes(sourceFile.size)}
            </span>
          ) : null}
          {warning ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
              {warning}
            </span>
          ) : null}
          {outputBlob ? (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Download className="h-3.5 w-3.5" />
              下载结果
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col items-center justify-center rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          {sourceUrl ? (
            <img
              src={sourceUrl}
              alt="source"
              className="max-h-[60vh] w-auto rounded-xl border border-black/5 dark:border-white/10"
            />
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-300">
              请选择待转换图片
            </div>
          )}
        </div>
        <div className="flex min-h-0 flex-col items-center justify-center rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          {outputUrl ? (
            <div className="space-y-3 text-center">
              <img
                src={outputUrl}
                alt="output"
                className="max-h-[60vh] w-auto rounded-xl border border-black/5 dark:border-white/10"
              />
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                输出大小：{formatBytes(outputBlob?.size ?? 0)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-300">
              转换结果将在此显示
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
