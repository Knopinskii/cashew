import apiClient from "./apiClient";

export async function getIncomeCategories() {
  return apiClient({
    url: "/api/finance/income-categories/",
    method: "GET",
  });
}

export async function createIncome(data) {
  return apiClient({
    url: "/api/finance/incomes/",
    method: "POST",
    data,
  });
}

export async function loadIncome() {
  return apiClient({
    url: "/api/finance/incomes/",
    method: "GET",
  });
}

export async function deleteIncome(id) {
  return apiClient({
    url: `/api/finance/incomes/${id}/`,
    method: "DELETE",
  });
}
