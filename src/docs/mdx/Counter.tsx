import { useState } from "react";

export const Counter = ({ initial = 0 }: { initial?: number }) => {
  const [count, setCount] = useState(initial);

  return (
    <div className="my-5 flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm shadow-black/[0.02] dark:border-white/10 dark:bg-zinc-950">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          MDX 交互示例
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          当前计数：<span className="font-semibold">{count}</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setCount((c) => c - 1)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          aria-label="减一"
        >
          -1
        </button>
        <button
          type="button"
          onClick={() => setCount(initial)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          aria-label="重置"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
          aria-label="加一"
        >
          +1
        </button>
      </div>
    </div>
  );
};

