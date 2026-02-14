import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { IconFont } from "../../components/ui/IconFont";

const hasIconFontSymbol = (iconFontId: string) => {
  if (typeof document === "undefined") return false;
  return Boolean(document.getElementById(iconFontId));
};

const providers = [
  {
    id: "deepseek",
    label: "DeepSeek",
    href: "https://chat.deepseek.com/",
    iconId: "icon-deepseek",
    allowEmbed: false,
  },
  {
    id: "claude",
    label: "Claude",
    href: "https://claude.ai/",
    iconId: "icon-Claude",
    allowEmbed: false,
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    href: "https://chatgpt.com/",
    iconId: "icon-OpenAiLogo",
    allowEmbed: false,
  },
  {
    id: "grok",
    label: "Grok",
    href: "https://grok.com/",
    iconId: "icon-grok",
    allowEmbed: false,
  },
  {
    id: "gemini",
    label: "Gemini",
    href: "https://gemini.google.com/app?utm_source=app_launcher&utm_medium=owned&utm_campaign=base_all",
    iconId: "icon-gemini-ai",
    allowEmbed: false,
  },
  {
    id: "zai",
    label: "Z.ai",
    href: "https://chat.z.ai/",
    iconId: "icon-a-zailogo",
    allowEmbed: false,
  },
  {
    id: "doubao",
    label: "豆包",
    href: "https://www.doubao.com/chat/",
    iconId: "icon-doubao",
    allowEmbed: true,
  },
] as const;

type Provider = (typeof providers)[number];

const AiIcon = ({ label, iconId }: { label: string; iconId: string }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      setReady(hasIconFontSymbol(iconId));
    };
    check();
    const timer = window.setTimeout(check, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [iconId]);

  if (!ready) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-[11px] font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
        {label.slice(0, 1)}
      </span>
    );
  }

  return <IconFont id={iconId} className="h-6 w-6" />;
};

export const AiHubPage = () => {
  const [activeId, setActiveId] = useState<Provider["id"]>(providers[0].id);

  const activeProvider = useMemo(
    () => providers.find((item) => item.id === activeId) ?? providers[0],
    [activeId]
  );

  const canEmbed = activeProvider.allowEmbed ?? false;

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col px-2 pb-2 pt-2 sm:px-3 sm:pb-3 sm:pt-3">
      <section className="flex min-h-0 flex-1 flex-col gap-2 rounded-[20px] border border-black/5 bg-white/80 p-2 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 gap-2 overflow-x-auto rounded-2xl border border-black/5 bg-white/70 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
            {providers.map((item) => {
              const active = item.id === activeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-200 text-slate-900 shadow-sm dark:bg-white/15 dark:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  <AiIcon label={item.label} iconId={item.iconId} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-black/10 bg-black/5 p-2 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-500 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <AiIcon label={activeProvider.label} iconId={activeProvider.iconId} />
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {activeProvider.label}
              </span>
              <span className="truncate text-slate-400">{activeProvider.href}</span>
            </div>
            {canEmbed ? null : (
              <a
                href={activeProvider.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-black/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
              >
                新窗口
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-slate-950">
            {canEmbed ? (
              <iframe
                key={activeProvider.id}
                src={activeProvider.href}
                title={activeProvider.label}
                className="block h-full w-full border-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%)] p-6 text-center dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_55%)]">
                <div className="max-w-md space-y-3">
                  <div className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    当前站点限制内嵌显示
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    点击下方按钮在新窗口打开，体验不受限制。
                  </p>
                  <a
                    href={activeProvider.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                  >
                    在新窗口打开
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
