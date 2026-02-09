import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-4">
            <img
              src="/logo.svg"
              alt="Refinex Blog logo"
              className="h-10 w-10 rounded-full border border-slate-800 bg-slate-900 p-2"
            />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Refinex Blog
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-50">
                前端技术博客
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white">
              开始写作
            </button>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400">
                  关于本站
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60" />
                <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-slate-50">
                        关于 Refinex Blog
                      </Dialog.Title>
                      <Dialog.Description className="mt-2 text-sm leading-6 text-slate-300">
                        以 React + TypeScript + Tailwind CSS + Radix UI 构建的
                        前端技术博客初始化模板，聚焦在内容生产与工程化体验。
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                        aria-label="关闭"
                      >
                        <Cross2Icon />
                      </button>
                    </Dialog.Close>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Dialog.Close asChild>
                      <button className="rounded-full bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600">
                        知道了
                      </button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Latest Draft
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-50">
                现代前端架构中的状态管理策略
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                以可维护性为核心，从 Zustand 到 Jotai，如何在团队规模与性能
                约束之间找到最优解。
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-slate-700 px-3 py-1">
                  React 19
                </span>
                <span className="rounded-full border border-slate-700 px-3 py-1">
                  TypeScript
                </span>
                <span className="rounded-full border border-slate-700 px-3 py-1">
                  UX Patterns
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-sm text-slate-400">
              下一步可以接入 CMS、评论系统与全文搜索。
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-sm font-semibold text-slate-100">
                初始化清单
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  React + TypeScript 基座
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Tailwind CSS 样式系统
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Radix UI 可访问组件
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-indigo-500/20 to-slate-900 p-6 text-sm text-slate-200">
              用这套模板快速启动前端技术博客项目。
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
