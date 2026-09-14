import { Card } from "../components/ui";
import Navbar from "../components/Navbar";
import { useCallback, useEffect, useState } from "react";
import { getMe } from "../services/api/auth.api";
import {
  createWallet,
  deleteWallet,
  getWallets,
} from "../services/api/wallet.api";
import { useWalletStore } from "../store/useWalletStore";
import {
  createExpenseCategory,
  deleteExpenseCategory,
  getExpenseCategories,
  updateExpenseCategory,
} from "../services/api/expense.api";
import {
  createIncomeCategory,
  deleteIncomeCategory,
  getIncomeCategories,
} from "../services/api/income.api";
import type { Wallet, ExpenseCategory, IncomeCategory } from "../types";
import { getCurrencySymbol } from "../utils/currency";
import { ErrorState, SettingsSkeleton } from "../components/StateViews";

const PencilIcon = () => (
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
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
);

const inputClass =
  "border border-stone-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-full";
const labelClass = "text-xs font-medium text-stone-400 uppercase tracking-wide";

export default function Settings() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const storeWallets = useWalletStore((s) => s.wallets);
  const setStoreWallets = useWalletStore((s) => s.setWallets);
  const activeWallet = useWalletStore((s) => s.activeWallet);
  const activeWalletObj = storeWallets.find((w) => w.id === activeWallet);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [walletCurrency, setWalletCurrency] = useState("EUR");

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    [],
  );
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseLimit, setExpenseLimit] = useState("");

  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [editingLimitValue, setEditingLimitValue] = useState("");

  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>(
    [],
  );
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [incomeName, setIncomeName] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // One loader for the whole page: without it a failed request looked exactly
  // like empty data, and "No wallets yet" invited the user to recreate what
  // was already there. Requests run in parallel — they do not depend on each
  // other, and three sequential awaits made the page three round trips slow.
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [user, walletList, expense, income] = await Promise.all([
        getMe(),
        getWallets(),
        getExpenseCategories(),
        getIncomeCategories(),
      ]);
      setEmail(user.email);
      setUsername(user.username);
      setWallets(walletList);
      setExpenseCategories(expense);
      setIncomeCategories(income);
    } catch {
      setLoadError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreateWallet() {
    if (!walletName) return;
    await createWallet({ name: walletName, currency: walletCurrency });
    const updated = await getWallets();
    setWallets(updated);
    setStoreWallets(updated);
    setWalletName("");
    setWalletCurrency("EUR");
    setWalletOpen(false);
  }

  async function handleDeleteWallet(id: string) {
    await deleteWallet(id);
    const updated = await getWallets();
    setWallets(updated);
    setStoreWallets(updated);
  }

  async function handleCreateExpenseCategory() {
    if (!expenseName) return;
    await createExpenseCategory(expenseName, expenseLimit || undefined);
    setExpenseCategories(await getExpenseCategories());
    setExpenseName("");
    setExpenseLimit("");
    setExpenseOpen(false);
  }

  async function handleDeleteExpenseCategory(id: string) {
    await deleteExpenseCategory(id);
    setExpenseCategories(await getExpenseCategories());
  }

  function startEditingLimit(c: ExpenseCategory) {
    setEditingLimitId(String(c.id));
    setEditingLimitValue(c.monthly_limit ?? "");
  }

  async function handleSaveLimit(id: string) {
    await updateExpenseCategory(id, editingLimitValue || null);
    setExpenseCategories(await getExpenseCategories());
    setEditingLimitId(null);
  }

  function handleCancelLimit() {
    setEditingLimitId(null);
    setEditingLimitValue("");
  }

  async function handleCreateIncomeCategory() {
    if (!incomeName) return;
    await createIncomeCategory(incomeName);
    setIncomeCategories(await getIncomeCategories());
    setIncomeName("");
    setIncomeOpen(false);
  }

  async function handleDeleteIncomeCategory(id: string) {
    await deleteIncomeCategory(id);
    setIncomeCategories(await getIncomeCategories());
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-8 space-y-4">
        {loading ? (
          <SettingsSkeleton />
        ) : loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : (
          <>
            {/* User Info */}
            <Card>
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-semibold text-sm">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {username}
                  </p>
                  <p className="text-xs text-stone-400">{email}</p>
                </div>
              </div>
            </Card>

            {/* Wallets */}
            <Card>
              <div className="px-5 py-4 border-b border-stone-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-stone-900">
                    Wallets
                  </h2>
                  <button
                    onClick={() => setWalletOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors"
                  >
                    + Add
                  </button>
                </div>
                {walletOpen && (
                  <div className="mt-4 p-4 bg-stone-50 rounded-2xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Cash"
                          value={walletName}
                          onChange={(e) => setWalletName(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Currency</label>
                        <select
                          value={walletCurrency}
                          onChange={(e) => setWalletCurrency(e.target.value)}
                          className={inputClass}
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="RUB">RUB</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setWalletOpen(false)}
                        className="px-4 py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateWallet}
                        className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-2xl transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {wallets.length === 0 ? (
                <p className="text-sm text-stone-300 px-5 py-6">
                  No wallets yet
                </p>
              ) : (
                <div className="divide-y divide-stone-50">
                  {wallets.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between px-5 py-3.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-amber-600">
                          {w.name}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {w.currency}
                        </p>
                      </div>
                      <button
                        className="p-1.5 text-stone-300 hover:text-amber-500 hover:bg-amber-50 rounded-2xl transition-colors"
                        onClick={() => handleDeleteWallet(w.id)}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Expense Categories */}
            <Card>
              <div className="px-5 py-4 border-b border-stone-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-stone-900">
                    Expense Categories
                  </h2>
                  <button
                    onClick={() => setExpenseOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-2xl transition-colors"
                  >
                    + Add
                  </button>
                </div>
                {expenseOpen && (
                  <div className="mt-4 p-4 bg-stone-50 rounded-2xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Food"
                          value={expenseName}
                          onChange={(e) => setExpenseName(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Monthly limit</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={expenseLimit}
                          onChange={(e) => setExpenseLimit(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setExpenseOpen(false)}
                        className="px-4 py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateExpenseCategory}
                        className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-2xl transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {expenseCategories.length === 0 ? (
                <p className="text-sm text-stone-300 px-5 py-6">
                  No categories yet
                </p>
              ) : (
                <div className="divide-y divide-stone-50">
                  {expenseCategories.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between px-5 py-3.5"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-amber-600">
                          {c.name}
                        </p>
                        {editingLimitId === String(c.id) ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              autoFocus
                              value={editingLimitValue}
                              onChange={(e) =>
                                setEditingLimitValue(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleSaveLimit(String(c.id));
                                if (e.key === "Escape") handleCancelLimit();
                              }}
                              onBlur={() => handleSaveLimit(String(c.id))}
                              placeholder="0.00"
                              className="w-28 border border-amber-300 rounded-xl px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <button
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={handleCancelLimit}
                              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-stone-400 mt-0.5">
                            {c.monthly_limit
                              ? `Limit: ${getCurrencySymbol(activeWalletObj?.currency ?? "")}${c.monthly_limit}`
                              : "No limit"}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          className="p-1.5 text-stone-300 hover:text-amber-500 hover:bg-amber-50 rounded-2xl transition-colors"
                          onClick={() => startEditingLimit(c)}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          className="p-1.5 text-stone-300 hover:text-amber-500 hover:bg-amber-50 rounded-2xl transition-colors"
                          onClick={() =>
                            handleDeleteExpenseCategory(String(c.id))
                          }
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Income Categories */}
            <Card>
              <div className="px-5 py-4 border-b border-stone-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-stone-900">
                    Income Categories
                  </h2>
                  <button
                    onClick={() => setIncomeOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors"
                  >
                    + Add
                  </button>
                </div>
                {incomeOpen && (
                  <div className="mt-4 p-4 bg-stone-50 rounded-2xl space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Salary"
                        value={incomeName}
                        onChange={(e) => setIncomeName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIncomeOpen(false)}
                        className="px-4 py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateIncomeCategory}
                        className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-2xl transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {incomeCategories.length === 0 ? (
                <p className="text-sm text-stone-300 px-5 py-6">
                  No categories yet
                </p>
              ) : (
                <div className="divide-y divide-stone-50">
                  {incomeCategories.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between px-5 py-3.5"
                    >
                      <p className="text-sm font-medium text-amber-600">
                        {c.name}
                      </p>
                      <button
                        className="p-1.5 text-stone-300 hover:text-amber-500 hover:bg-amber-50 rounded-2xl transition-colors"
                        onClick={() => handleDeleteIncomeCategory(String(c.id))}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
