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
export async function loadExpense() {
  return apiClient({
    url: "/api/finance/transactions/",
    method: "GET",
  });
}

export async function deleteIncome(id) {
  return apiClient({
    url: `/api/finance/incomes/${id}/`,
    method: "DELETE",
  });
}

export async function deleteExpense(id) {
  return apiClient({
    url: `/api/finance/transactions/${id}/`,
    method: "DELETE",
  });
}

export async function getExpenseCategories() {
  return apiClient({
    url: "/api/finance/expense-categories/",
  });
}

export async function createExpense(data) {
  return apiClient({
    url: "/api/finance/transactions/",
    method: "POST",
    data,
  });
}
