export interface User {
  id: string;
  email: string;
  username: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  monthly_limit: string | null;
}

export interface Income {
  id: string;
  category: string;
  category_detail: IncomeCategory;
  amount: string;
  note: string;
  date: string;
  user: string;
  wallet: string;
}

export interface Transaction {
  id: string;
  category: string;
  amount: string;
  note: string;
  date: string;
  user: string;
  category_detail: ExpenseCategory;
  wallet: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
}

export interface CreateIncomeRequest {
  category: string;
  amount: string;
  note: string;
  date: string;
  wallet: string;
}

export interface CreateExpenseRequest {
  category: string;
  amount: string;
  note: string;
  date: string;
  wallet: string;
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
