import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/ui";

export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogaut() {
    localStorage.removeItem("token");
    navigate("/login");
  }

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
            <h2 className="text-base font-semibold text-gray-900">Incomes</h2>
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
