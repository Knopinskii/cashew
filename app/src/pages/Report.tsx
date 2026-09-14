import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PeriodSwitcher from "../components/PeriodSwitcher";
import { ErrorState, EmptyState, PlanSkeleton } from "../components/StateViews";
import { getReport } from "../services/api/report.api";
import { getCurrencySymbol } from "../utils/currency";
import { useWalletStore } from "../store/useWalletStore";
import type { Report, ReportCategory } from "../types";

function Delta({ current, reference }: { current: number; reference: number }) {
  // No baseline means no comparison. Showing "+100%" against zero would be
  // arithmetically true and completely useless.
  if (reference === 0) {
    return <span className="text-xs text-stone-300">—</span>;
  }
  const percent = Math.round(((current - reference) / reference) * 100);
  if (percent === 0) {
    return <span className="text-xs text-stone-400">same</span>;
  }
  // Spending more is the thing worth noticing, so over is rose and under is
  // emerald — the opposite of how a stock chart would colour it.
  return (
    <span
      className={`text-xs font-medium ${
        percent > 0 ? "text-rose-500" : "text-emerald-600"
      }`}
    >
      {percent > 0 ? "+" : ""}
      {percent}%
    </span>
  );
}

function ordinal(day: number) {
  // 11th, 12th and 13th break the last-digit rule, which is why "21th" slips
  // into so many interfaces.
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  return `${day}${["th", "st", "nd", "rd"][day % 10] ?? "th"}`;
}

function Money({ value, symbol }: { value: number; symbol: string }) {
  return (
    <span className="tabular-nums">
      {symbol}
      {value.toFixed(2)}
    </span>
  );
}

function FloatingRow({
  item,
  symbol,
  total,
}: {
  item: ReportCategory;
  symbol: string;
  total: number;
}) {
  const share = total > 0 ? (item.spent / total) * 100 : 0;
  return (
    <div className="px-4 py-3.5 space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-stone-800 truncate">
          {item.name}
        </span>
        <span className="text-sm font-semibold text-stone-800 shrink-0">
          <Money value={item.spent} symbol={symbol} />
        </span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full"
          style={{ width: `${share}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-stone-400">
        <span>{share.toFixed(0)}% of spending</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            last <Money value={item.previous} symbol={symbol} />
            <Delta current={item.spent} reference={item.previous} />
          </span>
          {item.average !== null && (
            <span className="flex items-center gap-1">
              avg <Money value={item.average} symbol={symbol} />
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

function StableRow({ item, symbol }: { item: ReportCategory; symbol: string }) {
  const paid = item.spent > 0;
  return (
    <div className="px-4 py-3.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
        <p className="text-xs text-stone-400">
          {/* The previous amount is only worth showing when there is one. */}
          {paid && item.previous_full_month > 0 ? (
            <>
              paid · last month{" "}
              <Money value={item.previous_full_month} symbol={symbol} />
            </>
          ) : paid ? (
            "paid"
          ) : item.previous_full_month > 0 ? (
            <>
              not paid yet · usually{" "}
              <Money value={item.previous_full_month} symbol={symbol} />
            </>
          ) : (
            "not paid yet"
          )}
        </p>
      </div>
      <span
        className={`text-sm font-semibold shrink-0 ${
          paid ? "text-stone-800" : "text-stone-300"
        }`}
      >
        {paid ? <Money value={item.spent} symbol={symbol} /> : "—"}
      </span>
    </div>
  );
}

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wallets = useWalletStore((s) => s.wallets);
  const activeWallet = useWalletStore((s) => s.activeWallet);
  const month = useWalletStore((s) => s.month);
  const year = useWalletStore((s) => s.year);
  const activeWalletObj = wallets.find((w) => w.id === activeWallet);
  const symbol = getCurrencySymbol(activeWalletObj?.currency ?? "");

  const load = useCallback(async () => {
    if (!activeWallet) return;
    setLoading(true);
    setError(null);
    try {
      setReport(await getReport(activeWallet, month, year));
    } catch {
      setError("Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [activeWallet, month, year]);

  useEffect(() => {
    void load();
  }, [load]);

  const floating = report?.categories.filter((c) => c.category_type === "floating") ?? [];
  const stable = report?.categories.filter((c) => c.category_type === "stable") ?? [];
  const floatingTotal = floating.reduce((sum, c) => sum + c.spent, 0);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-8 space-y-6">
        <h1 className="text-xl font-semibold text-stone-800">Report</h1>

        <PeriodSwitcher />

        {loading ? (
          <PlanSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !report || report.categories.length === 0 ? (
          <EmptyState
            title="Nothing to report yet"
            hint="Record some expenses and this page will compare them against earlier months."
          />
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                    Spent
                    {report.period.partial &&
                      ` · to the ${ordinal(report.period.cutoff_day)}`}
                  </p>
                  <p className="text-2xl font-semibold text-stone-900 tabular-nums">
                    <Money value={report.totals.spent} symbol={symbol} />
                  </p>
                </div>
                <Delta
                  current={report.totals.spent}
                  reference={report.totals.previous}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-sm">
                <div>
                  <p className="text-xs text-stone-400">Same days last month</p>
                  <p className="text-stone-700">
                    <Money value={report.totals.previous} symbol={symbol} />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">
                    Average of {report.totals.compared_months}{" "}
                    {report.totals.compared_months === 1 ? "month" : "months"}
                  </p>
                  <p className="text-stone-700">
                    {report.totals.average === null ? (
                      <span className="text-stone-300">no history yet</span>
                    ) : (
                      <Money value={report.totals.average} symbol={symbol} />
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Per day</p>
                  <p className="text-stone-700">
                    <Money value={report.totals.daily_average} symbol={symbol} />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">
                    {report.period.partial ? "At this pace" : "Month total"}
                  </p>
                  <p className="text-stone-700">
                    <Money value={report.totals.projected} symbol={symbol} />
                  </p>
                </div>
              </div>
            </div>

            {stable.length > 0 && (
              <div>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2 px-1">
                  Fixed
                </p>
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-stone-50">
                  {stable.map((item) => (
                    <StableRow key={item.id} item={item} symbol={symbol} />
                  ))}
                </div>
              </div>
            )}

            {floating.length > 0 && (
              <div>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2 px-1">
                  Varies
                </p>
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-stone-50">
                  {floating.map((item) => (
                    <FloatingRow
                      key={item.id}
                      item={item}
                      symbol={symbol}
                      total={floatingTotal}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
