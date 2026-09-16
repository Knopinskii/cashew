import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getExpenseCategories,
  createExpense,
  updateExpense,
  updateExpenseCategory,
} from "../services/api/expense.api";
import {
  getIncomeCategories,
  createIncome,
  updateIncome,
} from "../services/api/income.api";
import type { IncomeCategory, ExpenseCategory } from "../types";
import type { UnifiedTransaction } from "./TransactionList";
import { getCurrencySymbol } from "../utils/currency";
import { describeError } from "../services/api/errors";
import { useWalletStore } from "../store/useWalletStore";

const selectClass =
  "border border-stone-200 rounded-2xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800";
const inputClass =
  "border border-stone-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";
const labelClass = "text-xs font-medium text-stone-400 uppercase tracking-wide";

export default function AddTransactionModal({
  onClose,
  onSave,
  onDelete,
  editing,
}: {
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
  editing?: UnifiedTransaction;
}) {
  const navigate = useNavigate();
  const wallets = useWalletStore((s) => s.wallets);
  const activeWallet = useWalletStore((s) => s.activeWallet);

  const [formType, setFormType] = useState<"income" | "expense">(
    editing?.type ?? "expense",
  );
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    [],
  );
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>(
    [],
  );
  const [category, setCategory] = useState(editing?.category ?? "");
  const [wallet, setWallet] = useState(editing?.wallet ?? activeWallet ?? "");
  const [amount, setAmount] = useState(editing?.amount ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [date, setDate] = useState(
    editing?.date ?? new Date().toISOString().split("T")[0],
  );
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [unlockAmount, setUnlockAmount] = useState(false);
  const [syncUsualAmount, setSyncUsualAmount] = useState(false);
  // Remembers what a fixed category filled in, so moving away can clear that
  // without throwing away a figure the user typed themselves. A ref rather
  // than state: it is only ever read inside the effect that writes it, and as
  // state it would have to be a dependency of its own updater.
  const autofilled = useRef<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [exp, inc] = await Promise.all([
        getExpenseCategories(),
        getIncomeCategories(),
      ]);
      setExpenseCategories(exp);
      setIncomeCategories(inc);
      if (!editing) {
        setCategory(String(exp[0]?.id ?? ""));
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editing) return;
    const cats = formType === "expense" ? expenseCategories : incomeCategories;
    setCategory(String(cats[0]?.id ?? ""));
  }, [formType, expenseCategories, incomeCategories]);

  async function handleSave() {
    // Returning quietly made the button look broken: you press Save, nothing
    // moves, and nothing explains why.
    if (!wallet) return setError("Create a wallet in Settings first.");
    if (!category)
      return setError(`Create an ${formType} category in Settings first.`);
    if (!amount) return setError("Enter an amount.");
    if (!date) return setError("Pick a date.");

    try {
      if (editing) {
        if (formType === "expense") {
          await updateExpense(editing.id, {
            category,
            amount,
            note,
            date,
            wallet,
          });
        } else {
          await updateIncome(editing.id, {
            category,
            amount,
            note,
            date,
            wallet,
          });
        }
      } else {
        if (formType === "expense") {
          await createExpense({ category, amount, note, date, wallet });
        } else {
          await createIncome({ category, amount, note, date, wallet });
        }
      }
      // Two different intentions, made explicit rather than guessed: an
      // unusual month leaves the category alone, a permanent change updates it.
      if (unlockedFixed && syncUsualAmount) {
        await updateExpenseCategory(String(unlockedFixed.id), amount);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(describeError(err, "Could not save. Please try again."));
    }
  }

  const categories =
    formType === "expense" ? expenseCategories : incomeCategories;

  // A fixed cost has one amount by definition, so typing it every month is
  // busywork and an invitation to typos. Its limit doubles as the usual figure.
  const fixedCategory =
    formType === "expense"
      ? expenseCategories.find(
          (c) =>
            String(c.id) === String(category) &&
            c.category_type === "stable" &&
            Number(c.monthly_limit ?? 0) > 0,
        )
      : undefined;
  const amountIsFixed = Boolean(fixedCategory) && !unlockAmount;
  // Kept after unlocking so the checkbox knows which category to write back to.
  const unlockedFixed =
    unlockAmount && formType === "expense"
      ? expenseCategories.find(
          (c) =>
            String(c.id) === String(category) && c.category_type === "stable",
        )
      : undefined;

  useEffect(() => {
    // Editing an existing record must never have its amount rewritten: open a
    // €444 payment against a €920 category and the modal would show 920, then
    // save it.
    if (editing) return;

    if (fixedCategory && !unlockAmount) {
      const usual = String(fixedCategory.monthly_limit);
      setAmount(usual);
      autofilled.current = usual;
      return;
    }

    // The selection no longer dictates an amount — expense to income, or a
    // fixed category to a varying one. Whatever the old one filled in has to
    // go, or rent at 918 is recorded as groceries. Only the autofilled figure
    // is dropped; a typed one survives.
    // Read the ref into a local first. setAmount's updater runs later, during
    // the next render, and by then the line below would already have cleared
    // the ref — so the comparison would be against null and the stale amount
    // would survive.
    const filled = autofilled.current;
    autofilled.current = null;
    setAmount((current) => (current === filled ? "" : current));
  }, [fixedCategory, unlockAmount, editing]);

  useEffect(() => {
    // A <select> whose value matches no option renders the first one, so a
    // stale id shows a plausible wallet and submits a dead one. Keep the two
    // in step rather than trusting them to agree.
    if (wallets.length === 0) return;
    if (!wallets.some((w) => String(w.id) === String(wallet))) {
      setWallet(String(wallets[0].id));
    }
  }, [wallets, wallet]);

  useEffect(() => {
    if (editing) return;
    // An unlocked amount belongs to the category it was unlocked for. Carrying
    // the unlock across a change of category would leave the "update the usual
    // amount" checkbox pointing at a different category than the figure was
    // typed for, and tick it into writing that figure there.
    setUnlockAmount(false);
    setSyncUsualAmount(false);
  }, [category, formType, editing]);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900">
            {editing ? "Edit Transaction" : "New Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors text-sm"
          >
            ×
          </button>
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
            {wallets.length === 0 ? (
              // An empty dropdown offers nothing and explains nothing.
              <button
                onClick={() => navigate("/settings")}
                className={`${selectClass} text-left text-amber-700 bg-amber-50 border-amber-200`}
              >
                None yet — create one →
              </button>
            ) : (
              <select
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className={selectClass}
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Category</label>
            {categories.length === 0 ? (
              <button
                onClick={() => navigate("/settings")}
                className={`${selectClass} text-left text-amber-700 bg-amber-50 border-amber-200`}
              >
                None yet — create one →
              </button>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectClass}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              Amount
              {amountIsFixed && (
                <button
                  onClick={() => setUnlockAmount(true)}
                  className="ml-2 normal-case tracking-normal text-amber-600 hover:text-amber-700 transition-colors"
                >
                  change
                </button>
              )}
            </label>
            {amountIsFixed ? (
              // Read-only rather than absent: seeing what will be saved beats
              // trusting that it is right. "change" is there because rent does
              // move — indexation, a month with extra utilities — and a form
              // that cannot record reality is worse than one that asks.
              <div className="border border-stone-200 bg-stone-50 rounded-2xl px-3 py-2 text-sm text-stone-500 tabular-nums">
                {getCurrencySymbol(
                  wallets.find((w) => w.id === wallet)?.currency ?? "",
                )}
                {amount}
                <span className="text-xs text-stone-400"> · fixed</span>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                  {getCurrencySymbol(
                    wallets.find((w) => w.id === wallet)?.currency ?? "",
                  )}
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${inputClass} pl-7 w-full`}
                />
              </div>
            )}
            {unlockedFixed && (
              <label className="flex items-start gap-2 text-xs text-stone-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncUsualAmount}
                  onChange={(e) => setSyncUsualAmount(e.target.checked)}
                  className="mt-0.5 accent-amber-600"
                />
                <span>
                  Also update the usual amount for {unlockedFixed.name}
                </span>
              </label>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className={labelClass}>Note</label>
            <input
              type="text"
              placeholder="Description"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-500 text-center whitespace-pre-line">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          {editing && onDelete && (
            <button
              onClick={() =>
                confirmDelete ? onDelete() : setConfirmDelete(true)
              }
              className={`flex-1 py-3 text-sm font-medium rounded-2xl transition-colors ${
                confirmDelete
                  ? "text-white bg-rose-500 hover:bg-rose-600"
                  : "text-rose-500 bg-rose-50 hover:bg-rose-100"
              }`}
            >
              {confirmDelete ? "Tap again to delete" : "Delete"}
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 py-3 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-2xl transition-colors"
          >
            {editing ? "Save changes" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
