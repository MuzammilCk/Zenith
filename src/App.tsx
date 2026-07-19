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
import StudentEnrollment from './components/StudentEnrollment.js';
import AttendanceMarker from './components/AttendanceMarker.js';
import AuditLogs from './components/AuditLogs.js';
import UserManagement from './components/UserManagement.js';
import UserEnrollment from './components/UserEnrollment.js';
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
  const [editStudentId, setEditStudentId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
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
      <div className="min-h-screen bg-[var(--color-canvas)] flex flex-col justify-center items-center space-y-4">
        <div className="spinner" />
        <p className="body-strong text-[var(--color-ink-muted-48)]">Loading Dojo Portal...</p>
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
            onEnroll={() => setCurrentTab('enrollment')}
            onEditStudent={(id) => {
              setEditStudentId(id);
              setCurrentTab('enrollment');
            }}
          />
        );
      }
      break;
    case 'enrollment':
      content = (
        <StudentEnrollment
          token={token}
          studentToEdit={editStudentId ? { id: editStudentId } as any : null}
          onDone={() => {
            setEditStudentId(null);
            setCurrentTab('students');
          }}
          onSaved={() => {}}
        />
      );
      break;
    case 'attendance':
      content = <AttendanceMarker token={token} userRole={currentUser.role} />;
      break;
    case 'users':
      if (currentUser.role === UserRole.ADMIN) {
        content = (
          <UserManagement
            token={token}
            onAddUser={() => setCurrentTab('user-enrollment')}
            onEditUser={(id) => {
              setEditUserId(id);
              setCurrentTab('user-enrollment');
            }}
          />
        );
      } else {
        content = (
          <div className="card-utility text-center space-y-4">
            <h2 className="display-md text-[var(--color-ink)]">Access Denied</h2>
            <p className="lead text-[var(--color-ink-muted-48)]" style={{ fontSize: 21 }}>
              Instructor role does not have authorization to access user management.
            </p>
          </div>
        );
      }
      break;
    case 'user-enrollment':
      content = (
        <UserEnrollment
          token={token}
          userToEdit={editUserId ? { id: editUserId } : null}
          onDone={() => {
            setEditUserId(null);
            setCurrentTab('users');
          }}
          onSaved={() => {}}
        />
      );
      break;
    case 'audit-logs':
      if (currentUser.role === UserRole.ADMIN) {
        content = <AuditLogs token={token} />;
      } else {
        content = (
          <div className="card-utility text-center space-y-4">
            <h2 className="display-md text-[var(--color-ink)]">Access Denied</h2>
            <p className="lead text-[var(--color-ink-muted-48)]" style={{ fontSize: 21 }}>
              Instructor role does not have authorization to view security trails.
            </p>
          </div>
        );
      }
      break;
    default:
      content = <div className="body-strong text-[var(--color-ink-muted-48)]">Content tab "{currentTab}" not found.</div>;
  }

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={(tab) => {
        // Clear sub-page state when changing tabs
        if (tab !== 'students') {
          setActiveStudentId(null);
        }
        if (tab !== 'enrollment') {
          setEditStudentId(null);
        }
        if (tab !== 'user-enrollment') {
          setEditUserId(null);
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
