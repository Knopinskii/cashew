import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui";

const navItems = [
  { label: "Transactions", path: "/dashboard" },
  { label: "Report", path: "/report" },
  { label: "Plan", path: "/plan" },
  { label: "Settings", path: "/settings" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 w-40">
        <span className="text-xl font-semibold text-gray-900">Cashew</span>
        <span className="text-sm text-gray-400 border border-gray-200 rounded-md px-2 py-1 cursor-pointer hover:bg-gray-50">
          💳 Cash
        </span>
      </div>
      <div className="flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === item.path
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="w-40 flex justify-end">
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
