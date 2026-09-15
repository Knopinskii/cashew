import type {
  Transaction,
  ExpenseCategory,
  CreateExpenseRequest,
  CategoryType,
} from "../../types";
import { apiRequest, apiRequestAll } from "./apiClient";

export async function getExpenses(
  walletId?: string,
  month?: number,
  year?: number
) {
  return apiRequestAll<Transaction>({
    url: "/api/finance/transactions/",
    method: "GET",
    params: { wallet_id: walletId, month, year },
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
  monthly_limit?: string,
  category_type: CategoryType = "floating"
) {
  return apiRequest<ExpenseCategory>({
    url: "/api/finance/expense-categories/",
    method: "POST",
    data: { name, monthly_limit, category_type },
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

export async function updateExpenseCategoryType(
  id: string,
  category_type: CategoryType
) {
  return apiRequest<ExpenseCategory>({
    url: `/api/finance/expense-categories/${id}/`,
    method: "PATCH",
    data: { category_type },
  });
}
