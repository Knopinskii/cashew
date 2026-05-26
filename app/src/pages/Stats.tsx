import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getStats } from "../services/api/stats.api";
import type { Stats } from "../types";

export default function StatsPage() {
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getStats();
      setStats(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-xl font-semibold text-stone-800">Plan</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-stone-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stats.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-12">
            No expense categories yet
          </p>
        ) : (
          <div className="space-y-4">
            {stats.map((item) => {
              const spent = parseFloat(item.spent) || 0;
              const limit = parseFloat(item.monthly_limit) || 0;
              const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
              const isOver = spent > limit && limit > 0;

              return (
                <div key={item.category_name} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-stone-700 font-medium">{item.category_name}</span>
                    <span className={`text-sm font-medium ${isOver ? "text-rose-500" : "text-stone-500"}`}>
                      {spent.toLocaleString()} / {limit > 0 ? limit.toLocaleString() : "—"}
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
