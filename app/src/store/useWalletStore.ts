import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Wallet } from "../types";

const now = new Date();

interface WalletStore {
  activeWallet: string | null;
  updateActiveWallet: (id: string) => void;
  wallets: Wallet[];
  setWallets: (wallets: Wallet[]) => void;
  month: number;
  year: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      activeWallet: null,
      wallets: [],
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      updateActiveWallet: (id) => set({ activeWallet: id }),
      setWallets: (wallets) => set({ wallets }),
      setMonth: (month) => set({ month }),
      setYear: (year) => set({ year }),
    }),
    {
      name: "wallet-store",
    }
  )
);
