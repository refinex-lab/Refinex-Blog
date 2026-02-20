import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, Copy, Download, FileUp, Image, Code2 } from "lucide-react";

const MODE_OPTIONS = [
  { id: "encode", label: "文本 → Base64" },
  { id: "decode", label: "Base64 → 文本" },
] as const;

const SOURCE_OPTIONS = [
  { id: "text", label: "文本模式" },
  { id: "file", label: "文件模式" },
] as const;

type ModeId = (typeof MODE_OPTIONS)[number]["id"];
type SourceId = (typeof SOURCE_OPTIONS)[number]["id"];

type FilePayload = {
  name: string;
  type: string;
  size: number;
  base64: string;
  dataUrl: string;
};

type DecodedFilePayload = {
  bytes: Uint8Array;
  mime?: string;
};

const DEFAULT_TEXT = "Hello Refinex";

const encodeUtf8ToBase64 = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const parseBase64Payload = (base64: string) => {
  const trimmed = base64.trim();
  const payloadMatch = trimmed.match(/^data:([^;]+);base64,(.*)$/i);
  const raw = payloadMatch ? payloadMatch[2] : trimmed;
  const mime = payloadMatch ? payloadMatch[1] : undefined;
  return { raw, mime };
};

const base64ToBytes = (base64: string) => {
  const { raw } = parseBase64Payload(base64);
  const binary = atob(raw);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const decodeBase64ToUtf8 = (base64: string) => {
  const bytes = base64ToBytes(base64);
  return new TextDecoder().decode(bytes);
};

const MIME_EXTENSION_MAP: Record<string, string> = {
  "text/plain": "txt",
  "application/json": "json",
  "text/html": "html",
  "text/css": "css",
  "application/xml": "xml",
  "text/xml": "xml",
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

const buildFileName = (name: string, mime?: string) => {
  const trimmed = name.trim() || "decoded-file";
  if (trimmed.includes(".")) return trimmed;
  const extension = (mime && MIME_EXTENSION_MAP[mime]) || "bin";
  return `${trimmed}.${extension}`;
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

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const formatBytes = (size: number) => {
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

export const Base64ToolPage = () => {
  const [mode, setMode] = useState<ModeId>("encode");
  const [source, setSource] = useState<SourceId>("text");
  const [textInput, setTextInput] = useState(DEFAULT_TEXT);
  const [textOutput, setTextOutput] = useState("");
  const [textError, setTextError] = useState<string | null>(null);
  const [outputAsDataUrl, setOutputAsDataUrl] = useState(false);
  const [decodedFile, setDecodedFile] = useState<DecodedFilePayload | null>(null);
  const [decodedFileName, setDecodedFileName] = useState("decoded-file");
  const [notice, setNotice] = useState<string | null>(null);

  const [filePayload, setFilePayload] = useState<FilePayload | null>(null);
  const [fileOutputFormat, setFileOutputFormat] = useState<"base64" | "dataUrl">(
    "base64"
  );
  const [fileError, setFileError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (source !== "text") return;
    if (!textInput.trim()) {
      setTextOutput("");
      setTextError(null);
      return;
    }
    try {
      if (mode === "encode") {
        const encoded = encodeUtf8ToBase64(textInput);
        setTextOutput(
          outputAsDataUrl ? `data:text/plain;base64,${encoded}` : encoded
        );
        setDecodedFile(null);
      } else {
        const { raw, mime } = parseBase64Payload(textInput);
        if (!raw) {
          setTextOutput("");
          setDecodedFile(null);
          setTextError(null);
          return;
        }
        const decoded = decodeBase64ToUtf8(textInput);
        setTextOutput(decoded);
        setDecodedFile({ bytes: base64ToBytes(textInput), mime });
      }
      setTextError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Base64 解析失败";
      setTextError(message);
      setTextOutput("");
      setDecodedFile(null);
    }
  }, [mode, outputAsDataUrl, source, textInput]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onerror = () => reject(new Error("文件读取失败"));
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1] ?? "";
      setFilePayload({
        name: file.name,
        type: file.type || "unknown",
        size: file.size,
        base64,
        dataUrl,
      });
      setFileError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "文件读取失败";
      setFileError(message);
      setFilePayload(null);
    }
    event.target.value = "";
  };

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

  const handleCopyOutput = async () => {
    const payload = source === "text" ? textOutput : fileOutput;
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      flashNotice("已复制输出");
    } catch {
      flashNotice("复制失败");
    }
  };

  const handleDownloadOutput = () => {
    const payload = source === "text" ? textOutput : fileOutput;
    if (!payload) return;
    const name =
      source === "text"
        ? mode === "encode"
          ? "base64.txt"
          : "decoded.txt"
        : filePayload
          ? `${filePayload.name}.b64`
          : "base64.txt";
    downloadText(payload, name);
    flashNotice("已下载输出");
  };

  const handleDownloadDecodedFile = () => {
    if (!decodedFile) return;
    const filename = buildFileName(decodedFileName, decodedFile.mime);
    const blob = new Blob([decodedFile.bytes.buffer as ArrayBuffer], {
      type: decodedFile.mime ?? "application/octet-stream",
    });
    downloadBlob(blob, filename);
    flashNotice("文件已下载");
  };

  const fileOutput = useMemo(() => {
    if (!filePayload) return "";
    return fileOutputFormat === "dataUrl" ? filePayload.dataUrl : filePayload.base64;
  }, [fileOutputFormat, filePayload]);

  const showImagePreview = useMemo(() => {
    if (!filePayload) return false;
    return filePayload.type.startsWith("image/") || filePayload.dataUrl.startsWith("data:image");
  }, [filePayload]);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                Base64 编码解码
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                支持文本/文件互转与图片预览
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex flex-wrap gap-1 rounded-xl border border-black/10 bg-white/70 p-1 text-xs dark:border-white/10 dark:bg-zinc-950/40">
              {MODE_OPTIONS.map((item) => (
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

            <div className="inline-flex flex-wrap gap-1 rounded-xl border border-black/10 bg-white/70 p-1 text-xs dark:border-white/10 dark:bg-zinc-950/40">
              {SOURCE_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSource(item.id)}
                  className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                    source === item.id
                      ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                      : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
          {source === "text" && mode === "encode" ? (
            <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
              <input
                type="checkbox"
                checked={outputAsDataUrl}
                onChange={(event) => setOutputAsDataUrl(event.target.checked)}
                className="h-3.5 w-3.5"
              />
              输出 data URL
            </label>
          ) : null}

          {source === "text" && mode === "decode" ? (
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
              <input
                value={decodedFileName}
                onChange={(event) => setDecodedFileName(event.target.value)}
                placeholder="文件名"
                className="h-6 w-28 rounded-md border border-transparent bg-transparent px-2 text-xs text-slate-600 outline-none focus:border-slate-300 dark:text-slate-200 dark:focus:border-white/30"
              />
              <span className="text-[11px] text-slate-400">自动补全后缀</span>
            </div>
          ) : null}

          {source === "file" ? (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                <FileUp className="h-3.5 w-3.5" />
                选择文件
              </button>
              <div className="inline-flex rounded-full border border-black/10 bg-white/70 p-1 dark:border-white/10 dark:bg-white/10">
                <button
                  type="button"
                  onClick={() => setFileOutputFormat("base64")}
                  className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition ${
                    fileOutputFormat === "base64"
                      ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100"
                      : "text-slate-600 hover:bg-white dark:text-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  Base64
                </button>
                <button
                  type="button"
                  onClick={() => setFileOutputFormat("dataUrl")}
                  className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition ${
                    fileOutputFormat === "dataUrl"
                      ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100"
                      : "text-slate-600 hover:bg-white dark:text-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  Data URL
                </button>
              </div>
              {filePayload ? (
                <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
                  {filePayload.name} · {formatBytes(filePayload.size)}
                </span>
              ) : null}
              {fileError ? (
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-600 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
                  {fileError}
                </span>
              ) : null}
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
            </>
          ) : null}

          {notice ? (
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              {notice}
            </span>
          ) : null}
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>输入</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">
              {source === "text" ? "Text" : "File"}
            </span>
          </div>
          <div className="min-h-0 flex-1 p-4">
            {source === "text" ? (
              <textarea
                value={textInput}
                onChange={(event) => setTextInput(event.target.value)}
                className="h-full w-full resize-none rounded-xl border border-black/5 bg-white/80 p-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-black/10 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <FileUp className="h-6 w-6" />
                <p>选择文件后将自动生成 Base64</p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                >
                  选择文件
                </button>
              </div>
            )}
          </div>
          {source === "text" && textError ? (
            <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
              {textError}
            </div>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>输出</span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">
                {source === "text" ? (mode === "encode" ? "Base64" : "Text") : "Base64"}
              </span>
              <button
                type="button"
                onClick={handleCopyOutput}
                className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                <Copy className="h-3.5 w-3.5" />
                复制
              </button>
              <button
                type="button"
                onClick={handleDownloadOutput}
                className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                <Download className="h-3.5 w-3.5" />
                下载
              </button>
              {source === "text" && mode === "decode" && decodedFile ? (
                <button
                  type="button"
                  onClick={handleDownloadDecodedFile}
                  className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
                >
                  <Download className="h-3.5 w-3.5" />
                  下载文件
                </button>
              ) : null}
            </div>
          </div>
          <div className="min-h-0 flex-1 p-4">
            {source === "text" ? (
              <textarea
                value={textOutput}
                readOnly
                className="h-full w-full resize-none rounded-xl border border-black/5 bg-slate-50 p-4 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
              />
            ) : (
              <div className="flex h-full flex-col gap-3">
                {showImagePreview ? (
                  <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white/70 p-3 text-xs text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                    <Image className="h-4 w-4" />
                    图片预览
                  </div>
                ) : null}
                {showImagePreview ? (
                  <div className="flex justify-center rounded-xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                    <img
                      src={filePayload?.dataUrl}
                      alt={filePayload?.name ?? "preview"}
                      className="max-h-48 w-auto rounded-lg"
                    />
                  </div>
                ) : null}
                <textarea
                  value={fileOutput}
                  readOnly
                  className="h-full w-full resize-none rounded-xl border border-black/5 bg-slate-50 p-4 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {source === "text" ? null : (
        <div className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-300">
          <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
          文件模式仅支持 File → Base64，如需反向解析请使用文本模式粘贴 Base64
        </div>
      )}
    </div>
  );
};
