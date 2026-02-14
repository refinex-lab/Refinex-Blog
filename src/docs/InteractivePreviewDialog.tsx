import * as Dialog from "@radix-ui/react-dialog";
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { type ReactNode, useMemo, useRef, useState } from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const InteractivePreviewDialog = ({
  trigger,
  children,
  label,
  headerRight,
}: {
  trigger: ReactNode;
  children: ReactNode;
  label?: string;
  headerRight?: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fitMode, setFitMode] = useState(true);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0 });

  const zoom = (delta: number) => {
    setFitMode(false);
    setScale((prev) => clamp(prev + delta, 0.2, 6));
  };

  const contentClasses = useMemo(() => {
    if (!fitMode) return "";
    // Ensure common media (img/svg) actually scales down to fit the viewport.
    return "max-h-[86vh] max-w-[94vw] [&_img]:max-h-full [&_img]:max-w-full [&_img]:object-contain [&_svg]:max-h-full [&_svg]:max-w-full";
  }, [fitMode]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) return;
        setScale(1);
        setRotation(0);
        setFitMode(true);
        setOffset({ x: 0, y: 0 });
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18),rgba(0,0,0,0.65))] backdrop-blur-sm dark:bg-black/75 dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),rgba(0,0,0,0.85))]" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col outline-none">
          <div className="flex items-center justify-between gap-4 border-b border-white/15 px-4 py-3 text-white/90">
            {label ? <div className="text-sm font-medium">{label}</div> : <div />}
            <div className="flex items-center gap-1">
              {headerRight}
              <button
                type="button"
                onClick={() => zoom(-0.1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/25 transition hover:bg-black/40"
                aria-label="缩小"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => zoom(0.1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/25 transition hover:bg-black/40"
                aria-label="放大"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/25 transition hover:bg-black/40"
                aria-label="旋转"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setFitMode((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/25 transition hover:bg-black/40"
                aria-label={fitMode ? "关闭自适应" : "自适应最佳大小"}
              >
                {fitMode ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setScale(1);
                  setRotation(0);
                  setFitMode(true);
                  setOffset({ x: 0, y: 0 });
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/25 transition hover:bg-black/40"
                aria-label="还原"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/25 transition hover:bg-black/40"
                  aria-label="关闭预览"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div
            className="flex flex-1 cursor-grab items-center justify-center overflow-hidden p-4 active:cursor-grabbing"
            onWheel={(event) => {
              event.preventDefault();
              zoom(event.deltaY > 0 ? -0.08 : 0.08);
            }}
            onPointerDown={(event) => {
              // Allow drag-to-pan after zooming.
              if (event.button !== 0) return;
              const el = event.currentTarget;
              dragRef.current.pointerId = event.pointerId;
              dragRef.current.startX = event.clientX;
              dragRef.current.startY = event.clientY;
              dragRef.current.originX = offset.x;
              dragRef.current.originY = offset.y;
              el.setPointerCapture(event.pointerId);
              setFitMode(false);
            }}
            onPointerMove={(event) => {
              if (dragRef.current.pointerId !== event.pointerId) return;
              const dx = event.clientX - dragRef.current.startX;
              const dy = event.clientY - dragRef.current.startY;
              setOffset({
                x: dragRef.current.originX + dx,
                y: dragRef.current.originY + dy,
              });
            }}
            onPointerUp={(event) => {
              if (dragRef.current.pointerId !== event.pointerId) return;
              dragRef.current.pointerId = null;
            }}
            onPointerCancel={(event) => {
              if (dragRef.current.pointerId !== event.pointerId) return;
              dragRef.current.pointerId = null;
            }}
            style={{ touchAction: "none" }}
          >
            <div
              className={`origin-center transition-[transform] duration-150 ${contentClasses}`}
              style={{
                transform: fitMode
                  ? `rotate(${rotation}deg)`
                  : `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
              }}
            >
              {children}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
