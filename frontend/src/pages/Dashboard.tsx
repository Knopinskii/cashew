import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/ui";
import { useEffect, useState } from "react";
import {
  createIncome,
  getIncomeCategories,
  loadIncome,
  deleteIncome,
  getExpenseCategories,
  createExpense,
  loadExpense,
  deleteExpense,
} from "../services/api/finance.api";

export default function Dashboard() {
  const [openIncome, setOpenIncome] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [amountIncome, setAmountIncome] = useState("");
  const [noteIncome, setNoteIncome] = useState("");
  const [dateIncome, setDateIncome] = useState("");
  const [incomeCategory, setIncomeCategory] = useState("");
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [amountExpense, setAmountExpense] = useState("");
  const [noteExpense, setNoteExpense] = useState("");
  const [dateExpense, setDateExpense] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");

  const navigate = useNavigate();

  function handleLogaut() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  async function handleDeleteIncome(id) {
    await deleteIncome(id);
    setRefresh(!refresh);
  }

  async function handleDeleteExpense(id) {
    await deleteExpense(id);
    setRefresh(!refresh);
  }

  async function handleSaveIncome() {
    await createIncome({
      category: incomeCategory,
      date: dateIncome,
      note: noteIncome,
      amount: amountIncome,
    });
    setOpenIncome(false);
  }

  async function handleSaveExpense() {
    await createExpense({
      category: expenseCategory,
      date: dateExpense,
      note: noteExpense,
      amount: amountExpense,
    });
    setOpenExpense(false);
  }

  useEffect(() => {
    async function loadIncomes() {
      const response = await loadIncome();
      setIncomes(response.data);
    }
    loadIncomes();
  }, [openIncome, refresh]);

  useEffect(() => {
    async function loadExpenses() {
      const response = await loadExpense();
      setExpenses(response.data);
    }
    loadExpenses();
  }, [openExpense, refresh]);

  useEffect(() => {
    async function load() {
      const response = await getIncomeCategories();
      setIncomeCategories(response.data);
      setIncomeCategory(response.data[0].id);
    }
    load();
  }, [openIncome]);

  useEffect(() => {
    async function loadExpensesCategories() {
      const response = await getExpenseCategories();
      setExpenseCategories(response.data);
      setExpenseCategory(response.data[0].id);
    }
    loadExpensesCategories();
  }, [openExpense]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Cashew</h1>
        <Button variant="secondary" onClick={handleLogaut}>
          Logout
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-5">
            <p className="text-sm text-gray-500 mb-1">Balance</p>
            <p className="text-2xl font-semibold text-gray-900">$0.00</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-500 mb-1">Income</p>
            <p className="text-2xl font-semibold text-green-600">
              {incomes.reduce((sum, item) => {
                return sum + Number(item.amount);
              }, 0)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-500 mb-1">Expenses</p>
            <p className="text-2xl font-semibold text-red-500">$0.00</p>
          </Card>
        </div>

        {/* Incomes */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Incomes</h2>
              <button
                onClick={() => setOpenIncome(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                <span className="text-base leading-none">+</span> Add
              </button>
            </div>
            {openIncome && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">
                      Category
                    </label>
                    <select
                      value={incomeCategory}
                      onChange={(e) => setIncomeCategory(e.target.value)}
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {incomeCategories.map((cat) => (
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
                      value={amountIncome}
                      onChange={(e) => setAmountIncome(e.target.value)}
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">
                      Note
                    </label>
                    <input
                      type="text"
                      placeholder="Description"
                      value={noteIncome}
                      onChange={(e) => setNoteIncome(e.target.value)}
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">
                      Date
                    </label>
                    <input
                      type="date"
                      value={dateIncome}
                      onChange={(e) => setDateIncome(e.target.value)}
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setOpenIncome(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveIncome}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
          {incomes.length === 0 ? (
            <p className="text-sm text-gray-400 px-5 py-6">No incomes yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {incomes.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {i.category_detail.name || "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{i.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-green-600">
                      +${i.amount}
                    </p>
                    <button
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      onClick={() => handleDeleteIncome(i.id)}
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

        {/* Expenses */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Expenses
              </h2>
              <button
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                onClick={() => setOpenExpense(true)}
              >
                <span className="text-base leading-none">+</span> Add
              </button>
            </div>
            {openExpense && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">
                      Category
                    </label>
                    <select
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={expenseCategory}
                      onChange={(e) => {
                        setExpenseCategory(e.target.value);
                      }}
                    >
                      {expenseCategories.map((cat) => (
                        <option id={cat.id} value={cat.id}>
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
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={amountExpense}
                      onChange={(e) => {
                        setAmountExpense(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">
                      Note
                    </label>
                    <input
                      type="text"
                      placeholder="Description"
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={noteExpense}
                      onChange={(e) => {
                        setNoteExpense(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">
                      Date
                    </label>
                    <input
                      type="date"
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={dateExpense}
                      onChange={(e) => {
                        setDateExpense(e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setOpenExpense(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md"
                    onClick={handleSaveExpense}
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
                      onClick={() => handleDeleteExpense(e.id)}
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
      </div>
    </div>
  );
}
