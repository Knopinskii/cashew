import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getStats } from "../services/api/stats.api";
import { formatMoney } from "../utils/currency";
import { useWalletStore } from "../store/useWalletStore";
import PeriodSwitcher from "../components/PeriodSwitcher";
import { ErrorState, EmptyState, PlanSkeleton } from "../components/StateViews";
import type { Stats } from "../types";

export default function StatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const wallets = useWalletStore((s) => s.wallets);
  const activeWallet = useWalletStore((s) => s.activeWallet);
  const month = useWalletStore((s) => s.month);
  const year = useWalletStore((s) => s.year);
  const activeWalletObj = wallets.find((w) => w.id === activeWallet);

  // useCallback so the retry button and the effect share one loader.
  const load = useCallback(async () => {
    if (!activeWallet) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStats(activeWallet, month, year);
      setStats(data);
    } catch {
      setError("Failed to load plan");
    } finally {
      setLoading(false);
    }
  }, [activeWallet, month, year]);

  useEffect(() => {
    void load();
  }, [load]);

  // A fixed cost has no meaningful progress bar: it is either paid or it is
  // not, and a bar that jumps from empty to full teaches nothing.
  const fixed = stats.filter((s) => s.category_type === "stable");
  const varying = stats.filter((s) => s.category_type !== "stable");

  const withLimit = stats.filter((item) => (item.monthly_limit ?? 0) > 0);
  const totalLimit = withLimit.reduce(
    (sum, i) => sum + (i.monthly_limit ?? 0),
    0,
  );
  const totalSpent = withLimit.reduce((sum, i) => sum + (i.spent ?? 0), 0);
  const overallPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const overCount = withLimit.filter(
    (i) => (i.spent ?? 0) >= (i.monthly_limit ?? 0),
  ).length;

  const money = (value: number) =>
    formatMoney(value, activeWalletObj?.currency ?? "");

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-8 space-y-6">
        <h1 className="text-xl font-semibold text-stone-800">Plan</h1>

        <PeriodSwitcher />

        {loading ? (
          <PlanSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : stats.length === 0 ? (
          <EmptyState
            title="No expense categories yet"
            hint="Categories with a monthly limit show up here as progress bars."
            actionLabel="Create one in Settings"
            onAction={() => navigate("/settings")}
          />
        ) : (
          <>
            {totalLimit > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                      Spent of budget
                    </p>
                    <p className="text-2xl font-semibold text-stone-900 tabular-nums">
                      {money(totalSpent)}
                      <span className="text-base font-normal text-stone-400">
                        {" / "}
                        {money(totalLimit)}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      overallPercent >= 100 ? "text-rose-500" : "text-stone-500"
                    }`}
                  >
                    {Math.round(overallPercent)}%
                  </span>
                </div>

                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      overallPercent >= 100 ? "bg-rose-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(overallPercent, 100)}%` }}
                  />
                </div>

                {overCount > 0 && (
                  <p className="text-xs text-rose-500">
                    {overCount}{" "}
                    {overCount === 1 ? "category is" : "categories are"} at or
                    over the limit
                  </p>
                )}
              </div>
            )}

            {fixed.length > 0 && (
              <div>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2 px-1">
                  Fixed
                </p>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-stone-50">
                  {fixed.map((item) => {
                    const spent = item.spent ?? 0;
                    const limit = item.monthly_limit ?? 0;
                    const paid = spent > 0;
                    return (
                      <div
                        key={item.category_name}
                        className={`px-4 py-3.5 flex items-center gap-3 ${
                          paid ? "bg-emerald-50/60" : ""
                        }`}
                      >
                        <span
                          className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs ${
                            paid
                              ? "bg-emerald-500 text-white"
                              : "border-2 border-dashed border-stone-200 text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium truncate ${
                              paid ? "text-emerald-900" : "text-stone-800"
                            }`}
                          >
                            {item.category_name}
                          </p>
                          <p
                            className={`text-xs ${
                              paid ? "text-emerald-600" : "text-stone-400"
                            }`}
                          >
                            {paid
                              ? "paid this month"
                              : limit > 0
                                ? `not paid yet · usually ${money(limit)}`
                                : "not paid yet"}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-semibold shrink-0 tabular-nums ${
                            paid ? "text-emerald-700" : "text-stone-300"
                          }`}
                        >
                          {paid ? money(spent) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {varying.length > 0 && (
              <div>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2 px-1">
                  Varies
                </p>
                <div className="space-y-3">
                  {varying.map((item) => {
                    const spent = item.spent ?? 0;
                    const limit = item.monthly_limit ?? 0;
                    // At the limit is not "within" it: the budget is gone.
                    const isOver = limit > 0 && spent >= limit;
                    const percent =
                      limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                    const left = limit - spent;

                    return (
                      <div
                        key={item.category_name}
                        className={`rounded-2xl p-4 shadow-sm ${
                          isOver ? "bg-rose-50" : "bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-baseline gap-3 mb-2.5">
                          <span
                            className={`font-medium truncate ${
                              isOver ? "text-rose-900" : "text-stone-700"
                            }`}
                          >
                            {item.category_name}
                          </span>
                          <span
                            className={`text-sm font-semibold shrink-0 tabular-nums ${
                              isOver ? "text-rose-600" : "text-stone-700"
                            }`}
                          >
                            {money(spent)}
                            <span
                              className={`font-normal ${
                                isOver ? "text-rose-300" : "text-stone-400"
                              }`}
                            >
                              {limit > 0 ? ` / ${money(limit)}` : ""}
                            </span>
                          </span>
                        </div>

                        <div
                          className={`w-full rounded-full h-2 overflow-hidden ${
                            isOver ? "bg-rose-100" : "bg-stone-100"
                          }`}
                        >
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOver ? "bg-rose-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* "600 of 600" makes you do the subtraction; the number
                            you actually want is what is left. */}
                        <p
                          className={`text-xs mt-2 ${
                            isOver ? "text-rose-500" : "text-stone-400"
                          }`}
                        >
                          {limit === 0
                            ? "No limit set"
                            : left > 0
                              ? `${money(left)} left`
                              : left === 0
                                ? "Limit reached"
                                : `${money(-left)} over the limit`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
