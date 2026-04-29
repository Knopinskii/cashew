import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/ui";
import SummaryCards from "../components/SummaryCards";
import IncomeSection from "../components/IncomeSection";
import ExpenseSection from "../components/ExpenseSection";
import type { Income, Transaction } from "../types";

export default function Dashboard() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Cashew</h1>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <SummaryCards incomes={incomes} expenses={expenses} />
        <IncomeSection onDataChange={setIncomes} />
        <ExpenseSection onDataChange={setExpenses} />
      </div>
    </div>
  );
}
