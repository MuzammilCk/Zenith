/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Search,
  UserPlus,
  Edit2,
  Shield,
  Key,
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
}

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function UserManagement({ token }: UserManagementProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.INSTRUCTOR);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole(UserRole.INSTRUCTOR);
    setStatus('active');
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: ManagedUser) => {
    setModalMode('edit');
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setStatus(user.status || 'active');
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    const payload: any = { name, email, role, status };
    if (modalMode === 'create' || password) {
      payload.password = password;
    }

    try {
      const url = modalMode === 'create' ? '/api/users' : `/api/users/${selectedUser!.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save user account.');
      }

      setFormSuccess(
        modalMode === 'create'
          ? `User "${name}" has been created successfully.`
          : `User "${name}" has been updated successfully.`
      );

      fetchUsers();

      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
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
        <button onClick={handleOpenCreateModal} className="btn-primary" id="btn-create-user">
          <UserPlus className="w-4 h-4 mr-2" />
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
          <AlertCircle className="w-10 h-10 text-[#e60012] mx-auto" />
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
                        <div className="w-10 h-10 rounded-full bg-[var(--color-canvas-parchment)] text-[var(--color-ink)] flex items-center justify-center body-strong">
                          {u.name.charAt(0).toUpperCase()}
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
                            ? 'bg-[#e60012]/10 text-[#e60012] hover:bg-[#e60012]/15'
                            : 'bg-[#059669]/10 text-[#059669] hover:bg-[#059669]/15'
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
                          onClick={() => handleOpenEditModal(u)}
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
                          className="p-2 rounded-full text-[var(--color-ink-muted-48)] hover:text-[#e60012] hover:bg-[#e60012]/10 transition-colors"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="display-md text-[var(--color-ink)]" style={{ fontSize: 28 }}>
                {modalMode === 'create' ? 'Add New User Account' : 'Edit User Account'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon-circular" style={{ width: 36, height: 36 }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body space-y-5">
              {formError && (
                <div className="flex items-start gap-2 p-3 border border-[#e60012] rounded-lg bg-[#e60012]/5">
                  <AlertCircle className="w-5 h-5 text-[#e60012] flex-shrink-0 mt-0.5" />
                  <span className="caption text-[#e60012]">{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-start gap-2 p-3 border border-[#059669] rounded-lg bg-[#059669]/5">
                  <CheckCircle className="w-5 h-5 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span className="caption text-[#059669]">{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="label-field">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Instructor Sarah"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="instructor@example.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field flex items-center justify-between">
                  <span>{modalMode === 'create' ? 'Temporary Password' : 'Reset Password'}</span>
                  {modalMode === 'edit' && (
                    <span className="fine-print text-[var(--color-ink-muted-48)] font-normal">
                      Leave blank to keep current
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[var(--color-ink-muted-48)] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required={modalMode === 'create'}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={modalMode === 'create' ? 'At least 6 characters' : 'Enter new password to reset'}
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">User Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="select-field"
                  >
                    <option value={UserRole.INSTRUCTOR}>Instructor</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>

                <div>
                  <label className="label-field">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="select-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-divider-soft)]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-utility-sm flex-1" style={{ padding: '11px 22px', fontSize: 14 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="spinner border-white/20 border-t-white" />
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Save Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" id="delete-user-modal" onClick={() => { setDeleteConfirmId(null); setDeleteConfirmName(''); }}>
          <div className="modal-content" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="display-md text-[var(--color-ink)] flex items-center gap-2" style={{ fontSize: 28 }}>
                <AlertCircle className="w-6 h-6 text-[#e60012]" />
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
                <div className="flex items-start gap-2 p-3 border border-[#e60012] rounded-lg bg-[#e60012]/5">
                  <AlertCircle className="w-5 h-5 text-[#e60012] flex-shrink-0 mt-0.5" />
                  <span className="caption text-[#e60012]">{deleteError}</span>
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
                  className="btn-danger flex-1"
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