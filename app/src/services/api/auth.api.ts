import apiClient from "./apiClient";

export async function login(data) {
  return apiClient({
    url: "/auth/jwt/create/",
    method: "POST",
    data,
  });
}
