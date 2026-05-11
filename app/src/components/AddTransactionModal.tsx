import { useEffect, useState } from "react";
import { getExpenseCategories, createExpense } from "../services/api/expense.api";
import { getIncomeCategories, createIncome } from "../services/api/income.api";
import { getWallets } from "../services/api/wallet.api";
import type { IncomeCategory, ExpenseCategory, Wallet } from "../types";

const selectClass = "border border-stone-200 rounded-2xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800";
const inputClass = "border border-stone-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";
const labelClass = "text-xs font-medium text-stone-400 uppercase tracking-wide";

export default function AddTransactionModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [formType, setFormType] = useState<"income" | "expense">("expense");
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [category, setCategory] = useState("");
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch() {
      const [exp, inc, wal] = await Promise.all([
        getExpenseCategories(),
        getIncomeCategories(),
        getWallets(),
      ]);
      setExpenseCategories(exp);
      setIncomeCategories(inc);
      setWallets(wal);
      setCategory(String(exp[0]?.id ?? ""));
      setWallet(String(wal[0]?.id ?? ""));
    }
    fetch();
  }, []);

  useEffect(() => {
    const cats = formType === "expense" ? expenseCategories : incomeCategories;
    setCategory(String(cats[0]?.id ?? ""));
  }, [formType, expenseCategories, incomeCategories]);

  async function handleSave() {
    if (!amount || !date || !category || !wallet) return;
    try {
      if (formType === "expense") {
        await createExpense({ category, amount, note, date, wallet });
      } else {
        await createIncome({ category, amount, note, date, wallet });
      }
      onSave();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  const categories = formType === "expense" ? expenseCategories : incomeCategories;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900">New Transaction</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors text-sm">×</button>
        </div>

        <div className="flex rounded-2xl bg-stone-100 p-1 gap-1">
          <button
            onClick={() => setFormType("expense")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-2xl transition-colors ${formType === "expense" ? "bg-rose-500 text-white shadow-sm" : "text-stone-400 hover:text-stone-700"}`}
          >
            Expense
          </button>
          <button
            onClick={() => setFormType("income")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-2xl transition-colors ${formType === "income" ? "bg-emerald-500 text-white shadow-sm" : "text-stone-400 hover:text-stone-700"}`}
          >
            Income
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Wallet</label>
            <select value={wallet} onChange={(e) => setWallet(e.target.value)} className={selectClass}>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Amount</label>
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className={labelClass}>Note</label>
            <input type="text" placeholder="Description" value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
          </div>
        </div>

        {error && <p className="text-xs text-rose-500 text-center">{error}</p>}

        <button
          onClick={handleSave}
          className="w-full py-3 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-2xl transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}
