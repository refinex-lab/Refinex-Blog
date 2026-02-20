import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Brush,
  Download,
  Eraser,
  Paintbrush,
  PenTool,
  Pencil,
  RotateCcw,
  RotateCw,
} from "lucide-react";

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  color: string;
  width: number;
  tool: ToolKind;
  points: Point[];
};

type ToolKind = "pencil" | "pen" | "brush";

const TOOL_OPTIONS: Array<{
  id: ToolKind;
  label: string;
  icon: typeof Pencil;
  defaultWidth: number;
  alpha: number;
  cap: CanvasLineCap;
}> = [
  {
    id: "pencil",
    label: "铅笔",
    icon: Pencil,
    defaultWidth: 2,
    alpha: 0.72,
    cap: "round",
  },
  {
    id: "pen",
    label: "钢笔",
    icon: PenTool,
    defaultWidth: 3,
    alpha: 1,
    cap: "round",
  },
  {
    id: "brush",
    label: "画笔",
    icon: Paintbrush,
    defaultWidth: 6,
    alpha: 0.88,
    cap: "round",
  },
];

const getToolStyle = (tool: ToolKind) => {
  return TOOL_OPTIONS.find((item) => item.id === tool) ?? TOOL_OPTIONS[1];
};

const COLOR_PRESETS = [
  "#111827",
  "#0F766E",
  "#1D4ED8",
  "#B45309",
  "#B91C1C",
  "#7C3AED",
];

const toDataUrl = (canvas: HTMLCanvasElement) => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const context = exportCanvas.getContext("2d");
  if (!context) return "";

  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  context.drawImage(canvas, 0, 0);
  return exportCanvas.toDataURL("image/png");
};

export const SignatureToolPage = () => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStrokes, setRedoStrokes] = useState<Stroke[]>([]);
  const [toolKind, setToolKind] = useState<ToolKind>("pen");
  const [penColor, setPenColor] = useState(COLOR_PRESETS[0]);
  const [penWidth, setPenWidth] = useState(3);
  const [notice, setNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const drawingStrokeRef = useRef<Stroke | null>(null);
  const isDrawingRef = useRef(false);
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  const hasSignature = strokes.length > 0;

  const flashNotice = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) {
      globalThis.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = globalThis.setTimeout(() => {
      setNotice(null);
    }, 1400);
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        globalThis.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const drawStroke = useCallback((context: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length === 0) return;

    const toolStyle = getToolStyle(stroke.tool);

    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.width;
    context.lineCap = toolStyle.cap;
    context.lineJoin = "round";
    context.globalAlpha = toolStyle.alpha;

    if (stroke.points.length === 1) {
      const firstPoint = stroke.points[0];
      context.beginPath();
      context.arc(firstPoint.x, firstPoint.y, stroke.width / 2, 0, Math.PI * 2);
      context.fillStyle = stroke.color;
      context.fill();
      context.globalAlpha = 1;
      return;
    }

    context.beginPath();
    context.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let index = 1; index < stroke.points.length; index += 1) {
      const point = stroke.points[index];
      context.lineTo(point.x, point.y);
    }
    context.stroke();
    context.globalAlpha = 1;
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => drawStroke(context, stroke));

    if (strokes.length === 0) {
      context.save();
      context.strokeStyle = "rgba(148,163,184,0.45)";
      context.lineWidth = 1;
      context.setLineDash([8, 8]);
      const baseline = canvas.height * 0.72;
      context.beginPath();
      context.moveTo(24, baseline);
      context.lineTo(canvas.width - 24, baseline);
      context.stroke();
      context.setLineDash([]);

      context.fillStyle = "rgba(100,116,139,0.75)";
      context.font = "14px system-ui, -apple-system, Segoe UI";
      context.fillText("请在此处签名", 28, baseline - 12);
      context.restore();
    }
  }, [drawStroke, strokes]);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = Math.max(320, Math.floor(container.clientWidth));
    const height = Math.max(220, Math.floor(container.clientHeight));
    if (sizeRef.current.width === width && sizeRef.current.height === height) {
      return;
    }
    sizeRef.current = { width, height };

    const devicePixelRatio = globalThis.devicePixelRatio || 1;
    canvas.width = Math.floor(width * devicePixelRatio);
    canvas.height = Math.floor(height * devicePixelRatio);

    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    redraw();
  }, [redraw]);

  useEffect(() => {
    syncCanvasSize();
    const observer = new ResizeObserver(() => {
      syncCanvasSize();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [syncCanvasSize]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(event);
    if (!point) return;
    isDrawingRef.current = true;
    const freshStroke: Stroke = {
      color: penColor,
      width: penWidth,
      tool: toolKind,
      points: [point],
    };
    drawingStrokeRef.current = freshStroke;
    event.currentTarget.setPointerCapture(event.pointerId);

    setStrokes((previous) => [...previous, freshStroke]);
    setRedoStrokes([]);
  };

  const handleToolChange = (nextTool: ToolKind) => {
    setToolKind(nextTool);
    const nextWidth = getToolStyle(nextTool).defaultWidth;
    setPenWidth(nextWidth);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const point = getPoint(event);
    if (!point) return;

    setStrokes((previous) => {
      if (previous.length === 0) return previous;
      const latest = previous.at(-1);
      if (!latest) return previous;
      const updated: Stroke = {
        ...latest,
        points: [...latest.points, point],
      };
      drawingStrokeRef.current = updated;
      return [...previous.slice(0, -1), updated];
    });
  };

  const finishStroke = () => {
    isDrawingRef.current = false;
    drawingStrokeRef.current = null;
  };

  const handleUndo = () => {
    setStrokes((previous) => {
      if (previous.length === 0) return previous;
      const removed = previous.at(-1);
      if (!removed) return previous;
      setRedoStrokes((redoPrevious) => [...redoPrevious, removed]);
      return previous.slice(0, -1);
    });
  };

  const handleRedo = () => {
    setRedoStrokes((previous) => {
      if (previous.length === 0) return previous;
      const restored = previous.at(-1);
      if (!restored) return previous;
      setStrokes((strokesPrevious) => [...strokesPrevious, restored]);
      return previous.slice(0, -1);
    });
  };

  const handleClear = () => {
    setStrokes([]);
    setRedoStrokes([]);
    flashNotice("画布已清空");
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const dataUrl = toDataUrl(canvas);
    if (!dataUrl) {
      flashNotice("导出失败");
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `signature-${Date.now()}.png`;
    anchor.click();
    flashNotice("已下载 PNG");
  };

  const strokeCountText = useMemo(() => `${strokes.length} 笔`, [strokes.length]);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <Brush className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">电子签名</div>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                支持鼠标与触控签名，撤销重做与高质量 PNG 导出
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              {strokeCountText}
            </span>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="min-h-0 min-w-0 rounded-2xl border border-black/5 bg-white/80 p-3 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div
            ref={containerRef}
            className="relative h-full min-h-90 min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-slate-900"
          >
            <canvas
              ref={canvasRef}
              className="block h-full w-full min-w-0 touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishStroke}
              onPointerCancel={finishStroke}
              onPointerLeave={finishStroke}
            />
          </div>
        </div>

        <aside className="tool-scrollbar min-h-0 space-y-4 overflow-auto rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">画笔设置</h3>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {TOOL_OPTIONS.map((tool) => {
                  const Icon = tool.icon;
                  const active = toolKind === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => handleToolChange(tool.id)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                          : "border-black/10 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tool.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => {
                  const active = penColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setPenColor(color)}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        active
                          ? "border-slate-900 ring-2 ring-slate-300 dark:border-white dark:ring-white/30"
                          : "border-white/80"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`颜色 ${color}`}
                    />
                  );
                })}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-300">
                  画笔粗细：{penWidth}px
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={penWidth}
                  onChange={(event) => setPenWidth(Number(event.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <RotateCcw className="h-4 w-4" />
              撤销
            </button>

            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStrokes.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <RotateCw className="h-4 w-4" />
              重做
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={!hasSignature}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Eraser className="h-4 w-4" />
              清空画布
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!hasSignature}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              下载 PNG
            </button>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/70 p-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
            <p className="font-semibold text-slate-700 dark:text-slate-200">使用提示</p>
            <ul className="mt-2 space-y-1">
              <li>- 建议横屏签字，笔画更自然。</li>
              <li>- 下载文件为白底 PNG，便于文档粘贴。</li>
              <li>- 支持触控笔、手指和鼠标签名。</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
};
