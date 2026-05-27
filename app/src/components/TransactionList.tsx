import type { Income, Transaction } from "../types";
import { getCurrencySymbol } from "../utils/currency";

export type UnifiedTransaction = {
  id: string;
  type: "income" | "expense";
  category: string;
  categoryName: string;
  amount: string;
  date: string;
  note: string;
  wallet: string;
};

function toUnified(incomes: Income[], expenses: Transaction[]): UnifiedTransaction[] {
  const inc = incomes.map((i) => ({
    id: String(i.id),
    type: "income" as const,
    category: i.category,
    categoryName: i.category_detail.name,
    amount: i.amount,
    date: i.date,
    note: i.note,
    wallet: i.wallet,
  }));
  const exp = expenses.map((e) => ({
    id: String(e.id),
    type: "expense" as const,
    category: e.category,
    categoryName: e.category_detail.name,
    amount: e.amount,
    date: e.date,
    note: e.note,
    wallet: e.wallet,
  }));
  return [...inc, ...exp].sort((a, b) => b.date.localeCompare(a.date));
}

function groupByDate(items: UnifiedTransaction[]) {
  return items.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, UnifiedTransaction[]>);
}

export default function TransactionList({
  incomes,
  expenses,
  currency,
  onEdit,
}: {
  incomes: Income[];
  expenses: Transaction[];
  currency: string;
  onEdit: (transaction: UnifiedTransaction) => void;
}) {
  const symbol = getCurrencySymbol(currency);
  const unified = toUnified(incomes, expenses);
  const grouped = groupByDate(unified);

  if (unified.length === 0) {
    return <p className="text-sm text-stone-400 text-center py-12">No transactions yet</p>;
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">
              {new Date(date).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
            </p>
            <p className="text-xs text-stone-400">
              {items
                .reduce((sum, i) => i.type === "expense" ? sum - parseFloat(i.amount) : sum + parseFloat(i.amount), 0)
                .toFixed(2)} {symbol}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-stone-50">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => onEdit(item)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-stone-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div>
                  <p className="text-sm font-medium text-stone-800">{item.categoryName}</p>
                  {item.note && <p className="text-xs text-stone-400 mt-0.5">{item.note}</p>}
                </div>
                <p className={`text-sm font-semibold ${item.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                  {item.type === "income" ? "+" : "-"}{symbol}{item.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
