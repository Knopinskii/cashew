import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SummaryCards from "../components/SummaryCards";
import TransactionList from "../components/TransactionList";
import AddTransactionModal from "../components/AddTransactionModal";
import type { Income, Transaction, Wallet } from "../types";
import { getIncomes } from "../services/api/income.api";
import { getExpenses } from "../services/api/expense.api";
import { getWallets } from "../services/api/wallet.api";

export default function Dashboard() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [inc, exp, wal] = await Promise.all([getIncomes(), getExpenses(), getWallets()]);
    setIncomes(inc);
    setExpenses(exp);
    setWallets(wal);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <SummaryCards incomes={incomes} expenses={expenses} currency={wallets[0]?.currency ?? "EUR"} />
            <TransactionList incomes={incomes} expenses={expenses} currency={wallets[0]?.currency ?? "EUR"} />
          </>
        )}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-colors"
      >
        +
      </button>

      {open && <AddTransactionModal onClose={() => setOpen(false)} onSave={loadData} />}
    </div>
  );
}
