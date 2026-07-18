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
  
  // Create / Edit User state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  
  // Delete confirmation state
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

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    setPassword(''); // Empty means keep unchanged
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

    const payload: any = {
      name,
      email,
      role,
      status,
    };

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

      // Re-fetch users list
      fetchUsers();

      // Close modal on success after brief delay
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
    <div className="space-y-6" id="user-management-module">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-[var(--color-ink)] flex items-center gap-2 tracking-tight">
            <Shield className="w-5 h-5 text-[var(--color-ink)]" />
            USER MANAGEMENT
          </h2>
          <p className="text-[11px] text-[var(--color-ink-soft)] font-bold uppercase mt-1 tracking-wider">
            Create instructor accounts, reset credentials, and manage system authorization.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-[var(--color-amber)] text-[var(--color-carbon)] ui-label text-[11px] px-4 py-2 rounded-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] border-b border-[#a87a27] cursor-pointer self-start sm:self-auto flex items-center gap-2 hover:bg-[#ffbe4d]"
          id="btn-create-user"
        >
          <UserPlus className="w-4 h-4" />
          <span>ADD NEW ACCOUNT</span>
        </button>
      </div>

      {/* Main Panel */}
      <div className="bevel-plate p-1 rounded-sm shadow-sm overflow-hidden border border-[var(--color-chrome-indigo)]">
        {/* Search Header */}
        <div className="p-3 border-b border-[var(--color-chrome-indigo)] bg-[var(--color-canvas)] flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-[var(--color-ink-soft)] absolute left-2 top-1.5" />
            <input
              type="text"
              placeholder="Search by instructor name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 bg-white border border-[var(--color-hairline)] rounded-xs text-[12px] text-[var(--color-ink)] placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)]"
              id="user-search-input"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="px-2 py-1 bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] hover:bg-[var(--color-sky)] rounded-xs text-[var(--color-ink)] hover:text-black transition flex items-center gap-2 ui-label text-[10px] cursor-pointer"
            title="Reload instructor list"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="py-16 text-center bg-[var(--color-platinum)] bevel-inset">
            <Loader className="w-8 h-8 text-[var(--color-primary)] animate-spin mx-auto mb-3" />
            <p className="ui-label text-[11px] text-[var(--color-ink)]">Fetching secure records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-[var(--color-platinum)] bevel-inset">
            <div className="inline-flex p-3 bg-white border border-[var(--color-hairline)] rounded-full mb-3 text-[var(--color-error)]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-[var(--color-ink)]">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-1.5 text-[11px] bg-[var(--color-signal)] text-white ui-label rounded-xs border-b-2 border-[#b86105] hover:bg-[#ff9d38] transition cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
            >
              RETRY
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-[var(--color-ink-soft)] bg-[var(--color-platinum)] bevel-inset">
            <User className="w-12 h-12 text-[var(--color-chrome-indigo)] mx-auto mb-3 opacity-50" />
            <p className="text-[11px] font-bold uppercase tracking-wider">No accounts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[var(--color-platinum)] bevel-inset">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-hairline)] text-[var(--color-ink-soft)] text-[10px] ui-label bg-[var(--color-canvas-soft)]">
                  <th className="py-2 px-4 border-r border-[var(--color-hairline)]">NAME & EMAIL</th>
                  <th className="py-2 px-4 border-r border-[var(--color-hairline)]">ROLE</th>
                  <th className="py-2 px-4 border-r border-[var(--color-hairline)]">STATUS</th>
                  <th className="py-2 px-4 border-r border-[var(--color-hairline)]">CREATED ON</th>
                  <th className="py-2 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-hairline)] text-xs text-[var(--color-ink)]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/40 transition">
                    <td className="py-3 px-4 border-r border-[var(--color-hairline)]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xs bg-[var(--color-canvas)] border border-[var(--color-chrome-indigo)] flex items-center justify-center font-bold text-white shadow-sm font-display">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--color-ink)] leading-none">{u.name}</p>
                          <p className="text-[10px] text-[var(--color-ink-soft)] mt-1 font-mono font-bold">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-r border-[var(--color-hairline)]">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] ui-label ${
                          u.role === UserRole.ADMIN
                            ? 'bg-[var(--color-error)] text-white border border-[#7f1d1d]'
                            : 'bg-[var(--color-canvas)] text-[var(--color-carbon)] border border-[var(--color-chrome-indigo)]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-r border-[var(--color-hairline)]">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-xs ui-label text-[10px] cursor-pointer transition ${
                          u.status === 'inactive'
                            ? 'bg-white text-[var(--color-error)] hover:bg-[#fee2e2] border border-[var(--color-hairline)]'
                            : 'bg-white text-[#15803d] hover:bg-[#dcfce7] border border-[var(--color-hairline)]'
                        }`}
                        title={u.status === 'inactive' ? 'Click to Activate' : 'Click to Disable'}
                      >
                        {u.status === 'inactive' ? (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>DISABLED</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>ACTIVE</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-[10px] font-mono text-[var(--color-ink-soft)] font-bold border-r border-[var(--color-hairline)]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1 hover:bg-white rounded-xs border border-transparent hover:border-[var(--color-hairline)] text-[var(--color-ink-soft)] hover:text-black transition"
                          title="Edit User Info"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirmId(u.id);
                            setDeleteConfirmName(u.name);
                            setDeleteError(null);
                          }}
                          className="p-1 hover:bg-white rounded-xs border border-transparent hover:border-[var(--color-hairline)] text-[var(--color-ink-soft)] hover:text-[var(--color-error)] transition cursor-pointer"
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
        )}
      </div>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bevel-plate rounded-sm shadow-2xl border border-[var(--color-chrome-indigo)] max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-[var(--color-chrome-indigo)] bg-[var(--color-canvas)] flex items-center justify-between">
              <h3 className="ui-label text-[12px] text-[var(--color-ink)] tracking-widest">
                ≡ {modalMode === 'create' ? 'ADD NEW USER ACCOUNT' : 'EDIT USER ACCOUNT'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xs hover:bg-[var(--color-canvas-soft)] text-[var(--color-ink)] transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 bg-[var(--color-platinum)] space-y-4">
              {formError && (
                <div className="p-2 bg-white border border-[var(--color-error)] rounded-xs text-[11px] text-[var(--color-error)] font-bold flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-2 bg-[#dcfce7] border border-[#15803d] rounded-xs text-[11px] text-[#15803d] font-bold flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Name field */}
              <div>
                <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Instructor Sarah"
                  className="w-full px-2 py-1.5 border border-[var(--color-hairline)] rounded-xs text-xs bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              {/* Email field */}
              <div>
                <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="instructor@example.com"
                  className="w-full px-2 py-1.5 border border-[var(--color-hairline)] rounded-xs text-xs bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-1 flex items-center justify-between">
                  <span>{modalMode === 'create' ? 'TEMPORARY PASSWORD' : 'RESET PASSWORD'}</span>
                  {modalMode === 'edit' && (
                    <span className="text-[9px] text-[var(--color-muted-indigo)] normal-case font-normal">
                      Leave blank to keep current
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Key className="w-3 h-3 text-[var(--color-ink-soft)] absolute left-2 top-2" />
                  <input
                    type="password"
                    required={modalMode === 'create'}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={modalMode === 'create' ? 'At least 6 characters' : 'Enter new password to reset'}
                    className="w-full pl-7 pr-2 py-1.5 border border-[var(--color-hairline)] rounded-xs text-xs bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              {/* Role & Status selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-1">
                    USER ROLE
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-2 py-1.5 border border-[var(--color-hairline)] rounded-xs text-xs bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value={UserRole.INSTRUCTOR}>Instructor</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-1">
                    ACCOUNT STATUS
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-2 py-1.5 border border-[var(--color-hairline)] rounded-xs text-xs bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-dotted border-[var(--color-chrome-indigo)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-[var(--color-carbon)] text-white ui-label rounded-xs text-[11px] transition text-center cursor-pointer border border-[var(--color-hairline)]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[var(--color-signal)] text-white ui-label rounded-xs text-[11px] transition text-center disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border-b-2 border-[#b86105] hover:bg-[#ff9d38]"
                >
                  {submitting && <Loader className="w-3 h-3 animate-spin" />}
                  <span>SAVE ACCOUNT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" id="delete-user-modal">
          <div className="bevel-plate rounded-sm shadow-2xl border border-[var(--color-chrome-indigo)] max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-[var(--color-chrome-indigo)] bg-[var(--color-canvas)] flex items-center justify-between">
              <h3 className="ui-label text-[12px] text-[var(--color-ink)] tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[var(--color-error)]" />
                ≡ CONFIRM DELETION
              </h3>
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName('');
                }}
                className="p-1 rounded-xs hover:bg-[var(--color-canvas-soft)] text-[var(--color-ink)] transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 bg-[var(--color-platinum)] space-y-4">
              {deleteError && (
                <div className="p-2 bg-white border border-[var(--color-error)] rounded-xs text-[11px] text-[var(--color-error)] font-bold flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <p className="text-[12px] text-[var(--color-ink)] leading-relaxed">
                Are you sure you want to permanently delete user account <strong className="font-bold">"{deleteConfirmName}"</strong>? This action cannot be undone.
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-dotted border-[var(--color-chrome-indigo)]">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmId(null);
                    setDeleteConfirmName('');
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-[var(--color-carbon)] text-white ui-label rounded-xs text-[11px] transition text-center cursor-pointer border border-[var(--color-hairline)] disabled:opacity-50"
                  id="btn-cancel-delete-user"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-[var(--color-error)] text-white ui-label rounded-xs text-[11px] transition text-center disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border-b-2 border-[#7f1d1d]"
                  id="btn-confirm-delete-user"
                >
                  {deleting && <Loader className="w-3 h-3 animate-spin" />}
                  <span>PERMANENTLY DELETE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
