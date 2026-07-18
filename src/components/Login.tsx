/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas-parchment)] px-4 py-10">
      <div className="page-shell w-full max-w-6xl overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-[var(--color-surface-black)] p-8 text-[var(--color-on-dark)] sm:p-10 lg:p-12">
            <p className="pill-chip bg-white/10 text-white">Karate dojo portal</p>
            <h1 className="display-lg mt-5 text-[var(--color-on-dark)]">A calmer way to run a busy dojo.</h1>
            <p className="lead mt-4 text-[var(--color-body-muted)]" style={{ fontSize: 21 }}>
              Set the tone with a focused workspace for admissions, attendance, promotions, and security.
            </p>
            <div className="mt-8 space-y-3 text-[var(--color-body-muted)]">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Student records kept tidy and easy to review.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Daily attendance that stays quick enough for real classes.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Leadership tools for instructors and admins in one place.</div>
            </div>
          </div>

          <div className="bg-[var(--color-canvas)] p-8 sm:p-10 lg:p-12">
            <h2 className="display-md mb-2 text-[var(--color-ink)]" style={{ fontSize: 28 }}>
              Sign In
            </h2>
            <p className="body-strong mb-6 text-[var(--color-ink-muted-48)]">Access your dojo management dashboard</p>

            {error && (
              <div className="mb-6 flex items-start gap-2 rounded-lg border border-[#e60012] bg-[#e60012]/5 p-3 text-[#e60012]">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span className="body-strong">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} id="login-form" className="space-y-5">
              <div>
                <label htmlFor="email-address" className="label-field">Email Address</label>
                <input id="email-address" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="admin@karate.com" />
              </div>

              <div>
                <label htmlFor="password" className="label-field">Password</label>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="Enter password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted-48)] hover:text-[var(--color-ink)]">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full" id="submit-login-btn">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="spinner border-white/20 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-[var(--color-divider-soft)] pt-6">
              <p className="caption-strong mb-3 text-[var(--color-ink-muted-48)]">Sandbox Quick Login</p>
              <div className="flex gap-3">
                <button onClick={() => fillCredentials('admin')} className="btn-utility-sm flex-1" id="sandbox-admin-btn">Admin Sensei</button>
                <button onClick={() => fillCredentials('instructor')} className="btn-utility-sm flex-1" id="sandbox-instructor-btn">Instructor Ken</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}