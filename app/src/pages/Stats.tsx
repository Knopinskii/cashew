import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getStats } from "../services/api/stats.api";
import { getCurrencySymbol } from "../utils/currency";
import { useWalletStore } from "../store/useWalletStore";
import PeriodSwitcher from "../components/PeriodSwitcher";
import type { Stats } from "../types";

export default function StatsPage() {
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const wallets = useWalletStore((s) => s.wallets);
  const activeWallet = useWalletStore((s) => s.activeWallet);
  const month = useWalletStore((s) => s.month);
  const year = useWalletStore((s) => s.year);
  const activeWalletObj = wallets.find((w) => w.id === activeWallet);

  useEffect(() => {
    // Narrowed into a local, and load is an arrow function rather than a
    // declaration: TypeScript will not carry a null check into a hoisted
    // function, since that function could be called before the check runs.
    const walletId = activeWallet;
    if (!walletId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStats(walletId, month, year);
        setStats(data);
      } catch {
        setError("Failed to load plan");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [activeWallet, month, year]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-stone-800">Plan</h1>
          {activeWalletObj && (
            <span className="text-sm text-stone-400">{activeWalletObj.name} · {activeWalletObj.currency}</span>
          )}
        </div>

        <PeriodSwitcher />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-stone-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-rose-500 text-sm text-center py-12">{error}</p>
        ) : stats.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-12">
            No expense categories yet
          </p>
        ) : (
          <div className="space-y-4">
            {stats.map((item) => {
              const spent = item.spent ?? 0;
              const limit = item.monthly_limit ?? 0;
              const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
              const isOver = spent > limit && limit > 0;
              const currency = getCurrencySymbol(activeWalletObj?.currency ?? "");

              return (
                <div key={item.category_name} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-stone-700 font-medium">{item.category_name}</span>
                    <span className={`text-sm font-medium ${isOver ? "text-rose-500" : "text-stone-500"}`}>
                      {currency}{spent.toLocaleString()} / {limit > 0 ? `${currency}${limit.toLocaleString()}` : "—"}
                    </span>
                  </div>

                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${isOver ? "bg-rose-500" : "bg-amber-500"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {limit === 0 && (
                    <p className="text-xs text-stone-400 mt-2">No limit set</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
