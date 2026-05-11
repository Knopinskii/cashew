import type { Income, Transaction } from "../types";
import { Card } from "./ui";
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
  const totalIncome = incomes.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const totalExpenses = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-5">
        <p className="text-sm text-gray-500 mb-1">Balance</p>
        <p className="text-2xl font-semibold text-gray-900">
          {symbol} {(totalIncome - totalExpenses).toFixed(2)}
        </p>
      </Card>
      <Card className="p-5">
        <p className="text-sm text-gray-500 mb-1">Income</p>
        <p className="text-2xl font-semibold text-green-600">{symbol} {totalIncome.toFixed(2)}</p>
      </Card>
      <Card className="p-5">
        <p className="text-sm text-gray-500 mb-1">Expenses</p>
        <p className="text-2xl font-semibold text-red-500">{symbol} {totalExpenses.toFixed(2)}</p>
      </Card>
    </div>
  );
}
