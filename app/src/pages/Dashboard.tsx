import { useState } from "react";
import Navbar from "../components/Navbar";
import SummaryCards from "../components/SummaryCards";
import TransactionList from "../components/TransactionList";
import AddTransactionModal from "../components/AddTransactionModal";
import type { Income, Transaction } from "../types";

export default function Dashboard() {
  const [incomes] = useState<Income[]>([]);
  const [expenses] = useState<Transaction[]>([]);
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <SummaryCards incomes={incomes} expenses={expenses} />
        <TransactionList />
      </div>

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-colors"
      >
        +
      </button>

      {open && <AddTransactionModal onClose={() => setOpen(false)} />}
    </div>
  );
}
