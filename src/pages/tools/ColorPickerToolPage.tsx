import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Droplet, Palette } from "lucide-react";

const hexToRgb = (hex: string) => {
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) return null;
  const num = parseInt(sanitized, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      default:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export const ColorPickerToolPage = () => {
  const [hex, setHex] = useState("#3B82F6");
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
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 1600);
  };

  const rgb = useMemo(() => hexToRgb(hex) ?? { r: 0, g: 0, b: 0 }, [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      flashNotice("已复制");
    } catch {
      flashNotice("复制失败");
    }
  };

  const handleEyedropper = async () => {
    // @ts-expect-error EyeDropper is not typed in all TS libs
    const EyeDropper = window.EyeDropper as
      | undefined
      | (new () => { open: () => Promise<{ sRGBHex: string }> });
    if (!EyeDropper) {
      flashNotice("当前浏览器不支持 EyeDropper");
      return;
    }
    try {
      const picker = new EyeDropper();
      const result = await picker.open();
      if (result?.sRGBHex) setHex(result.sRGBHex);
    } catch {
      flashNotice("取色取消");
    }
  };

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <Palette className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              颜色选择器
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleEyedropper}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Droplet className="h-3.5 w-3.5" />
              屏幕取色
            </button>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div
            className="h-40 rounded-xl border border-black/10 dark:border-white/10"
            style={{ backgroundColor: hex }}
          />
          <div className="mt-4 flex items-center gap-3">
            <input
              type="color"
              value={hex}
              onChange={(event) => setHex(event.target.value)}
              className="h-12 w-12 rounded-lg border border-black/10 p-1 dark:border-white/10"
            />
            <input
              value={hex}
              onChange={(event) => setHex(event.target.value)}
              className="h-11 flex-1 rounded-2xl border border-black/10 bg-white/80 px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleCopy(hex)}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Copy className="h-3.5 w-3.5" />
              复制 HEX
            </button>
            <button
              type="button"
              onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Copy className="h-3.5 w-3.5" />
              复制 RGB
            </button>
            <button
              type="button"
              onClick={() =>
                handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)
              }
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Copy className="h-3.5 w-3.5" />
              复制 HSL
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-300">色值</div>
          <div className="mt-3 grid gap-3 text-sm text-slate-700 dark:text-slate-200">
            <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/10">
              <span>HEX</span>
              <span className="font-semibold">{hex}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/10">
              <span>RGB</span>
              <span className="font-semibold">{rgb.r}, {rgb.g}, {rgb.b}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/10">
              <span>HSL</span>
              <span className="font-semibold">{hsl.h}, {hsl.s}%, {hsl.l}%</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
