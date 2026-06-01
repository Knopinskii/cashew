import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui";
import { getWallets } from "../services/api/wallet.api";
import { useWalletStore } from "../store/useWalletStore";

const navItems = [
  { label: "Transactions", path: "/dashboard" },
  { label: "Report", path: "/report" },
  { label: "Plan", path: "/plan" },
  { label: "Settings", path: "/settings" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const wallets = useWalletStore((s) => s.wallets);
  const setWallets = useWalletStore((s) => s.setWallets);
  const updateActiveWallet = useWalletStore((s) => s.updateActiveWallet);
  const activeWallet = useWalletStore((s) => s.activeWallet);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getWallets().then((data) => {
      setWallets(data);
      if (!activeWallet) {
        updateActiveWallet(data[0].id);
      }
    });
  }, [setWallets, updateActiveWallet]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const activeWalletObj = wallets.find((w) => w.id === activeWallet);

  return (
    <div className="bg-white border-b border-stone-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5 w-40">
        <span className="text-lg font-semibold text-stone-900 tracking-tight">
          Cashew
        </span>
        {activeWalletObj && (
          <div className="relative" ref={dropdownRef}>
            <span className="text-stone-200 mr-1">·</span>
            <span
              onClick={() => setIsOpen((prev) => !prev)}
              className="text-sm text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
            >
              {activeWalletObj.name} ▾
            </span>
            {isOpen && (
              <div className="absolute top-7 left-0 bg-white border border-stone-100 rounded-xl shadow-md py-1 min-w-32 z-50">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => {
                      updateActiveWallet(wallet.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      wallet.id === activeWallet
                        ? "text-amber-700 bg-amber-50"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {wallet.name}
                  </button>
                ))}
              </div>
            )}
          </div>
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
