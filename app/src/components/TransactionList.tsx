const mockTransactions = [
  { id: "1", type: "expense", category: "Food", amount: "12.50", date: "2026-05-07", note: "Groceries" },
  { id: "2", type: "income", category: "Salary", amount: "3000.00", date: "2026-05-07", note: "" },
  { id: "3", type: "expense", category: "Transport", amount: "45.00", date: "2026-05-06", note: "Taxi" },
  { id: "4", type: "expense", category: "Food", amount: "8.99", date: "2026-05-06", note: "Coffee" },
  { id: "5", type: "income", category: "Freelance", amount: "500.00", date: "2026-05-05", note: "Project" },
  { id: "6", type: "expense", category: "Transport", amount: "33.96", date: "2026-05-05", note: "" },
];

function groupByDate(items: typeof mockTransactions) {
  return items.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, typeof mockTransactions>);
}

export default function TransactionList() {
  const grouped = groupByDate(mockTransactions);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{date}</p>
            <p className="text-xs text-gray-400">
              {items
                .reduce((sum, i) => i.type === "expense" ? sum - parseFloat(i.amount) : sum + parseFloat(i.amount), 0)
                .toFixed(2)} €
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.category}</p>
                  {item.note && <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>}
                </div>
                <p className={`text-sm font-semibold ${item.type === "income" ? "text-green-600" : "text-red-500"}`}>
                  {item.type === "income" ? "+" : "-"}${item.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
