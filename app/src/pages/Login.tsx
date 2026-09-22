import { useState } from "react";
import { Button, Input } from "../components/ui";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api/auth.api";
import { setTokens } from "../services/api/tokens";
import { describeError } from "../services/api/errors";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      setTokens(response.access, response.refresh);
      navigate("/dashboard");
    } catch (err) {
      // Only a 401 means the credentials are wrong. A dead server or a 500
      // used to show the same message and sent people resetting passwords.
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(describeError(err, "Could not sign in. Please try again."));
      }
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-stone-900 mb-1">Welcome back</h1>
        <p className="text-sm text-stone-400 mb-6">Sign in to your account</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <p className="text-xs text-rose-500 whitespace-pre-line">{error}</p>}
          <Button type="submit" className="w-full justify-center">
            Sign in
          </Button>
        </form>
        <p className="text-sm text-stone-400 text-center mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-amber-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
