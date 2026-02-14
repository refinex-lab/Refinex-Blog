import { useEffect } from "react";

type IconFontAssetsProps = {
  scriptUrl?: string;
  cssUrl?: string;
};

const ensureStyle = (href: string) => {
  const existing = document.querySelector(
    `link[data-iconfont-style="${href}"]`
  );
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-iconfont-style", href);
  document.head.appendChild(link);
};

const ensureScript = (src: string) => {
  const existing = document.querySelector(
    `script[data-iconfont-script="${src}"]`
  );
  if (existing) return;

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.setAttribute("data-iconfont-script", src);
  document.head.appendChild(script);
};

export const IconFontAssets = ({ scriptUrl, cssUrl }: IconFontAssetsProps) => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (cssUrl) ensureStyle(cssUrl);
    if (scriptUrl) ensureScript(scriptUrl);
  }, [cssUrl, scriptUrl]);

  return null;
};

