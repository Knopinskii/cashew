export interface User {
  id: string;
  email: string;
  username: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
}

export type CategoryType = "stable" | "floating";

export interface ExpenseCategory {
  id: string;
  name: string;
  monthly_limit: string | null;
  category_type: CategoryType;
}

export interface ReportCategory {
  id: string;
  name: string;
  category_type: CategoryType;
  spent: number;
  previous: number;
  previous_full_month: number;
  average: number | null;
}

export interface Report {
  period: {
    month: number;
    year: number;
    cutoff_day: number;
    days_in_month: number;
    partial: boolean;
  };
  totals: {
    spent: number;
    previous: number;
    average: number | null;
    daily_average: number;
    projected: number;
    compared_months: number;
  };
  categories: ReportCategory[];
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

export interface Stats {
  category_name: string;
  // The stats endpoint returns plain numbers, not the strings DRF serializers
  // produce for Decimal fields elsewhere. spent falls back to 0 server-side.
  monthly_limit: number | null;
  spent: number;
}
