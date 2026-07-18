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
    { id: 'attendance', name: currentUser.role === UserRole.ADMIN ? 'View Attendance' : 'Mark Attendance', icon: CalendarCheck, roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'users', name: 'User Management', icon: Shield, roles: [UserRole.ADMIN] },
    { id: 'audit-logs', name: 'Audit Logs', icon: ShieldAlert, roles: [UserRole.ADMIN] },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(currentUser.role));

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] font-sans text-[var(--color-ink)] flex flex-col items-center px-2 py-4 md:px-4 md:py-8">
      
      {/* 800px Fixed Width Container */}
      <div className="w-full max-w-[830px] flex flex-col shadow-2xl bg-[var(--color-canvas)] rounded-sm overflow-hidden">
        
        {/* Masthead Row (above chrome) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end p-4 gap-3 relative bg-[var(--color-canvas)]">
          <div className="flex items-center space-x-2 z-10 relative bg-white px-3 py-1 rounded-full border-2 border-[var(--color-primary)]">
            <span className="text-[var(--color-primary)] font-display text-xl sm:text-2xl font-black italic tracking-tighter leading-none">DOJO</span>
          </div>
          
          <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-xs border border-[var(--color-hairline)] text-xs">
             <span className="ui-label text-[10px] sm:text-xs">LOGGED IN:</span>
             <span className="font-bold text-xxs sm:text-xs">{currentUser.name} ({currentUser.role})</span>
          </div>
        </div>

        {/* Primary Nav Bar (Carbon Slab) */}
        <nav className="carbon-slab min-h-[36px] h-auto px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 items-center">
             {allowedNavItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`ui-label text-xs sm:text-[13px] py-1 px-2.5 rounded-xs transition-colors cursor-pointer ${
                      isActive ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'text-[var(--color-nav-gold)] hover:bg-white/10'
                    }`}
                  >
                    {item.name}
                  </button>
                );
             })}
          </div>
          <div className="flex space-x-2 self-end sm:self-auto">
            <button 
              onClick={onLogout}
              className="bg-[var(--color-amber)] text-[var(--color-carbon)] ui-label text-[11px] px-2.5 py-1 rounded-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] border-b border-[#a87a27] cursor-pointer hover:bg-[#ffbf4c]"
            >
              Sign Out
            </button>
          </div>
        </nav>

        {/* Secondary Nav Strip */}
        <div className="bg-[var(--color-canvas-soft)] min-h-[24px] h-auto px-4 py-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 ui-label text-[10px] md:text-[11px] text-[var(--color-ink)] border-b border-[var(--color-chrome-indigo)]">
           <span className="cursor-pointer hover:underline">Help & Support</span>
           <span className="text-[var(--color-chrome-indigo)] hidden sm:inline">|</span>
           <span className="cursor-pointer hover:underline">System Config</span>
           <span className="text-[var(--color-chrome-indigo)] hidden sm:inline">|</span>
           <span className="cursor-pointer hover:underline">Privacy Policy</span>
        </div>

        {/* Main Body Area */}
        <main className="flex flex-col md:flex-row p-3 md:p-4 gap-4 min-h-[600px]">
           
           {/* Left Rail (Rotated Tabs) - Optional/Decorative */}
           <div className="hidden md:flex w-8 flex-shrink-0 flex-col space-y-1">
             <div className="bg-[var(--color-carbon)] text-[var(--color-canvas-soft)] ui-label text-[11px] py-6 px-1 flex items-center justify-center [writing-mode:vertical-lr] rotate-180 border-r border-black shadow-[inset_1px_0_0_#444]">
                QUICK LINKS
             </div>
             <div className="bg-[var(--color-muted-indigo)] text-white/50 ui-label text-[11px] py-6 px-1 flex items-center justify-center [writing-mode:vertical-lr] rotate-180 border-r border-[#333]">
                ARCHIVE
             </div>
           </div>

           {/* Content Column */}
           <div className="flex-1 flex flex-col space-y-4 overflow-hidden min-w-0">
              {children}
           </div>

           {/* Right Action Rail */}
           <aside className="w-full md:w-[220px] flex-shrink-0 flex flex-col space-y-4">
              
              {/* Promo / Info Box */}
              <div className="bevel-plate-light p-3 rounded-md">
                 <h3 className="ui-label text-[11px] mb-2 text-[var(--color-ink)]">SYSTEM STATUS</h3>
                 <div className="bg-white p-2 rounded-sm border border-[var(--color-hairline)] text-xs">
                    <p><strong>Environment:</strong> Local Mode</p>
                    <p className="mt-1"><strong>Active:</strong> {new Date().toLocaleDateString()}</p>
                 </div>
              </div>

              {/* Quick Actions */}
              <div className="bevel-plate p-3 rounded-md">
                 <h3 className="ui-label text-[11px] mb-2 text-[var(--color-ink)]">QUICK ACTIONS</h3>
                 <div className="space-y-2">
                    <button className="w-full flex items-center justify-between bg-[var(--color-carbon)] text-white ui-label text-[11px] p-2 hover:bg-black cursor-pointer">
                      <span>Add Student</span>
                      <div className="w-4 h-4 rounded-full bg-[var(--color-signal)] flex items-center justify-center text-white font-bold leading-none">›</div>
                    </button>
                    <button className="w-full flex items-center justify-between bg-[var(--color-carbon)] text-white ui-label text-[11px] p-2 hover:bg-black cursor-pointer">
                      <span>Mark Attendance</span>
                      <div className="w-4 h-4 rounded-full bg-[var(--color-signal)] flex items-center justify-center text-white font-bold leading-none">›</div>
                    </button>
                 </div>
              </div>

           </aside>
        </main>

        {/* Footer */}
        <footer className="carbon-slab px-4 py-4 chamfered mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[var(--color-canvas-soft)] text-[10px] font-sans text-center sm:text-left">
           <p>©2001-2026 DOJO SYSTEMS. ALL RIGHTS RESERVED.</p>
           <div className="bg-[var(--color-amber)] text-[var(--color-carbon)] px-2 py-0.5 rounded-xs font-bold uppercase tracking-tighter">
              DOJO - SECURE
           </div>
        </footer>

      </div>
    </div>
  );
}
