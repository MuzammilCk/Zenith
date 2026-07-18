/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  LogOut,
  ShieldAlert,
  Shield,
  Menu,
} from 'lucide-react';
import { UserRole } from '../types.js';

interface LayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: { name: string; email: string; role: UserRole } | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  children,
}: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!currentUser) return <>{children}</>;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'students', label: 'Students', icon: Users, roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'attendance', label: currentUser.role === UserRole.ADMIN ? 'Attendance' : 'Mark Attendance', icon: CalendarCheck, roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'users', label: 'Users', icon: Shield, roles: [UserRole.ADMIN] },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldAlert, roles: [UserRole.ADMIN] },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(currentUser.role));

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-canvas-parchment)] font-sans text-[var(--color-ink)] flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[var(--color-surface-black)]/95 text-[var(--color-on-dark)] backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <button
              onClick={() => handleTabClick('dashboard')}
              className="display-md cursor-pointer text-[var(--color-on-dark)]"
              style={{ fontSize: 21, letterSpacing: -0.28 }}
            >
              DOJO
            </button>
            <div className="hidden items-center gap-1 md:flex">
              {allowedNavItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`nav-link-ut rounded-full px-3 py-1.5 transition-all ${
                      isActive
                        ? 'bg-white/10 text-[var(--color-on-dark)]'
                        : 'text-[var(--color-body-muted)] hover:bg-white/10 hover:text-[var(--color-on-dark)]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="caption hidden text-[var(--color-body-muted)] sm:block">{currentUser.name}</span>
            <button onClick={onLogout} className="btn-dark-utility text-xs py-1 px-3">
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign Out
            </button>
            <button
              className="rounded-full p-1.5 text-[var(--color-body-muted)] transition-colors hover:bg-white/10 hover:text-white md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="border-b border-[var(--color-hairline)] bg-[var(--color-surface-tile-2)] px-4 py-3 md:hidden">
          {allowedNavItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left font-sans text-[17px] transition-colors ${
                  isActive ? 'bg-white/10 text-[var(--color-on-dark)]' : 'text-[var(--color-body-muted)] hover:bg-white/10 hover:text-[var(--color-on-dark)]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="border-b border-[var(--color-hairline)] bg-[var(--color-canvas-parchment)]/90 frosted">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <h2 className="tagline text-[var(--color-ink)]">
            {currentTab === 'dashboard' && 'Karate Dojo Portal'}
            {currentTab === 'students' && 'Students Directory'}
            {currentTab === 'attendance' && 'Attendance Workspace'}
            {currentTab === 'users' && 'User Administration'}
            {currentTab === 'audit-logs' && 'System Security Trails'}
          </h2>
          <span className="fine-print text-[var(--color-ink-muted-48)]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <main className="mx-auto flex-1 w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </main>

      <footer className="border-t border-[var(--color-hairline)] bg-[var(--color-canvas-parchment)]">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="caption-strong mb-3 text-[var(--color-ink)]">Dojo Portal</h3>
              <ul className="space-y-2">
                <li><span className="text-link fine-print cursor-pointer">About Karate Management</span></li>
                <li><span className="text-link fine-print cursor-pointer">System Overview</span></li>
                <li><span className="text-link fine-print cursor-pointer">Privacy Policy</span></li>
                <li><span className="text-link fine-print cursor-pointer">Terms of Use</span></li>
              </ul>
            </div>
            <div>
              <h3 className="caption-strong mb-3 text-[var(--color-ink)]">Features</h3>
              <ul className="space-y-2">
                <li><span className="text-link fine-print cursor-pointer">Student Management</span></li>
                <li><span className="text-link fine-print cursor-pointer">Attendance Tracking</span></li>
                <li><span className="text-link fine-print cursor-pointer">Belt Rankings</span></li>
                <li><span className="text-link fine-print cursor-pointer">Analytics</span></li>
              </ul>
            </div>
            <div>
              <h3 className="caption-strong mb-3 text-[var(--color-ink)]">For Dojos</h3>
              <ul className="space-y-2">
                <li><span className="text-link fine-print cursor-pointer">Pricing Plans</span></li>
                <li><span className="text-link fine-print cursor-pointer">Enterprise Setup</span></li>
                <li><span className="text-link fine-print cursor-pointer">API Docs</span></li>
                <li><span className="text-link fine-print cursor-pointer">Support</span></li>
              </ul>
            </div>
            <div>
              <h3 className="caption-strong mb-3 text-[var(--color-ink)]">Resources</h3>
              <ul className="space-y-2">
                <li><span className="text-link fine-print cursor-pointer">Documentation</span></li>
                <li><span className="text-link fine-print cursor-pointer">Report Issue</span></li>
                <li><span className="text-link fine-print cursor-pointer">Feature Roadmap</span></li>
                <li><span className="text-link fine-print cursor-pointer">System Status</span></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--color-hairline)] pt-6 sm:flex-row">
            <p className="fine-print text-[var(--color-ink-muted-48)]">Copyright 2026 Karate Dojo Portal. All rights reserved.</p>
            <p className="fine-print text-[var(--color-ink-muted-48)]">Karate Dojo Portal</p>
          </div>
        </div>
      </footer>
    </div>
  );
}