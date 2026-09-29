import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
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

// The inverse of ProtectedRoute: a logged-in visitor hitting "/" should land
// on their data, not read a pitch for an app they already use every day.
function PublicRoute({ element }: { element: React.ReactElement }) {
  return localStorage.getItem("token") ? (
    <Navigate to="/dashboard" replace />
  ) : (
    element
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute element={<Landing />} />} />
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
      <Route path="*" element={<Navigate to="/" />} />
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
