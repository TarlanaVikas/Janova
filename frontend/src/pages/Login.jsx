import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-3 flex items-center justify-center gap-3">
          <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
          <span className="font-display text-2xl font-semibold text-white">Janova</span>
        </div>

        <p className="mb-5 text-center text-xs text-slate-300">Civic Communication & Public Awareness Platform</p>

        <div className="mb-6 flex justify-center">
          <span className="ai-badge">AI-Powered Communication</span>
        </div>

        <form onSubmit={handleSubmit} className="ai-card space-y-4 p-6">
          <div className="mb-2 text-center">
            <h1 className="font-display text-xl font-semibold text-white">Welcome Back</h1>
            <p className="mt-1 text-xs text-slate-300">Sign in to access your Janova workspace</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-300">Username</label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-300">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 outline-none transition"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="ai-button w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <p className="text-center text-[11px] text-slate-300">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-emerald-300 hover:underline">Create an account</Link>
          </p>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Janova network online
        </div>
      </div>
    </div>
  );
}