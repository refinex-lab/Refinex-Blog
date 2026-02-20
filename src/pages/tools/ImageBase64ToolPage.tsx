import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Image as ImageIcon, Upload } from "lucide-react";

const formatBytes = (size: number) => {
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
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

const parseDataUrl = (value: string) => {
  const match = value.trim().match(/^data:([^;]+);base64,(.*)$/i);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
};

const guessMime = (value: string) => {
  if (value.startsWith("/9j/")) return "image/jpeg";
  if (value.startsWith("iVBOR")) return "image/png";
  if (value.startsWith("UklGR")) return "image/webp";
  return "image/png";
};

export const ImageBase64ToolPage = () => {
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(
    null
  );
  const [base64, setBase64] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [mimeType, setMimeType] = useState("image/png");
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const flashNotice = (message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 1600);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    const data = await new Promise<string>((resolve, reject) => {
      reader.onerror = () => reject(new Error("读取失败"));
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.readAsDataURL(file);
    });
    const parsed = parseDataUrl(data);
    setFileInfo({ name: file.name, size: file.size });
    setBase64(parsed?.base64 ?? "");
    setDataUrl(data);
    setMimeType(parsed?.mime ?? file.type ?? "image/png");
    event.target.value = "";
  };

  const handleBase64Change = (value: string) => {
    setBase64(value);
    const parsed = parseDataUrl(value);
    if (parsed) {
      setMimeType(parsed.mime);
      setDataUrl(value.trim());
      return;
    }
    if (value.trim().length > 0) {
      const mime = guessMime(value.trim());
      setMimeType(mime);
      setDataUrl(`data:${mime};base64,${value.trim()}`);
    } else {
      setDataUrl("");
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

  const handleDownloadText = () => {
    if (!base64) return;
    downloadText(base64, "image-base64.txt");
    flashNotice("已下载 base64");
  };

  const handleDownloadImage = () => {
    if (!dataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `image.${mimeType.split("/")[1] ?? "png"}`;
    anchor.click();
    flashNotice("已下载图片");
  };

  const previewAvailable = useMemo(() => dataUrl.startsWith("data:image"), [dataUrl]);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              图片 Base64 转换
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30">
              <Upload className="h-3.5 w-3.5" />
              选择图片
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
            <button
              type="button"
              onClick={() => handleCopy(base64)}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Copy className="h-3.5 w-3.5" />
              复制 Base64
            </button>
            <button
              type="button"
              onClick={() => handleCopy(dataUrl)}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Copy className="h-3.5 w-3.5" />
              复制 Data URL
            </button>
            <button
              type="button"
              onClick={handleDownloadText}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Download className="h-3.5 w-3.5" />
              下载 Base64
            </button>
            <button
              type="button"
              onClick={handleDownloadImage}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Download className="h-3.5 w-3.5" />
              下载图片
            </button>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>

        {fileInfo ? (
          <div className="text-xs text-slate-500 dark:text-slate-300">
            {fileInfo.name} · {formatBytes(fileInfo.size)} · {mimeType}
          </div>
        ) : null}
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>Base64 / Data URL</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">Text</span>
          </div>
          <div className="min-h-0 flex-1 p-4">
            <textarea
              value={base64}
              onChange={(event) => handleBase64Change(event.target.value)}
              placeholder="粘贴 Base64 或 Data URL..."
              className="h-full w-full resize-none rounded-xl border border-black/5 bg-white/80 p-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>预览</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">Image</span>
          </div>
          <div className="min-h-0 flex-1 p-4">
            {previewAvailable ? (
              <img src={dataUrl} alt="preview" className="max-h-[60vh] w-auto rounded-xl" />
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-300">暂无预览</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
