import { useMemo, useState } from "react";
import { addDays, differenceInDays, eachDayOfInterval, isWeekend } from "date-fns";
import { Calendar, CalendarDays } from "lucide-react";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const DateCalcToolPage = () => {
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState(formatDate(addDays(new Date(), 7)));
  const [baseDate, setBaseDate] = useState(formatDate(new Date()));
  const [deltaDays, setDeltaDays] = useState(3);
  const [workStart, setWorkStart] = useState(formatDate(new Date()));
  const [workEnd, setWorkEnd] = useState(formatDate(addDays(new Date(), 14)));

  const diffResult = useMemo(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return null;
    const signed = differenceInDays(end, start);
    return {
      signed,
      absolute: Math.abs(signed),
    };
  }, [startDate, endDate]);

  const addResult = useMemo(() => {
    const base = parseDate(baseDate);
    if (!base || !Number.isFinite(deltaDays)) return null;
    return addDays(base, Math.floor(deltaDays));
  }, [baseDate, deltaDays]);

  const workdayResult = useMemo(() => {
    const start = parseDate(workStart);
    const end = parseDate(workEnd);
    if (!start || !end) return null;
    const rangeStart = start < end ? start : end;
    const rangeEnd = start < end ? end : start;
    const allDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    const workdays = allDays.filter((date) => !isWeekend(date)).length;
    return {
      total: allDays.length,
      workdays,
      weekend: allDays.length - workdays,
    };
  }, [workStart, workEnd]);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Calendar className="h-4 w-4" />
            日期差
          </div>
          <div className="mt-3 space-y-3 text-xs text-slate-500 dark:text-slate-300">
            <div>
              <label>开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-black/10 bg-white/80 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
              />
            </div>
            <div>
              <label>结束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-black/10 bg-white/80 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
              />
            </div>
            <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              {diffResult ? (
                <div className="space-y-1">
                  <div>相差：{diffResult.signed} 天</div>
                  <div>绝对差：{diffResult.absolute} 天</div>
                </div>
              ) : (
                "请选择日期"
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <CalendarDays className="h-4 w-4" />
            增加天数
          </div>
          <div className="mt-3 space-y-3 text-xs text-slate-500 dark:text-slate-300">
            <div>
              <label>起始日期</label>
              <input
                type="date"
                value={baseDate}
                onChange={(event) => setBaseDate(event.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-black/10 bg-white/80 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
              />
            </div>
            <div>
              <label>天数</label>
              <input
                type="number"
                value={deltaDays}
                onChange={(event) => setDeltaDays(Number(event.target.value))}
                className="mt-2 h-10 w-full rounded-xl border border-black/10 bg-white/80 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
              />
            </div>
            <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              {addResult ? `结果日期：${formatDate(addResult)}` : "请输入合法数值"}
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <CalendarDays className="h-4 w-4" />
            工作日计算
          </div>
          <div className="mt-3 space-y-3 text-xs text-slate-500 dark:text-slate-300">
            <div>
              <label>开始日期</label>
              <input
                type="date"
                value={workStart}
                onChange={(event) => setWorkStart(event.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-black/10 bg-white/80 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
              />
            </div>
            <div>
              <label>结束日期</label>
              <input
                type="date"
                value={workEnd}
                onChange={(event) => setWorkEnd(event.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-black/10 bg-white/80 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
              />
            </div>
            <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              {workdayResult ? (
                <div className="space-y-1">
                  <div>总天数：{workdayResult.total}</div>
                  <div>工作日：{workdayResult.workdays}</div>
                  <div>周末：{workdayResult.weekend}</div>
                </div>
              ) : (
                "请选择日期"
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
