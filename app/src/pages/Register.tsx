import { Link, useNavigate } from "react-router-dom";
import { Button, Input } from "../components/ui";
import { useState } from "react";
import { register } from "../services/api/auth.api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    try {
      await register({ email, username, password });
      navigate("/login");
    } catch {
      setError("Registration failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-stone-900 mb-1">Create account</h1>
        <p className="text-sm text-stone-400 mb-6">Start tracking your finances</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Username"
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <Button type="submit" className="w-full justify-center">
            Sign up
          </Button>
        </form>
        <p className="text-sm text-stone-400 text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
