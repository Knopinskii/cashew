import type {
  Transaction,
  ExpenseCategory,
  CreateExpenseRequest,
} from "../../types";
import { apiRequest } from "./apiClient";

export async function getExpenses(walletId?: string) {
  return apiRequest<Transaction[]>({
    url: "/api/finance/transactions/",
    method: "GET",
    params: walletId ? { wallet_id: walletId } : undefined,
  });
}

export async function createExpense(data: CreateExpenseRequest) {
  return apiRequest<Transaction>({
    url: "/api/finance/transactions/",
    method: "POST",
    data,
  });
}

export async function updateExpense(id: string, data: CreateExpenseRequest) {
  return apiRequest<Transaction>({
    url: `/api/finance/transactions/${id}/`,
    method: "PATCH",
    data,
  });
}

export async function deleteExpense(id: string) {
  return apiRequest<void>({
    url: `/api/finance/transactions/${id}/`,
    method: "DELETE",
  });
}

export async function getExpenseCategories() {
  return apiRequest<ExpenseCategory[]>({
    url: "/api/finance/expense-categories/",
    method: "GET",
  });
}

export async function createExpenseCategory(
  name: string,
  monthly_limit?: string
) {
  return apiRequest<ExpenseCategory>({
    url: "/api/finance/expense-categories/",
    method: "POST",
    data: { name, monthly_limit },
  });
}

export async function deleteExpenseCategory(id: string) {
  return apiRequest<void>({
    url: `/api/finance/expense-categories/${id}/`,
    method: "DELETE",
  });
}

export async function updateExpenseCategory(
  id: string,
  monthly_limit: string | null
) {
  return apiRequest<ExpenseCategory>({
    url: `/api/finance/expense-categories/${id}/`,
    method: "PATCH",
    data: { monthly_limit },
  });
}
