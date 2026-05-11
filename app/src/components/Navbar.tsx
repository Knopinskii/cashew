import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui";
import { getWallets } from "../services/api/wallet.api";
import type { Wallet } from "../types";

const navItems = [
  { label: "Transactions", path: "/dashboard" },
  { label: "Report", path: "/report" },
  { label: "Plan", path: "/plan" },
  { label: "Settings", path: "/settings" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    getWallets().then(setWallets);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="bg-white border-b border-stone-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5 w-40">
        <span className="text-lg font-semibold text-stone-900 tracking-tight">Cashew</span>
        {wallets[0] && (
          <>
            <span className="text-stone-200">·</span>
            <span className="text-sm text-stone-400 hover:text-stone-600 transition-colors cursor-pointer">
              {wallets[0].name}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2 text-sm font-medium rounded-2xl transition-colors ${
              location.pathname === item.path
                ? "bg-amber-50 text-amber-700"
                : "text-stone-400 hover:text-stone-700 hover:bg-stone-50"
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
