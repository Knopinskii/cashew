import apiClient from "./apiClient";
import type { Income, Transaction, IncomeCategory, ExpenseCategory } from "../../types";

// --- Income Categories ---

export const getIncomeCategories = async (): Promise<IncomeCategory[]> => {
  const response = await apiClient.get<IncomeCategory[]>("/api/finance/income-categories/");
  return response.data;
};

export const createIncomeCategory = async (name: string): Promise<IncomeCategory> => {
  const response = await apiClient.post<IncomeCategory>("/api/finance/income-categories/", { name });
  return response.data;
};

// --- Expense Categories ---

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const response = await apiClient.get<ExpenseCategory[]>("/api/finance/expense-categories/");
  return response.data;
};

export const createExpenseCategory = async (name: string, monthly_limit?: string): Promise<ExpenseCategory> => {
  const response = await apiClient.post<ExpenseCategory>("/api/finance/expense-categories/", { name, monthly_limit });
  return response.data;
};

// --- Incomes ---

export const getIncomes = async (): Promise<Income[]> => {
  const response = await apiClient.get<Income[]>("/api/finance/incomes/");
  return response.data;
};

export const createIncome = async (data: Omit<Income, "id" | "user">): Promise<Income> => {
  const response = await apiClient.post<Income>("/api/finance/incomes/", data);
  return response.data;
};

// --- Transactions ---

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await apiClient.get<Transaction[]>("/api/finance/transactions/");
  return response.data;
};

export const createTransaction = async (data: Omit<Transaction, "id" | "user">): Promise<Transaction> => {
  const response = await apiClient.post<Transaction>("/api/finance/transactions/", data);
  return response.data;
};
