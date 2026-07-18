/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.js';
import Login from './components/Login.js';
import Dashboard from './components/Dashboard.js';
import StudentList from './components/StudentList.js';
import StudentDetail from './components/StudentDetail.js';
import AttendanceMarker from './components/AttendanceMarker.js';
import AuditLogs from './components/AuditLogs.js';
import { UserRole } from './types.js';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null>(null);

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Authenticate from local storage session on initial mount
  useEffect(() => {
    const savedToken = localStorage.getItem('dojo_token');
    const savedUser = localStorage.getItem('dojo_user');

    if (savedToken && savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        
        // Verify token with backend
        fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        })
          .then((res) => {
            if (res.ok) {
              setToken(savedToken);
              setCurrentUser(userObj);
            } else {
              // Token invalid or expired
              handleLogout();
            }
          })
          .catch(() => {
            // Server offline or network error, let's keep local session as fallback
            setToken(savedToken);
            setCurrentUser(userObj);
          })
          .finally(() => {
            setSessionLoading(false);
          });
        return;
      } catch (err) {
        console.error('Failed to parse saved login session', err);
      }
    }
    setSessionLoading(false);
  }, []);

  const handleLoginSuccess = (
    authToken: string,
    user: { id: string; name: string; email: string; role: any }
  ) => {
    setToken(authToken);
    setCurrentUser(user);
    localStorage.setItem('dojo_token', authToken);
    localStorage.setItem('dojo_user', JSON.stringify(user));
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('dojo_token');
    localStorage.removeItem('dojo_user');
    setActiveStudentId(null);
    setCurrentTab('dashboard');
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center space-y-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold tracking-wide text-sm font-sans">SYNCHRONIZING DOJO PORTAL...</p>
      </div>
    );
  }

  // Not logged in -> Show login screen
  if (!token || !currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Render correct sub-view
  let content = null;
  switch (currentTab) {
    case 'dashboard':
      content = (
        <Dashboard
          token={token}
          onViewStudent={(id) => {
            setActiveStudentId(id);
            setCurrentTab('students');
          }}
        />
      );
      break;
    case 'students':
      if (activeStudentId) {
        content = (
          <StudentDetail
            token={token}
            studentId={activeStudentId}
            onBack={() => setActiveStudentId(null)}
          />
        );
      } else {
        content = (
          <StudentList
            token={token}
            userRole={currentUser.role}
            onViewStudent={(id) => setActiveStudentId(id)}
          />
        );
      }
      break;
    case 'attendance':
      content = <AttendanceMarker token={token} />;
      break;
    case 'audit-logs':
      if (currentUser.role === UserRole.ADMIN) {
        content = <AuditLogs token={token} />;
      } else {
        content = (
          <div className="bg-red-50 text-red-800 p-6 rounded-xl border border-red-200 font-semibold text-center">
            Access Denied: Instructor role does not have authorization to view security trails.
          </div>
        );
      }
      break;
    default:
      content = <div className="text-slate-500 font-bold">Content tab "{currentTab}" not found.</div>;
  }

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={(tab) => {
        // Clear sub-page state when changing tabs
        if (tab !== 'students') {
          setActiveStudentId(null);
        }
        setCurrentTab(tab);
      }}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {content}
    </Layout>
  );
}
