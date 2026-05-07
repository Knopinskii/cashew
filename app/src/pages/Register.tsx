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
      setError("Password should be the same");
      return;
    }
    try {
      await register({
        email,
        username,
        password,
      });
      navigate("/login");
    } catch (e) {
      setError("Registration failed. Please try again.");
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sign up</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <Input
            label="Username"
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="••••••••"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            placeholder="••••••••"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" className="w-full justify-center">
            Sign up
          </Button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-4">
          Already have an account?
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
        {error && (
          <p className="text-sm text-red-500 text-center mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
