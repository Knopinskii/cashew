import type { Report } from "../../types";
import { apiRequest } from "./apiClient";

export async function getReport(
  walletId?: string,
  month?: number,
  year?: number
) {
  return apiRequest<Report>({
    url: "/api/finance/report/",
    method: "GET",
    params: { wallet_id: walletId, month, year },
  });
}
