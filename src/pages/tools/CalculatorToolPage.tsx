import { useEffect, useMemo, useRef, useState } from "react";
import { all, create } from "mathjs";
import type { MathType } from "mathjs";
import { Calculator, Copy, Delete, Eraser, History } from "lucide-react";

type AngleMode = "deg" | "rad";

type CalcHistory = {
  id: string;
  expression: string;
  result: string;
};

const math = create(all, {
  number: "BigNumber",
  precision: 40,
});

const KEY_ROWS = [
  { id: "trig", keys: ["sin(", "cos(", "tan(", "(", ")", "⌫"] },
  { id: "func", keys: ["ln(", "log(", "sqrt(", "^", "%", "C"] },
  { id: "row7", keys: ["7", "8", "9", "/", "pi", "ans"] },
  { id: "row4", keys: ["4", "5", "6", "*", "e", "mr"] },
  { id: "row1", keys: ["1", "2", "3", "-", ".", "("] },
  { id: "row0", keys: ["0", "00", ",", "+", "=", ")"] },
] as const;

const normalizeInput = (value: string) => value.replaceAll("×", "*").replaceAll("÷", "/").trim();

const toNumber = (value: MathType) => Number(math.format(value, { notation: "auto", precision: 16 }));

const buildScope = (angleMode: AngleMode, ans: MathType, mr: MathType) => {
  const inAngle = (value: MathType) => {
    const numeric = toNumber(value);
    return angleMode === "deg" ? (numeric * Math.PI) / 180 : numeric;
  };

  const outAngle = (value: number) => {
    return angleMode === "deg" ? (value * 180) / Math.PI : value;
  };

  return {
    pi: math.pi,
    e: math.e,
    ans,
    mr,
    sin: (x: MathType) => math.bignumber(Math.sin(inAngle(x))),
    cos: (x: MathType) => math.bignumber(Math.cos(inAngle(x))),
    tan: (x: MathType) => math.bignumber(Math.tan(inAngle(x))),
    asin: (x: MathType) => math.bignumber(outAngle(Math.asin(toNumber(x)))),
    acos: (x: MathType) => math.bignumber(outAngle(Math.acos(toNumber(x)))),
    atan: (x: MathType) => math.bignumber(outAngle(Math.atan(toNumber(x)))),
    ln: (x: MathType) => math.bignumber(Math.log(toNumber(x))),
    log: (x: MathType) => math.bignumber(Math.log10(toNumber(x))),
  };
};

const formatOutput = (value: MathType) => {
  if (value === null || value === undefined) return "0";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NaN";
  if (typeof value === "string") return value;
  return math.format(value, { notation: "auto", precision: 16 });
};

const evaluateSafe = (expression: string, angleMode: AngleMode, ans: MathType, mr: MathType) => {
  const normalized = normalizeInput(expression);
  if (!normalized) throw new Error("请输入表达式");
  const scope = buildScope(angleMode, ans, mr);
  return math.evaluate(normalized, scope) as MathType;
};

const isInputKey = (key: string) => {
  return /^\d$/.test(key) || ["+", "-", "*", "/", "^", "(", ")", ".", "%"].includes(key);
};

export const CalculatorToolPage = () => {
  const [angleMode, setAngleMode] = useState<AngleMode>("deg");
  const [expression, setExpression] = useState("");
  const [ansValue, setAnsValue] = useState<MathType>(math.bignumber(0));
  const [memory, setMemory] = useState<MathType>(math.bignumber(0));
  const [history, setHistory] = useState<CalcHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        globalThis.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const flashNotice = (message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) {
      globalThis.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = globalThis.setTimeout(() => {
      setNotice(null);
    }, 1300);
  };

  const previewResult = useMemo(() => {
    if (!expression.trim()) {
      setError(null);
      return "";
    }
    try {
      const raw = evaluateSafe(expression, angleMode, ansValue, memory);
      setError(null);
      return formatOutput(raw);
    } catch (err) {
      setError(err instanceof Error ? err.message : "表达式错误");
      return "";
    }
  }, [angleMode, ansValue, expression, memory]);

  const append = (text: string) => {
    setExpression((previous) => `${previous}${text}`);
  };

  const clearAll = () => {
    setExpression("");
    setError(null);
  };

  const backspace = () => {
    setExpression((previous) => previous.slice(0, -1));
  };

  const calculate = () => {
    if (!expression.trim()) return;
    try {
      const raw = evaluateSafe(expression, angleMode, ansValue, memory);
      const result = formatOutput(raw);
      setAnsValue(raw);
      setExpression(result);
      setError(null);
      setHistory((previous) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          expression,
          result,
        },
        ...previous,
      ].slice(0, 30));
    } catch (err) {
      setError(err instanceof Error ? err.message : "计算失败");
    }
  };

  const applyMemory = (action: "mc" | "mr" | "m+" | "m-" | "ms") => {
    if (action === "mc") {
      setMemory(math.bignumber(0));
      flashNotice("内存已清空");
      return;
    }
    if (action === "mr") {
      append("mr");
      return;
    }

    const source = previewResult || expression || "0";
    try {
      const raw = evaluateSafe(source, angleMode, ansValue, memory);
      if (action === "ms") {
        setMemory(raw);
        flashNotice("已写入内存");
        return;
      }
      if (action === "m+") {
        setMemory((previous: MathType) => math.add(previous, raw) as MathType);
        flashNotice("已执行 M+");
        return;
      }
      setMemory((previous: MathType) => math.subtract(previous, raw) as MathType);
      flashNotice("已执行 M-");
    } catch {
      flashNotice("当前表达式无法写入内存");
    }
  };

  const copyResult = async () => {
    const payload = previewResult || expression;
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      flashNotice("已复制");
    } catch {
      flashNotice("复制失败");
    }
  };

  const onPressKey = (key: string) => {
    if (key === "=") {
      calculate();
      return;
    }
    if (key === "C") {
      clearAll();
      return;
    }
    if (key === "⌫") {
      backspace();
      return;
    }
    if (key === "%") {
      append("/100");
      return;
    }
    append(key);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isInputKey(event.key)) {
        event.preventDefault();
        onPressKey(event.key);
        return;
      }
      if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        backspace();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        clearAll();
      }
    };

    globalThis.addEventListener("keydown", onKeyDown);
    return () => {
      globalThis.removeEventListener("keydown", onKeyDown);
    };
  });

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-3xl border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">科学计算器</div>
              <p className="text-xs text-slate-500 dark:text-slate-300">高精度运算 · 历史记录 · 内存寄存器</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 dark:border-white/10 dark:bg-white/10">
              <button
                type="button"
                onClick={() => setAngleMode("deg")}
                className={`rounded-full px-3 py-1 font-semibold ${
                  angleMode === "deg"
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-600 dark:text-slate-200"
                }`}
              >
                DEG
              </button>
              <button
                type="button"
                onClick={() => setAngleMode("rad")}
                className={`rounded-full px-3 py-1 font-semibold ${
                  angleMode === "rad"
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-600 dark:text-slate-200"
                }`}
              >
                RAD
              </button>
            </div>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="min-h-0 space-y-4 rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="space-y-2 rounded-2xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/10">
            <label htmlFor="calculator-expression" className="text-xs font-semibold text-slate-500 dark:text-slate-300">
              表达式
            </label>
            <input
              id="calculator-expression"
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              placeholder="例如: sin(30)+sqrt(9)*2"
              className="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-3 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className={`font-semibold ${error ? "text-rose-500" : "text-slate-500 dark:text-slate-300"}`}>
                {error ?? "表达式有效"}
              </span>
              <span className="rounded-full bg-black/5 px-2 py-1 text-slate-600 dark:bg-white/10 dark:text-slate-200">
                M = {formatOutput(memory)}
              </span>
            </div>
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-right text-lg font-semibold text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white">
              {previewResult || "0"}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <button type="button" onClick={() => applyMemory("mc")} className="rounded-xl border border-black/10 bg-white/80 py-2 text-xs font-semibold dark:border-white/10 dark:bg-white/10">MC</button>
            <button type="button" onClick={() => applyMemory("mr")} className="rounded-xl border border-black/10 bg-white/80 py-2 text-xs font-semibold dark:border-white/10 dark:bg-white/10">MR</button>
            <button type="button" onClick={() => applyMemory("m+")} className="rounded-xl border border-black/10 bg-white/80 py-2 text-xs font-semibold dark:border-white/10 dark:bg-white/10">M+</button>
            <button type="button" onClick={() => applyMemory("m-")} className="rounded-xl border border-black/10 bg-white/80 py-2 text-xs font-semibold dark:border-white/10 dark:bg-white/10">M-</button>
            <button type="button" onClick={() => applyMemory("ms")} className="rounded-xl border border-black/10 bg-white/80 py-2 text-xs font-semibold dark:border-white/10 dark:bg-white/10">MS</button>
          </div>

          <div className="grid gap-2">
            {KEY_ROWS.map((row) => (
              <div key={row.id} className="grid grid-cols-6 gap-2">
                {row.keys.map((key) => (
                  <button
                    key={`${row.id}-${key}`}
                    type="button"
                    onClick={() => onPressKey(key)}
                    className={`h-10 rounded-xl border text-sm font-semibold transition ${
                      key === "="
                        ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        : "border-black/10 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={backspace}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            >
              <Delete className="h-3.5 w-3.5" />
              删除
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            >
              <Eraser className="h-3.5 w-3.5" />
              清空
            </button>
            <button
              type="button"
              onClick={copyResult}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            >
              <Copy className="h-3.5 w-3.5" />
              复制结果
            </button>
          </div>
        </div>

        <aside className="tool-scrollbar min-h-0 overflow-auto rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <History className="h-4 w-4" />
            计算历史
          </div>
          <div className="space-y-2">
            {history.length > 0 ? (
              history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setExpression(item.expression)}
                  className="w-full rounded-xl border border-black/10 bg-white/70 p-3 text-left text-xs text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
                >
                  <p className="truncate font-semibold">{item.expression}</p>
                  <p className="mt-1 truncate text-slate-500 dark:text-slate-300">= {item.result}</p>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-black/10 bg-white/70 p-4 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                还没有历史记录，开始一次计算吧。
              </div>
            )}
          </div>
          <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
            <p>- 支持函数：sin cos tan asin acos atan ln log sqrt</p>
            <p>- 常量：pi、e、ans、mr（内存）</p>
            <p>- 快捷键：Enter 计算，Backspace 删除，Esc 清空</p>
          </div>
        </aside>
      </section>
    </div>
  );
};
