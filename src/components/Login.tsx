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
    <div className="min-h-screen bg-[var(--color-canvas)] flex flex-col items-center pt-24 font-sans px-4">
      <div className="w-full max-w-[830px] flex justify-center">
        
        {/* Main Form Panel */}
        <div className="w-full max-w-[400px] shadow-[8px_8px_0_rgba(33,36,46,0.15)] bg-[var(--color-canvas)] mx-auto">
          {/* Section Header */}
          <div className="bg-[var(--color-canvas)] text-[var(--color-ink)] px-2 py-1.5 flex items-center border-b border-[var(--color-chrome-indigo)]">
            <div className="w-3 h-3 bg-[var(--color-amber)] mr-2 flex-shrink-0" />
            <h2 className="ui-label text-[11px] tracking-widest">≡ SECURE SYSTEM ACCESS</h2>
          </div>

          <div className="bevel-plate-platinum p-6 flex flex-col space-y-4">
            <div className="flex flex-col items-center pb-4 border-b border-dotted border-[var(--color-muted-indigo)]">
               <div className="bg-white px-4 py-2 rounded-full border-2 border-[var(--color-primary)] shadow-sm">
                 <span className="text-[var(--color-primary)] font-display text-3xl font-black italic tracking-tighter leading-none">DOJO</span>
               </div>
            </div>

            {error && (
              <div className="bg-white border border-[var(--color-error)] text-[var(--color-error)] p-2 text-xs flex items-center space-x-2 rounded-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} id="login-form" className="space-y-4">
              
              <div className="space-y-1">
                 <label htmlFor="email-address" className="text-[12px] font-bold text-[var(--color-ink)]">E-mail Address:</label>
                 <div className="relative">
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white text-[var(--color-ink)] border border-[var(--color-hairline)] rounded-xs px-2 py-1 h-[24px] text-xs focus:outline-none focus:border-[var(--color-primary)]"
                    />
                 </div>
              </div>

              <div className="space-y-1">
                 <label htmlFor="password" className="text-[12px] font-bold text-[var(--color-ink)]">Password:</label>
                 <div className="relative flex">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-white text-[var(--color-ink)] border border-[var(--color-hairline)] rounded-xs px-2 py-1 h-[24px] text-xs focus:outline-none focus:border-[var(--color-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-1 px-2 h-[24px] bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] rounded-xs flex items-center justify-center hover:bg-[var(--color-sky)] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3 text-[var(--color-ink)]" /> : <Eye className="w-3 h-3 text-[var(--color-ink)]" />}
                    </button>
                 </div>
              </div>

              <div className="flex justify-end pt-2">
                 <button
                   type="submit"
                   disabled={loading}
                   className="bg-[var(--color-signal)] text-white ui-label text-[11px] px-6 py-2 rounded-xs border-b-2 border-[#b86105] hover:bg-[#ff9d38] cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50"
                   id="submit-login-btn"
                 >
                   {loading ? 'WAIT...' : 'SUBMIT'}
                 </button>
              </div>

            </form>

            <div className="pt-4 border-t border-dotted border-[var(--color-muted-indigo)]">
               <p className="text-[10px] text-[var(--color-ink-soft)] mb-2 uppercase tracking-wide font-bold">Quick Sandbox Login</p>
               <div className="flex flex-col space-y-2">
                 <button 
                   onClick={() => fillCredentials('admin')}
                   className="w-full text-left px-2 py-1 text-xs font-bold text-[var(--color-ink)] hover:bg-white border border-[var(--color-hairline)] rounded-xs cursor-pointer bg-[var(--color-canvas-soft)]"
                   id="sandbox-admin-btn"
                 >
                   › Admin Sensei
                 </button>
                 <button 
                   onClick={() => fillCredentials('instructor')}
                   className="w-full text-left px-2 py-1 text-xs font-bold text-[var(--color-ink)] hover:bg-white border border-[var(--color-hairline)] rounded-xs cursor-pointer bg-[var(--color-canvas-soft)]"
                   id="sandbox-instructor-btn"
                 >
                   › Instructor Ken
                 </button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
