import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/ui";
import { useEffect, useState } from "react";
import { getIncomeCategories } from "../services/api/finance.api";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  function handleLogaut() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  useEffect(() => {
    async function load() {
      const response = await getIncomeCategories();
      setCategories(response.data);
    }
    load();
  }, [open]);

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
            <p className="text-2xl font-semibold text-green-600">$0.00</p>
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
              <button onClick={() => setOpen(true)}>+</button>
            </div>
            {open && (
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <select>
                    {categories.map((category) => (
                      <option key={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <input type="number" />
                  <input type="text" />
                  <input type="date" />
                  <button>Save</button>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400 px-5 py-6">No incomes yet</p>
        </Card>

        {/* Transactions */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Transactions
            </h2>
          </div>
          <p className="text-sm text-gray-400 px-5 py-6">No transactions yet</p>
        </Card>
      </div>
    </div>
  );
}
