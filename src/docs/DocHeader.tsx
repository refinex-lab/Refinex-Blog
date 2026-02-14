export const DocHeader = ({
  title,
  description,
  cover,
  author,
  createdAt,
  updatedAt,
}: {
  title: string;
  description?: string;
  cover?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}) => {
  const hasMeta = Boolean(author || createdAt || updatedAt);

  return (
    <header className="mb-8">
      {cover ? (
        <div className="mb-5 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.04]">
          <img
            src={cover}
            alt={title ? `${title} cover` : "cover"}
            className="h-48 w-full object-cover md:h-56"
            loading="lazy"
          />
        </div>
      ) : null}

      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          {description}
        </p>
      ) : null}
      {hasMeta ? (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          {author ? <span>作者：{author}</span> : null}
          {createdAt ? <span>创建：{createdAt}</span> : null}
          {updatedAt ? <span>更新：{updatedAt}</span> : null}
        </div>
      ) : null}
    </header>
  );
};
