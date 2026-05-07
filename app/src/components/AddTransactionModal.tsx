import { useState } from "react";

export default function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const [formType, setFormType] = useState<"income" | "expense">("expense");

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Type Toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1 gap-1">
          <button
            onClick={() => setFormType("expense")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formType === "expense" ? "bg-red-500 text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            Expense
          </button>
          <button
            onClick={() => setFormType("income")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formType === "income" ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            Income
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Category</label>
            <select className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Food</option>
              <option>Transport</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Amount</label>
            <input type="number" placeholder="0.00" className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Note</label>
            <input type="text" placeholder="Description" className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Date</label>
            <input type="date" className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <button className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}
