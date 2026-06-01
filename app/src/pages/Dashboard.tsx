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

export default function Dashboard() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UnifiedTransaction | undefined>();
  const [loading, setLoading] = useState(true);

  const wallets = useWalletStore((s) => s.wallets);
  const activeWallet = useWalletStore((s) => s.activeWallet);

  const activeWalletObj = wallets.find((w) => w.id === activeWallet);

  async function loadData() {
    if (!activeWallet) return;
    setLoading(true);
    const [inc, exp] = await Promise.all([
      getIncomes(activeWallet),
      getExpenses(activeWallet),
    ]);
    setIncomes(inc);
    setExpenses(exp);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet]);

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
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-stone-300 border-t-transparent rounded-full animate-spin" />
          </div>
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
