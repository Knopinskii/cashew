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
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  auth_token: string;
}
