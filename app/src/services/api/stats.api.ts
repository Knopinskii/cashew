import type { Stats } from "../../types";
import { apiRequest } from "./apiClient";

export async function getStats(
  walletId?: string,
  month?: number,
  year?: number
) {
  return apiRequest<Stats[]>({
    url: "/api/finance/stats/",
    method: "GET",
    params: { wallet_id: walletId, month, year },
  });
}
