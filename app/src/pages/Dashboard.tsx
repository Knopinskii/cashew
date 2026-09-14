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
import PeriodSwitcher from "../components/PeriodSwitcher";
import {
  ErrorState,
  EmptyState,
  SummaryCardsSkeleton,
  TransactionListSkeleton,
} from "../components/StateViews";

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

  const activeWalletObj = wallets.find((w) => w.id === activeWallet);

  const now = new Date();
  const isCurrentMonth =
    month === now.getMonth() + 1 && year === now.getFullYear();

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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-8 space-y-6">
        <PeriodSwitcher />

        {loading ? (
          <>
            <SummaryCardsSkeleton />
            <TransactionListSkeleton />
          </>
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : (
          <>
            <SummaryCards
              incomes={incomes}
              expenses={expenses}
              currency={activeWalletObj?.currency ?? "EUR"}
            />
            {incomes.length === 0 && expenses.length === 0 ? (
              <EmptyState
                title="Nothing recorded this month"
                hint={
                  isCurrentMonth
                    ? "Add an expense or income to see it here."
                    : undefined
                }
                // The modal dates new records today, so adding one from a past
                // month would file it under the current one and leave this
                // screen just as empty. Nothing to offer here.
                actionLabel={isCurrentMonth ? "Add the first one" : undefined}
                onAction={
                  isCurrentMonth
                    ? () => {
                        setEditing(undefined);
                        setOpen(true);
                      }
                    : undefined
                }
              />
            ) : (
              <TransactionList
                incomes={incomes}
                expenses={expenses}
                currency={activeWalletObj?.currency ?? "EUR"}
                onEdit={(t) => {
                  setEditing(t);
                  setOpen(true);
                }}
              />
            )}
          </>
        )}
      </div>

      <button
        onClick={() => {
          setEditing(undefined);
          setOpen(true);
        }}
        className="fixed bottom-24 md:bottom-8 right-5 md:right-8 z-40 w-14 h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-colors"
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
