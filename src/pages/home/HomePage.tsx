export const HomePage = () => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <section className="rounded-2xl border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#3a437a]/70">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-200">
          Latest Draft
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
          现代前端架构中的状态管理策略
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-100/80">
          这里是主内容区域，占位用于后续接入文章列表、CMS 或路由内容。
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/60 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-[#3a437a]/50 dark:text-slate-100/70">
          这里可以注入文章列表、标签筛选、分页等模块。
        </div>
        <aside className="rounded-2xl border border-slate-200/70 bg-[var(--accent-color)] p-6 text-sm text-slate-700 dark:border-white/10 dark:text-white">
          右侧栏可以放置作者信息、近期文章或订阅入口。
        </aside>
      </section>
    </div>
  );
};
