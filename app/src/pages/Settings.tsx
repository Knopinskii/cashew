import { Card } from "../components/ui";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { getMe } from "../services/api/auth.api";
import {
  createWallet,
  deleteWallet,
  getWallets,
} from "../services/api/wallet.api";
import {
  createExpenseCategory,
  deleteExpenseCategory,
  getExpenseCategories,
} from "../services/api/expense.api";
import {
  createIncomeCategory,
  deleteIncomeCategory,
  getIncomeCategories,
} from "../services/api/income.api";
import type { Wallet, ExpenseCategory, IncomeCategory } from "../types";

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

export default function Settings() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [walletCurrency, setWalletCurrency] = useState("EUR");

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    []
  );
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseLimit, setExpenseLimit] = useState("");

  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>(
    []
  );
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [incomeName, setIncomeName] = useState("");

  useEffect(() => {
    async function fetch() {
      const user = await getMe();
      setEmail(user.email);
      setUsername(user.username);
    }
    fetch();
  }, []);

  useEffect(() => {
    async function fetch() {
      setWallets(await getWallets());
      setExpenseCategories(await getExpenseCategories());
      setIncomeCategories(await getIncomeCategories());
    }
    fetch();
  }, []);

  // Wallet handlers
  async function handleCreateWallet() {
    if (!walletName) return;
    await createWallet({ name: walletName, currency: walletCurrency });
    setWallets(await getWallets());
    setWalletName("");
    setWalletCurrency("EUR");
    setWalletOpen(false);
  }

  async function handleDeleteWallet(id: string) {
    await deleteWallet(id);
    setWallets(await getWallets());
  }

  // Expense category handlers
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

  // Income category handlers
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* User Info */}
        <Card>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{username}</p>
              <p className="text-xs text-gray-400">{email}</p>
            </div>
          </div>
        </Card>

        {/* Wallets */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Wallets</h2>
              <button
                onClick={() => setWalletOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <span className="text-base leading-none">+</span> Add
              </button>
            </div>
            {walletOpen && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cash"
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">
                      Currency
                    </label>
                    <select
                      value={walletCurrency}
                      onChange={(e) => setWalletCurrency(e.target.value)}
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateWallet}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
          {wallets.length === 0 ? (
            <p className="text-sm text-gray-400 px-5 py-6">No wallets yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {wallets.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {w.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{w.currency}</p>
                  </div>
                  <button
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
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
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Expense Categories
              </h2>
              <button
                onClick={() => setExpenseOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
              >
                <span className="text-base leading-none">+</span> Add
              </button>
            </div>
            {expenseOpen && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Food"
                      value={expenseName}
                      onChange={(e) => setExpenseName(e.target.value)}
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">
                      Monthly limit
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={expenseLimit}
                      onChange={(e) => setExpenseLimit(e.target.value)}
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setExpenseOpen(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateExpenseCategory}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
          {expenseCategories.length === 0 ? (
            <p className="text-sm text-gray-400 px-5 py-6">No categories yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {expenseCategories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {c.name}
                    </p>
                    {c.monthly_limit && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Limit: {c.monthly_limit}
                      </p>
                    )}
                  </div>
                  <button
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    onClick={() => handleDeleteExpenseCategory(String(c.id))}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Income Categories */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Income Categories
              </h2>
              <button
                onClick={() => setIncomeOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                <span className="text-base leading-none">+</span> Add
              </button>
            </div>
            {incomeOpen && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Salary"
                    value={incomeName}
                    onChange={(e) => setIncomeName(e.target.value)}
                    className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIncomeOpen(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateIncomeCategory}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
          {incomeCategories.length === 0 ? (
            <p className="text-sm text-gray-400 px-5 py-6">No categories yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {incomeCategories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <button
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    onClick={() => handleDeleteIncomeCategory(String(c.id))}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
