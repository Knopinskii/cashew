import type { LoginRequest, LoginResponse } from "../../types";
import { apiRequest } from "./apiClient";

export async function login(data: LoginRequest) {
  return apiRequest<LoginResponse>({
    url: "/auth/jwt/create/",
    method: "POST",
    data,
  });
}
