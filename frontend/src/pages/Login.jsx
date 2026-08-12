import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (username, password) => {
    setForm({ username, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-sidebar p-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden bg-white/10 p-1">
            <img src={logoImg} alt="MAMS Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">MAMS</p>
            <p className="text-sidebar-muted text-xs">Asset Management</p>
          </div>
        </div>

        {/* Hero text */}
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Secure Military<br />Asset Control
          </h2>
          <p className="text-sidebar-text text-sm leading-relaxed mb-8">
            Centralized inventory management for military bases. Track purchases, transfers, assignments, and expenditures in real time.
          </p>
          <div className="space-y-3">
            {[
              'Role-based access control',
              'Real-time inventory tracking',
              'Complete audit trail',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <span className="text-sidebar-text text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-sidebar-muted text-xs">
          Unauthorized access is strictly prohibited and monitored
        </p>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-100">
        <div className="w-full max-w-sm animate-slide-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden bg-brand-50 p-1">
              <img src={logoImg} alt="MAMS Logo" className="w-full h-full object-contain" />
            </div>
            <p className="text-slate-800 font-bold text-lg">MAMS</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Login Card */}
          <div className="card p-8">
            {error && (
              <div className="flex items-center gap-2 px-3 py-3 bg-red-50 border border-red-200 rounded-lg mb-5 text-red-700 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label" htmlFor="username-input">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="username-input"
                    type="text"
                    className="input-field pl-9"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="password-input">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pl-9 pr-10"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-5 border-t border-surface-200">
              <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">Demo Credentials</p>
              <div className="space-y-2">
                {[
                  { label: 'Admin', username: 'admin_user', password: 'AdminPass123!', color: 'hover:bg-red-50 border-red-100 text-red-700' },
                  { label: 'Base Commander', username: 'commander_alpha', password: 'CommandPass123!', color: 'hover:bg-amber-50 border-amber-100 text-amber-700' },
                  { label: 'Logistics Officer', username: 'logistics_officer', password: 'LogisticsPass123!', color: 'hover:bg-emerald-50 border-emerald-100 text-emerald-700' },
                ].map(({ label, username, password, color }) => (
                  <button
                    key={username}
                    type="button"
                    onClick={() => fillCredentials(username, password)}
                    className={`w-full text-left px-3 py-2 rounded-lg border bg-surface-50 ${color} transition-all duration-150 text-xs`}
                  >
                    <span className="font-semibold">{label}</span>
                    <span className="text-slate-400 ml-2">{username}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
