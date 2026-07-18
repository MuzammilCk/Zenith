/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: { id: string; name: string; email: string; role: any }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Check your credentials.');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: 'admin' | 'instructor') => {
    if (role === 'admin') {
      setEmail('admin@karate.com');
      setPassword('admin123');
    } else {
      setEmail('instructor@karate.com');
      setPassword('instructor123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Decorative Dojo Design Element */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />

        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-2xl text-white shadow-xl shadow-red-900/40 flex items-center justify-center border border-red-500">
            <Award className="w-9 h-9" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
            DOJO PORTAL
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Karate Institution Management System
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-4 flex items-start space-x-3 text-red-400 text-sm animate-fade-in" id="login-error">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} id="login-form">
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-xl bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                  placeholder="sensei@dojo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-800 rounded-xl bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-red-600 disabled:opacity-50 transition-all cursor-pointer"
              id="submit-login-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In to Dojo'
              )}
            </button>
          </div>
        </form>

        {/* Quick Demo Logins */}
        <div className="pt-6 border-t border-slate-850 text-center">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Quick Sandbox Login
          </span>
          <div className="mt-3 flex justify-center space-x-3">
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all cursor-pointer"
              id="sandbox-admin-btn"
            >
              🥋 Admin Sensei
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('instructor')}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all cursor-pointer"
              id="sandbox-instructor-btn"
            >
              🥊 Instructor Ken
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
