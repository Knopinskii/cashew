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

  // A fixed cost with no limit set still counts as covered once it is paid,
  // so it does not drag the expected total down to nothing.
  const expectedOf = (item: Stats) =>
    (item.monthly_limit ?? 0) > 0 ? (item.monthly_limit ?? 0) : (item.spent ?? 0);

  const fixedSpent = fixed.reduce((sum, i) => sum + (i.spent ?? 0), 0);
  const fixedExpected = fixed.reduce((sum, i) => sum + expectedOf(i), 0);
  const fixedPaid = fixed.filter((i) => (i.spent ?? 0) > 0).length;

  // Only categories with a limit can be measured against one.
  const varyingWithLimit = varying.filter((i) => (i.monthly_limit ?? 0) > 0);
  const varyingSpent = varyingWithLimit.reduce((sum, i) => sum + (i.spent ?? 0), 0);
  const varyingLimit = varyingWithLimit.reduce(
    (sum, i) => sum + (i.monthly_limit ?? 0),
    0,
  );
  const varyingPercent =
    varyingLimit > 0 ? (varyingSpent / varyingLimit) * 100 : 0;
  const varyingOver = varyingWithLimit.filter(
    (i) => (i.spent ?? 0) >= (i.monthly_limit ?? 0),
  ).length;

  const totalSpent = fixedSpent + varyingSpent;
  const totalExpected = fixedExpected + varyingLimit;
  const hasSummary = fixed.length > 0 || varyingWithLimit.length > 0;

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
            {hasSummary && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                {fixed.length > 0 && (
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                      Fixed
                    </span>
                    <span className="flex items-baseline gap-3">
                      {/* A count, not a bar: for an obligation the question is
                          whether it is settled, not how full it is. */}
                      <span
                        className={`text-xs font-medium ${
                          fixedPaid === fixed.length
                            ? "text-emerald-600"
                            : "text-stone-400"
                        }`}
                      >
                        {fixedPaid}/{fixed.length} paid
                      </span>
                      <span className="text-sm text-stone-700 tabular-nums">
                        {money(fixedSpent)}
                        <span className="text-stone-400">
                          {" / "}
                          {money(fixedExpected)}
                        </span>
                      </span>
                    </span>
                  </div>
                )}

                {varyingWithLimit.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                        Varies
                      </span>
                      <span className="flex items-baseline gap-3">
                        <span
                          className={`text-xs font-semibold tabular-nums ${
                            varyingPercent >= 100
                              ? "text-rose-500"
                              : "text-stone-500"
                          }`}
                        >
                          {Math.round(varyingPercent)}%
                        </span>
                        <span className="text-sm text-stone-700 tabular-nums">
                          {money(varyingSpent)}
                          <span className="text-stone-400">
                            {" / "}
                            {money(varyingLimit)}
                          </span>
                        </span>
                      </span>
                    </div>

                    {/* The only bar on the card. This is the part the month can
                        still be steered by; everything else is already decided. */}
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          varyingPercent >= 100 ? "bg-rose-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(varyingPercent, 100)}%` }}
                      />
                    </div>

                    {varyingOver > 0 && (
                      <p className="text-xs text-rose-500">
                        {varyingOver}{" "}
                        {varyingOver === 1 ? "category is" : "categories are"} at
                        or over the limit
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-baseline justify-between gap-3 pt-3 border-t border-stone-100">
                  <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                    Total
                  </span>
                  <span className="text-base font-semibold text-stone-900 tabular-nums">
                    {money(totalSpent)}
                    <span className="text-sm font-normal text-stone-400">
                      {" / "}
                      {money(totalExpected)}
                    </span>
                  </span>
                </div>
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
