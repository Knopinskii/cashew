import type { Income, IncomeCategory, CreateIncomeRequest } from "../../types";
import { apiRequest } from "./apiClient";

export async function getIncomes(walletId?: string) {
  return apiRequest<Income[]>({
    url: "/api/finance/incomes/",
    method: "GET",
    params: walletId ? { wallet_id: walletId } : undefined,
  });
}

export async function createIncome(data: CreateIncomeRequest) {
  return apiRequest<Income>({
    url: "/api/finance/incomes/",
    method: "POST",
    data,
  });
}

export async function updateIncome(id: string, data: CreateIncomeRequest) {
  return apiRequest<Income>({
    url: `/api/finance/incomes/${id}/`,
    method: "PATCH",
    data,
  });
}

export async function deleteIncome(id: string) {
  return apiRequest<void>({
    url: `/api/finance/incomes/${id}/`,
    method: "DELETE",
  });
}

export async function getIncomeCategories() {
  return apiRequest<IncomeCategory[]>({
    url: "/api/finance/income-categories/",
    method: "GET",
  });
}

export async function createIncomeCategory(name: string) {
  return apiRequest<IncomeCategory>({
    url: "/api/finance/income-categories/",
    method: "POST",
    data: { name },
  });
}

export async function deleteIncomeCategory(id: string) {
  return apiRequest<void>({
    url: `/api/finance/income-categories/${id}/`,
    method: "DELETE",
  });
}
