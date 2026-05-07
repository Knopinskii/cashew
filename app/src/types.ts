export interface User {
  id: string;
  email: string;
  username: string;
}

export interface IncomeCategory {
  id: number;
  name: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  monthly_limit: string | null;
}

export interface Income {
  id: number;
  category: number;
  category_detail: IncomeCategory;
  amount: string;
  note: string;
  date: string;
  user: string;
}

export interface Transaction {
  id: number;
  category: number;
  amount: string;
  note: string;
  date: string;
  user: string;
  category_detail: ExpenseCategory;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
}

export interface CreateIncomeRequest {
  category: number;
  amount: string;
  note: string;
  date: string;
}

export interface CreateExpenseRequest {
  category: number;
  amount: string;
  note: string;
  date: string;
}

export interface RegisterUser {
  email: string;
  username: string;
  password: string;
}

export interface CreateWalletRequest {
  name: string;
  currency: string;
}

export interface Wallet {
  name: string;
  currency: string;
  id: string;
}
