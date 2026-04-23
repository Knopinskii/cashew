import apiClient from "./apiClient";

export async function getIncomeCategories() {
  return apiClient({
    url: "/api/finance/income-categories/",
    method: "GET",
  });
}
