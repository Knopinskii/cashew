import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getStats } from "../services/api/stats.api";
import { getCurrencySymbol } from "../utils/currency";
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
  const currency = getCurrencySymbol(activeWalletObj?.currency ?? "");

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
            {fixed.length > 0 && (
              <div>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2 px-1">
                  Fixed
                </p>
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-stone-50">
                  {fixed.map((item) => {
                    const spent = item.spent ?? 0;
                    const limit = item.monthly_limit ?? 0;
                    const paid = spent > 0;
                    return (
                      <div
                        key={item.category_name}
                        className="px-4 py-3.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">
                            {item.category_name}
                          </p>
                          <p
                            className={`text-xs ${
                              paid ? "text-emerald-600" : "text-stone-400"
                            }`}
                          >
                            {paid
                              ? "paid"
                              : limit > 0
                                ? `not paid yet · usually ${currency}${limit.toLocaleString()}`
                                : "not paid yet"}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-semibold shrink-0 tabular-nums ${
                            paid ? "text-stone-800" : "text-stone-300"
                          }`}
                        >
                          {paid ? `${currency}${spent.toLocaleString()}` : "—"}
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
                <div className="space-y-4">
                  {varying.map((item) => {
                    const spent = item.spent ?? 0;
                    const limit = item.monthly_limit ?? 0;
                    const percent =
                      limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                    const isOver = spent > limit && limit > 0;

                    return (
                      <div
                        key={item.category_name}
                        className="bg-white rounded-2xl p-5 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-stone-700 font-medium">
                            {item.category_name}
                          </span>
                          <span
                            className={`text-sm font-medium tabular-nums ${
                              isOver ? "text-rose-500" : "text-stone-500"
                            }`}
                          >
                            {currency}
                            {spent.toLocaleString()} /{" "}
                            {limit > 0
                              ? `${currency}${limit.toLocaleString()}`
                              : "—"}
                          </span>
                        </div>

                        <div className="w-full bg-stone-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOver ? "bg-rose-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {limit === 0 && (
                          <p className="text-xs text-stone-400 mt-2">
                            No limit set
                          </p>
                        )}
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
