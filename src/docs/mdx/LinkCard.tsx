import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

interface LinkCardProps {
  href: string;
  title?: string;
  description?: string;
  image?: string;
  icon?: string;
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string) {
  const hostname = getHostname(url);
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
}

export const LinkCard = ({
  href,
  title: titleProp,
  description: descProp,
  image: imageProp,
  icon: iconProp,
}: LinkCardProps) => {
  const [meta, setMeta] = useState({
    title: titleProp ?? "",
    description: descProp ?? "",
    image: imageProp ?? "",
    icon: iconProp ?? getFaviconUrl(href),
  });
  const [imgError, setImgError] = useState(false);

  // Auto-fetch metadata only when manual props are incomplete
  useEffect(() => {
    if (titleProp) return;

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(href)}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");

        const og = (name: string) =>
          doc
            .querySelector(`meta[property="og:${name}"]`)
            ?.getAttribute("content") ?? "";

        setMeta((prev) => ({
          title: prev.title || og("title") || doc.title || getHostname(href),
          description: prev.description || og("description"),
          image: prev.image || og("image"),
          icon: prev.icon,
        }));
      } catch {
        // Fetch failed — fall back to hostname as title
        setMeta((prev) => ({
          ...prev,
          title: prev.title || getHostname(href),
        }));
      }
    })();

    return () => controller.abort();
  }, [href, titleProp]);

  const displayTitle = meta.title || getHostname(href);
  const showImage = meta.image && !imgError;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="my-5 flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 no-underline transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-900"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {displayTitle}
        </span>
        {meta.description && (
          <span className="line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {meta.description}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          {meta.icon ? (
            <img
              src={meta.icon}
              alt=""
              className="h-4 w-4 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Globe className="h-3.5 w-3.5" />
          )}
          <span className="truncate">{getHostname(href)}</span>
        </span>
      </div>
      {showImage && (
        <img
          src={meta.image}
          alt=""
          className="h-[80px] w-[120px] shrink-0 rounded-xl object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </a>
  );
};
