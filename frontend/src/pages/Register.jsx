import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'comms_team',
    organization: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        organization: form.organization.trim(),
      });

      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try a different username or email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-3 flex items-center justify-center gap-3">
          <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
          <span className="font-display text-2xl font-semibold text-white">Janova</span>
        </div>

        <div className="mb-6 flex justify-center">
          <span className="ai-badge">AI-Powered Communication</span>
        </div>

        <form onSubmit={handleSubmit} className="ai-card space-y-4 p-6">
          <div className="mb-2 text-center">
            <h1 className="font-display text-xl font-semibold text-white">Join and Communicate</h1>
            <p className="mt-1 text-xs text-slate-300">Create your Janova workspace</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-300">Username</label>
            <input
              required
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-300">Email</label>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-300">Password</label>
            <input
              required
              type="password"
              minLength={6}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-300">Confirm Password</label>
            <input
              required
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-300">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="theme-select">
              <option value="comms_team">Communication Team</option>
              <option value="campaign_manager">Campaign Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="ai-button w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-[11px] text-slate-300">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-300 hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}