import type { Income, Transaction } from "../types";
import { getCurrencySymbol } from "../utils/currency";

export default function SummaryCards({
  incomes,
  expenses,
  currency,
}: {
  incomes: Income[];
  expenses: Transaction[];
  currency: string;
}) {
  const symbol = getCurrencySymbol(currency);

  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-amber-600 rounded-2xl p-5">
        <p className="text-xs font-medium text-amber-200 mb-2 uppercase tracking-wide">Balance</p>
        <p className="text-2xl font-semibold text-white">
          {symbol} {(totalIncome - totalExpenses).toFixed(2)}
        </p>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wide">Income</p>
        <p className="text-2xl font-semibold text-emerald-600">{symbol} {totalIncome.toFixed(2)}</p>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wide">Expenses</p>
        <p className="text-2xl font-semibold text-rose-500">{symbol} {totalExpenses.toFixed(2)}</p>
      </div>
    </div>
  );
}
