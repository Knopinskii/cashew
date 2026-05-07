import {
  type Wallet,
  type CreateExpenseRequest,
  type CreateIncomeRequest,
  type CreateWalletRequest,
  type ExpenseCategory,
  type Income,
  type IncomeCategory,
  type Transaction,
} from "../../types";
import { apiRequest } from "./apiClient";

export async function getIncomeCategories() {
  return apiRequest<IncomeCategory[]>({
    url: "/api/finance/income-categories/",
    method: "GET",
  });
}

export async function createIncome(data: CreateIncomeRequest) {
  return apiRequest<Income>({
    url: "/api/finance/incomes/",
    method: "POST",
    data,
  });
}

export async function loadIncome() {
  return apiRequest<Income[]>({
    url: "/api/finance/incomes/",
    method: "GET",
  });
}

export async function loadExpense() {
  return apiRequest<Transaction[]>({
    url: "/api/finance/transactions/",
    method: "GET",
  });
}

export async function deleteIncome(id: string) {
  return apiRequest<void>({
    url: `/api/finance/incomes/${id}/`,
    method: "DELETE",
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

export async function createExpense(data: CreateExpenseRequest) {
  return apiRequest<Transaction>({
    url: "/api/finance/transactions/",
    method: "POST",
    data,
  });
}

export async function createWallet(data: CreateWalletRequest) {
  return apiRequest<Wallet>({
    url: "/api/finance/wallets/",
    method: "POST",
    data,
  });
}

export async function getWallet() {
  return apiRequest<Wallet[]>({
    url: "/api/finance/wallets/",
    method: "GET",
  });
}

export async function deleteWallet(id: string) {
  return apiRequest<void>({
    url: `/api/finance/wallets/${id}/`,
    method: "DELETE",
  });
}
