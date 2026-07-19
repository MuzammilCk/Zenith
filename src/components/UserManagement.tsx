/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Search,
  Edit2,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  Loader,
  RefreshCw,
  X,
} from 'lucide-react';
import { UserRole } from '../types.js';

interface UserManagementProps {
  token: string;
  onAddUser: () => void;
  onEditUser: (id: string) => void;
}

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function UserManagement({ token, onAddUser, onEditUser }: UserManagementProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve user accounts.');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleToggleStatus = async (user: ManagedUser) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update user status.');
      }

      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/users/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete user account.');
      }

      setUsers(users.filter(u => u.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setDeleteConfirmName('');
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8" id="user-management-module">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="display-md text-[var(--color-ink)]">User Administration</h1>
          <p className="lead text-[var(--color-ink-muted-48)]" style={{ fontSize: 21 }}>
            Create instructor accounts, reset credentials, and manage authorization.
          </p>
        </div>
        <button onClick={onAddUser} className="btn-primary" id="btn-create-user">
          Add New Account
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-ink-muted-48)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-pill w-full pl-11"
            id="user-search-input"
          />
        </div>
        <button onClick={fetchUsers} className="btn-utility-sm" title="Reload instructor list">
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
          <p className="body-strong text-[var(--color-ink-muted-48)]">Fetching secure records...</p>
        </div>
      ) : error ? (
        <div className="card-utility text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-[var(--color-error)] mx-auto" />
          <p className="body-strong text-[var(--color-ink)]">{error}</p>
          <button onClick={fetchUsers} className="btn-primary">Retry</button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card-utility py-16 text-center space-y-3">
          <User className="w-12 h-12 text-[var(--color-ink-muted-48)] mx-auto" />
          <p className="display-md text-[var(--color-ink)]" style={{ fontSize: 28 }}>No Accounts Found</p>
          <p className="caption text-[var(--color-ink-muted-48)]">Create one to get started.</p>
        </div>
      ) : (
        <div className="card-utility p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-apple">
              <thead>
                <tr>
                  <th>Name & Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-canvas-parchment)] text-[var(--color-ink)] flex items-center justify-center body-strong overflow-hidden">
                          {u.image ? (
                            <img src={u.image} alt={u.name} className="h-full w-full object-cover" />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="body-strong text-[var(--color-ink)]">{u.name}</p>
                          <p className="caption text-[var(--color-ink-muted-48)]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-status ${
                        u.role === UserRole.ADMIN
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          : 'bg-[var(--color-canvas-parchment)] text-[var(--color-ink-muted-80)]'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`badge-status cursor-pointer transition-colors ${
                          u.status === 'inactive'
                            ? 'bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/15'
                            : 'bg-[var(--color-link)]/10 text-[var(--color-link)] hover:bg-[var(--color-link)]/15'
                        }`}
                        title={u.status === 'inactive' ? 'Click to Activate' : 'Click to Disable'}
                      >
                        {u.status === 'inactive' ? (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Disabled
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        )}
                      </button>
                    </td>
                    <td className="caption text-[var(--color-ink-muted-48)]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditUser(u.id)}
                          className="p-2 rounded-full text-[var(--color-ink-muted-48)] hover:text-[var(--color-primary)] hover:bg-[var(--color-canvas-parchment)] transition-colors"
                          title="Edit User Info"
                          id={`btn-edit-user-${u.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirmId(u.id);
                            setDeleteConfirmName(u.name);
                            setDeleteError(null);
                          }}
                          className="p-2 rounded-full text-[var(--color-ink-muted-48)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
                          title="Delete User Account"
                          id={`btn-delete-user-${u.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" id="delete-user-modal" onClick={() => { setDeleteConfirmId(null); setDeleteConfirmName(''); }}>
          <div className="modal-content" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="display-md text-[var(--color-ink)] flex items-center gap-2" style={{ fontSize: 28 }}>
                <AlertCircle className="w-6 h-6 text-[var(--color-error)olor-error)]" />
                Confirm Deletion
              </h2>
              <button
                onClick={() => { setDeleteConfirmId(null); setDeleteConfirmName(''); }}
                className="btn-icon-circular"
                style={{ width: 36, height: 36 }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body space-y-5">
              {deleteError && (
                <div className="flex items-start gap-2 p-3 border border-[var(--color-error)] rounded-lg bg-[var(--color-error)]/5">
                  <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
                  <span className="caption text-[var(--color-error)]">{deleteError}</span>
                </div>
              )}

              <p className="caption text-[var(--color-ink)] leading-relaxed">
                Are you sure you want to permanently delete user account <span className="body-strong">{deleteConfirmName}</span>? This action cannot be undone.
              </p>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-divider-soft)]">
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmId(null); setDeleteConfirmName(''); }}
                  disabled={deleting}
                  className="btn-utility-sm flex-1"
                  style={{ padding: '11px 22px', fontSize: 14 }}
                  id="btn-cancel-delete-user"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="btn-dark-utility flex-1"
                  id="btn-confirm-delete-user"
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="spinner border-white/20 border-t-white" />
                      Deleting...
                    </span>
                  ) : (
                    'Permanently Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}