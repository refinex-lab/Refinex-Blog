import type { ImgHTMLAttributes } from "react";
import { InteractivePreviewDialog } from "./InteractivePreviewDialog";

export const MarkdownImage = ({
  src,
  alt,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => {
  if (!src) return null;

  return (
    <InteractivePreviewDialog
      trigger={
        <button
          type="button"
          className="my-4 block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] transition hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
          aria-label={alt ? `预览图片：${alt}` : "预览图片"}
        >
          <img
            src={src}
            alt={alt ?? ""}
            loading="lazy"
            className="block h-auto w-full"
            {...props}
          />
        </button>
      }
    >
      <img
        src={src}
        alt={alt ?? ""}
        className="block h-auto w-auto select-none"
        draggable={false}
      />
    </InteractivePreviewDialog>
  );
};
