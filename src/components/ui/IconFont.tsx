import type { CSSProperties } from "react";

type IconFontProps = {
  id: string;
  className?: string;
  title?: string;
  style?: CSSProperties;
};

// iconfont.cn Symbol 模式：页面注入 iconfont.js 后会生成 <symbol id="icon-xxx" />
export const IconFont = ({ id, className, title, style }: IconFontProps) => {
  const symbolId = id.startsWith("#") ? id : `#${id}`;

  return (
    <svg
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      style={style}
    >
      {title ? <title>{title}</title> : null}
      <use href={symbolId} xlinkHref={symbolId} />
    </svg>
  );
};
