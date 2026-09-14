import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Stats from "./pages/Stats";
import Report from "./pages/Report";

function ProtectedRoute({ element }: { element: React.ReactElement }) {
  return localStorage.getItem("token") ? (
    element
  ) : (
    <Navigate to="/login" replace />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute element={<Dashboard />} />}
      />
      <Route path="/register" element={<Register />} />
      <Route
        path="/settings"
        element={<ProtectedRoute element={<Settings />} />}
      />
      <Route path="/plan" element={<ProtectedRoute element={<Stats />} />} />
      <Route path="/report" element={<ProtectedRoute element={<Report />} />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
