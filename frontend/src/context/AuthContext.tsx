import { useState, useCallback, type ReactNode } from "react";
import { login as apiLogin, logout as apiLogout } from "../services/api";
import { AuthContext } from "./authContextType";

const AUTH_TOKEN_KEY = "authToken";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem(AUTH_TOKEN_KEY)
  );

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await apiLogin(credentials);
    localStorage.setItem(AUTH_TOKEN_KEY, response.auth_token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
