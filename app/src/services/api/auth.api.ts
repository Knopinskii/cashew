import type {
  LoginRequest,
  LoginResponse,
  RegisterUser,
  User,
} from "../../types";
import { apiRequest } from "./apiClient";

export async function login(data: LoginRequest) {
  return apiRequest<LoginResponse>({
    url: "/auth/jwt/create/",
    method: "POST",
    data,
  });
}

export async function register(data: RegisterUser) {
  return apiRequest<User>({
    url: "/auth/users/",
    method: "POST",
    data,
  });
}
