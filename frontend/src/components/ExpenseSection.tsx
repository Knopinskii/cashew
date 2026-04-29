import { useEffect, useState } from "react";
import { Card } from "./ui";
import {
  createExpense,
  deleteExpense,
  getExpenseCategories,
  loadExpense,
} from "../services/api/finance.api";
import type { ExpenseCategory, Transaction } from "../types";

export default function ExpenseSection({
  onDataChange,
}: {
  onDataChange: (data: Transaction[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    async function fetch() {
      const response = await loadExpense();
      setExpenses(response.data);
      onDataChange(response.data);
    }
    fetch();
  }, [open, onDataChange]);

  useEffect(() => {
    async function fetch() {
      const response = await getExpenseCategories();
      setCategories(response.data);
      setCategory(response.data[0].id);
    }
    fetch();
  }, [open]);

  async function handleSave() {
    if (!amount || !date) {
      return;
    }
    await createExpense({ category, date, note, amount });
    setOpen(false);
  }

  async function handleDelete(id) {
    await deleteExpense(id);
    const response = await loadExpense();
    setExpenses(response.data);
    onDataChange(response.data);
  }

  return (
    <Card>
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Expenses</h2>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
          >
            <span className="text-base leading-none">+</span> Add
          </button>
        </div>
        {open && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">
                  Note
                </label>
                <input
                  type="text"
                  placeholder="Description"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
      {expenses.length === 0 ? (
        <p className="text-sm text-gray-400 px-5 py-6">No expenses yet</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {expenses.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {e.category_detail.name || "—"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{e.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-red-500">
                  -${e.amount}
                </p>
                <button
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  onClick={() => handleDelete(e.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
