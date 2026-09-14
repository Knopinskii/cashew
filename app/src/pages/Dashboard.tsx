import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SummaryCards from "../components/SummaryCards";
import TransactionList from "../components/TransactionList";
import AddTransactionModal from "../components/AddTransactionModal";
import type { UnifiedTransaction } from "../components/TransactionList";
import type { Income, Transaction } from "../types";
import { getIncomes, deleteIncome } from "../services/api/income.api";
import { getExpenses, deleteExpense } from "../services/api/expense.api";
import { useWalletStore } from "../store/useWalletStore";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Dashboard() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UnifiedTransaction | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wallets = useWalletStore((s) => s.wallets);
  const activeWallet = useWalletStore((s) => s.activeWallet);
  const month = useWalletStore((s) => s.month);
  const year = useWalletStore((s) => s.year);
  const setMonth = useWalletStore((s) => s.setMonth);

  const activeWalletObj = wallets.find((w) => w.id === activeWallet);

  async function loadData() {
    if (!activeWallet) return;
    setLoading(true);
    setError(null);
    try {
      const [inc, exp] = await Promise.all([
        getIncomes(activeWallet, month, year),
        getExpenses(activeWallet, month, year),
      ]);
      setIncomes(inc);
      setExpenses(exp);
    } catch {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet, month, year]);

  function handleClose() {
    setOpen(false);
    setEditing(undefined);
  }

  async function handleDelete() {
    if (!editing) return;
    if (editing.type === "expense") {
      await deleteExpense(editing.id);
    } else {
      await deleteIncome(editing.id);
    }
    handleClose();
    loadData();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Month switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 shrink-0 bg-stone-100 rounded-2xl px-3 py-1.5 text-xs font-medium text-stone-500">
            Period <span className="text-stone-400">›</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none border-b border-stone-100 flex-1">
            {MONTHS.map((m, i) => {
              const isActive = i + 1 === month;
              return (
                <button
                  key={m}
                  onClick={() => setMonth(i + 1)}
                  className={`shrink-0 pb-2 text-sm transition-colors border-b-2 whitespace-nowrap ${
                    isActive
                      ? "font-semibold text-stone-800 border-amber-500"
                      : "font-normal text-stone-400 border-transparent hover:text-stone-600"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-stone-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-rose-500 text-sm text-center py-12">{error}</p>
        ) : (
          <>
            <SummaryCards
              incomes={incomes}
              expenses={expenses}
              currency={activeWalletObj?.currency ?? "EUR"}
            />
            <TransactionList
              incomes={incomes}
              expenses={expenses}
              currency={activeWalletObj?.currency ?? "EUR"}
              onEdit={(t) => {
                setEditing(t);
                setOpen(true);
              }}
            />
          </>
        )}
      </div>

      <button
        onClick={() => {
          setEditing(undefined);
          setOpen(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-colors"
      >
        +
      </button>

      {open && (
        <AddTransactionModal
          onClose={handleClose}
          onSave={loadData}
          onDelete={handleDelete}
          editing={editing}
        />
      )}
    </div>
  );
}
