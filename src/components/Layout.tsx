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
  User,
  Menu,
  X,
  Award,
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
    { id: 'dashboard', name: 'Dashboard', icon: TrendingUp, roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'students', name: 'Students Directory', icon: Users, roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'attendance', name: 'Mark Attendance', icon: CalendarCheck, roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'audit-logs', name: 'Audit Logs', icon: ShieldAlert, roles: [UserRole.ADMIN] },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(currentUser.role));

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 text-white flex items-center justify-between px-4 py-3 shadow-md z-20">
        <div className="flex items-center space-x-2">
          <div className="bg-red-600 p-1.5 rounded-md text-white shadow">
            <Award className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-lg">DOJO MANAGER</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 hover:bg-slate-800 rounded transition-colors"
          id="mobile-menu-btn"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-300 flex flex-col z-10 transition-transform duration-300 md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl md:shadow-none pt-14 md:pt-0`}
        id="app-sidebar"
      >
        {/* Dojo Logo */}
        <div className="hidden md:flex items-center space-x-3 px-6 py-5 border-b border-slate-800">
          <div className="bg-red-600 p-2 rounded-lg text-white shadow-lg shadow-red-900/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-white text-lg leading-tight">DOJO MANAGER</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">Karate Admin</p>
          </div>
        </div>

        {/* Current User Info */}
        <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/20 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-red-500 border border-slate-700/50">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{currentUser.name}</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xxs font-bold bg-red-950/40 text-red-400 border border-red-900/50 uppercase tracking-wider mt-0.5">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/10'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
                id={`nav-tab-${item.id}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Area */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            id="logout-btn"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden md:pl-0">
        {/* Top bar (Desktop Only) */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {currentTab.replace('-', ' ')}
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Dojo Portal • Local Mode
          </div>
        </header>

        {/* Body Area */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto" id="main-content-pane">
          {children}
        </div>
      </main>

      {/* Overlay for Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-5 md:hidden"
        />
      )}
    </div>
  );
}
