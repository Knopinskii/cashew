import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getIncomes, getTransactions } from "../services/api";
import { Button, Card } from "../components/ui";
import type { Income, Transaction } from "../types";

export default function Dashboard() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { logout } = useAuth();

  useEffect(() => {
    getIncomes().then(setIncomes);
    getTransactions().then(setTransactions);
  }, []);

  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const totalExpenses = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Cashew</h1>
        <Button variant="secondary" onClick={logout}>Logout</Button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-5">
            <p className="text-sm text-gray-500 mb-1">Balance</p>
            <p className={`text-2xl font-semibold ${balance >= 0 ? "text-gray-900" : "text-red-500"}`}>
              ${balance.toFixed(2)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-500 mb-1">Income</p>
            <p className="text-2xl font-semibold text-green-600">${totalIncome.toFixed(2)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-500 mb-1">Expenses</p>
            <p className="text-2xl font-semibold text-red-500">${totalExpenses.toFixed(2)}</p>
          </Card>
        </div>

        {/* Incomes */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Incomes</h2>
          </div>
          {incomes.length === 0 ? (
            <p className="text-sm text-gray-400 px-5 py-6">No incomes yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((i) => (
                  <tr key={i.id} className="border-t border-gray-50">
                    <td className="px-5 py-3 text-gray-500">{i.date}</td>
                    <td className="px-5 py-3 font-medium text-green-600">+${i.amount}</td>
                    <td className="px-5 py-3 text-gray-500">{i.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Transactions */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Transactions</h2>
          </div>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-400 px-5 py-6">No transactions yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-gray-50">
                    <td className="px-5 py-3 text-gray-500">{t.date}</td>
                    <td className="px-5 py-3 font-medium text-red-500">-${t.amount}</td>
                    <td className="px-5 py-3 text-gray-500">{t.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
