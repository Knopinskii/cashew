import { useState, type ReactNode } from "react";
import { AuthContext } from "./authContextType";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated] = useState(false);

  const login = () => {};
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
