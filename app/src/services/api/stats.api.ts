import type { Stats } from "../../types";
import { apiRequest } from "./apiClient";

export async function getStats() {
  return apiRequest<Stats[]>({
    url: "/api/finance/stats/",
    method: "GET",
  });
}
