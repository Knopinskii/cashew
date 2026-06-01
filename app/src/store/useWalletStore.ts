import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Wallet } from "../types";

interface WalletStore {
  activeWallet: string | null;
  updateActiveWallet: (id: string) => void;
  wallets: Wallet[];
  setWallets: (wallets: Wallet[]) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      activeWallet: null,
      wallets: [],
      updateActiveWallet: (id) => set({ activeWallet: id }),
      setWallets: (wallets) => set({ wallets }),
    }),
    {
      name: "wallet-store",
    }
  )
);
