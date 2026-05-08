import type { Wallet, CreateWalletRequest } from "../../types";
import { apiRequest } from "./apiClient";

export async function getWallets() {
  return apiRequest<Wallet[]>({
    url: "/api/finance/wallets/",
    method: "GET",
  });
}

export async function createWallet(data: CreateWalletRequest) {
  return apiRequest<Wallet>({
    url: "/api/finance/wallets/",
    method: "POST",
    data,
  });
}

export async function deleteWallet(id: string) {
  return apiRequest<void>({
    url: `/api/finance/wallets/${id}/`,
    method: "DELETE",
  });
}
