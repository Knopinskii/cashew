import { useEffect, useState } from "react";
import { getExpenseCategories, createExpense } from "../services/api/expense.api";
import { getIncomeCategories, createIncome } from "../services/api/income.api";
import { getWallets } from "../services/api/wallet.api";
import type { IncomeCategory, ExpenseCategory, Wallet } from "../types";

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
    if (formType === "expense") {
      await createExpense({ category, amount, note, date, wallet });
    } else {
      await createIncome({ category, amount, note, date, wallet });
    }
    onSave();
    onClose();
  }

  const categories = formType === "expense" ? expenseCategories : incomeCategories;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex rounded-lg border border-gray-200 p-1 gap-1">
          <button onClick={() => setFormType("expense")} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formType === "expense" ? "bg-red-500 text-white" : "text-gray-500 hover:text-gray-900"}`}>
            Expense
          </button>
          <button onClick={() => setFormType("income")} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formType === "income" ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-900"}`}>
            Income
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Wallet</label>
            <select value={wallet} onChange={(e) => setWallet(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Amount</label>
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Note</label>
            <input type="text" placeholder="Description" value={note} onChange={(e) => setNote(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <button onClick={handleSave} className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}
