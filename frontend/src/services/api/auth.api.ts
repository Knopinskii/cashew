import apiClient from "./apiClient";
import type { LoginRequest, LoginResponse, User } from "../../types";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/token/login/", data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/token/logout/");
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>("/api/users/users/me/");
  return response.data;
};
