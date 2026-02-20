import { useEffect, useMemo, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { Download, Image as ImageIcon, Upload } from "lucide-react";

const formatBytes = (size: number) => {
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

export const ImageCompressToolPage = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxSizeMB, setMaxSizeMB] = useState(2);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [sourceUrl, compressedUrl]);

  const flashNotice = (message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 1600);
  };

  const handleFileSelect = async (file: File) => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
    setCompressedFile(null);
    setCompressedUrl(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void handleFileSelect(file);
    event.target.value = "";
  };

  const handleCompress = async () => {
    if (!sourceFile) return;
    try {
      const compressed = await imageCompression(sourceFile, {
        maxSizeMB,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        initialQuality: quality,
      });
      setCompressedFile(compressed);
      setCompressedUrl(URL.createObjectURL(compressed));
      flashNotice("压缩完成");
    } catch (err) {
      const message = err instanceof Error ? err.message : "压缩失败";
      flashNotice(message);
    }
  };

  const handleDownload = () => {
    if (!compressedFile || !compressedUrl) return;
    const anchor = document.createElement("a");
    anchor.href = compressedUrl;
    const baseName = compressedFile.name.replace(/\.[^/.]+$/, "");
    anchor.download = `${baseName}-compressed.${compressedFile.name.split(".").pop() ?? "jpg"}`;
    anchor.click();
  };

  const stats = useMemo(() => {
    if (!sourceFile || !compressedFile) return null;
    const ratio = (compressedFile.size / sourceFile.size) * 100;
    return {
      ratio: ratio.toFixed(1),
      saved: formatBytes(sourceFile.size - compressedFile.size),
    };
  }, [sourceFile, compressedFile]);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              图片压缩
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30">
              <Upload className="h-3.5 w-3.5" />
              选择图片
              <input type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
            </label>
            <button
              type="button"
              onClick={handleCompress}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              压缩
            </button>
            {compressedFile ? (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                <Download className="h-3.5 w-3.5" />
                下载
              </button>
            ) : null}
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-200">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
            目标大小(MB)
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={maxSizeMB}
              onChange={(event) => setMaxSizeMB(Number(event.target.value))}
              className="h-6 w-16 rounded-md border border-transparent bg-transparent px-2 text-xs text-slate-600 outline-none focus:border-slate-300 dark:text-slate-200 dark:focus:border-white/30"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
            最大宽度
            <input
              type="number"
              min={320}
              step={10}
              value={maxWidth}
              onChange={(event) => setMaxWidth(Number(event.target.value))}
              className="h-6 w-20 rounded-md border border-transparent bg-transparent px-2 text-xs text-slate-600 outline-none focus:border-slate-300 dark:text-slate-200 dark:focus:border-white/30"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
            质量
            <input
              type="range"
              min={0.4}
              max={1}
              step={0.05}
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
              className="w-28"
            />
            <span className="text-[11px]">{quality.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col items-center justify-center rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          {sourceUrl ? (
            <img src={sourceUrl} alt="source" className="max-h-[60vh] w-auto rounded-xl" />
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-300">请选择图片</div>
          )}
          {sourceFile ? (
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-300">
              原图大小：{formatBytes(sourceFile.size)}
            </div>
          ) : null}
        </div>
        <div className="flex min-h-0 flex-col items-center justify-center rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          {compressedUrl ? (
            <img src={compressedUrl} alt="compressed" className="max-h-[60vh] w-auto rounded-xl" />
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-300">压缩结果预览</div>
          )}
          {compressedFile ? (
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-300">
              压缩后：{formatBytes(compressedFile.size)}
              {stats ? `，节省 ${stats.saved}（${stats.ratio}%）` : ""}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};
