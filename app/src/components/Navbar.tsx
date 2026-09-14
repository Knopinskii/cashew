import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui";
import { getWallets } from "../services/api/wallet.api";
import { useWalletStore } from "../store/useWalletStore";
import { clearTokens } from "../services/api/tokens";

const navItems = [
  { label: "Transactions", short: "List", path: "/dashboard" },
  { label: "Report", short: "Report", path: "/report" },
  { label: "Plan", short: "Plan", path: "/plan" },
  { label: "Settings", short: "Settings", path: "/settings" },
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
      // A brand new account has no wallets yet; data[0] would throw.
      if (!activeWallet && data.length > 0) {
        updateActiveWallet(data[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    clearTokens();
    navigate("/login");
  }

  const activeWalletObj = wallets.find((w) => w.id === activeWallet);

  return (
    <>
      <div className="bg-white border-b border-stone-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 md:w-40">
          <span className="text-lg font-semibold text-stone-900 tracking-tight shrink-0">
            Cashew
          </span>
          {activeWalletObj && (
            <div className="relative min-w-0" ref={dropdownRef}>
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

        {/* Desktop navigation. On phones these move to the bottom bar below. */}
        <div className="hidden md:flex items-center gap-0.5">
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

        <div className="md:w-40 flex justify-end shrink-0">
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile tab bar: thumb-reachable, and the pattern people already know
          from native apps. pb-[env(safe-area-inset-bottom)] keeps it clear of
          the iPhone home indicator. */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-100 flex pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 py-3 text-center text-xs font-medium transition-colors ${
                isActive
                  ? "text-amber-700"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <span
                className={`block w-6 h-0.5 mx-auto mb-1.5 rounded-full ${
                  isActive ? "bg-amber-500" : "bg-transparent"
                }`}
              />
              {item.short}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
