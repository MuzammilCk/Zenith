/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  Key,
  Shield,
  X,
  Camera,
} from 'lucide-react';
import { UserRole } from '../types.js';

// Resize + compress an image file to a compact base64 data URL so it can live
// comfortably inside the JSON file database.
function fileToDataUrl(file: File, maxDim = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('The selected file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface UserEnrollmentProps {
  token: string;
  userToEdit?: { id: string } | null;
  onDone: () => void;
  onSaved?: () => void;
}

const FIELD_ERROR = 'text-[var(--color-error)]';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  image?: string;
}

export default function UserEnrollment({
  token,
  userToEdit,
  onDone,
  onSaved,
}: UserEnrollmentProps) {
  const isEdit = Boolean(userToEdit);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.INSTRUCTOR);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [image, setImage] = useState<string | undefined>(undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userToEdit) return;
    (async () => {
      try {
        const response = await fetch(`/api/users/${userToEdit.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const u = (await response.json()) as ManagedUser;
          setName(u.name);
          setEmail(u.email);
          setRole(u.role);
          setStatus(u.status || 'active');
          setImage(u.image);
        }
      } catch (err) {
        console.error('Error loading user for edit:', err);
      }
    })();
  }, [userToEdit, token]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name || name.trim().length < 2) next.name = 'Full name must be at least 2 characters.';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Please enter a valid email address.';
    if (!isEdit && (!password || password.length < 6))
      next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be under 5MB.' }));
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setImage(dataUrl);
      setErrors((prev) => ({ ...prev, image: '' }));
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, image: err.message || 'Could not process image.' }));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaved(false);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/users/${userToEdit!.id}` : '/api/users';

      const payload: Record<string, any> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        status,
        image: image ?? '',
      };
      if (!isEdit || password) {
        payload.password = password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save user account.');
      }

      setSaved(true);
      onSaved?.();
      setTimeout(() => onDone(), 650);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred during save.');
    } finally {
      setSubmitting(false);
    }
  };

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6" id="user-enrollment-view">
      {/* Header */}
      <section className="hero-panel">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="pill-chip">{isEdit ? 'Edit user account' : 'New account'}</p>
            <h1 className="display-lg mt-3 text-[var(--color-ink)]">
              {isEdit ? 'Update Account' : 'Add New Account'}
            </h1>
            <p className="lead mt-3 text-[var(--color-ink-muted-48)]" style={{ fontSize: 21 }}>
              Create instructor and admin accounts, set roles, and manage authorization from one calm workspace.
            </p>
          </div>
          <button onClick={onDone} className="btn-utility-sm" id="user-enrollment-cancel-top">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Users
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]" id="user-enrollment-form">
        {/* Left: Avatar */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="card-utility flex flex-col items-center text-center">
            <p className="caption-strong mb-4 self-start text-[var(--color-ink)]">Account Identity</p>
            <div className="relative">
              <div
                className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-[var(--color-hairline)] bg-[var(--color-canvas-parchment)] text-[var(--color-ink-muted-48)]"
                style={{ boxShadow: 'rgba(0,0,0,0.12) 0px 8px 30px' }}
              >
                {image ? (
                  <img src={image} alt="Account avatar preview" className="h-full w-full object-cover" />
                ) : initials ? (
                  <span className="display-md text-[var(--color-ink)]" style={{ fontSize: 44 }}>
                    {initials}
                  </span>
                ) : (
                  <UserIcon className="h-14 w-14" />
                )}
              </div>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage(undefined)}
                  className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-ink)] text-white transition-transform active:scale-95"
                  title="Remove photo"
                  id="user-remove-photo-btn"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="user-photo-input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-utility-sm mt-5"
              id="user-choose-photo-btn"
            >
              <Camera className="mr-1.5 h-4 w-4" />
              {image ? 'Replace Photo' : 'Add Photo'}
            </button>
            <p className="caption mt-3 text-[var(--color-ink-muted-48)]">
              JPG, PNG or WebP. Square crops best. Stored privately with the account.
            </p>
            {errors.image && <p className={`caption mt-2 ${FIELD_ERROR}`}>{errors.image}</p>}
          </div>
        </aside>

        {/* Right: Form sections */}
        <div className="space-y-6">
          {formError && (
            <div className="flex items-start gap-2 rounded-lg border border-[var(--color-error)] bg-[var(--color-error)]/5 p-3" id="user-form-validation-error">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-error)]" />
              <span className="caption text-[var(--color-error)]">{formError}</span>
            </div>
          )}

          {saved && (
            <div className="flex items-start gap-2 rounded-lg border border-[var(--color-link)] bg-[var(--color-link)]/10 p-3" id="user-form-success">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-link)]" />
              <span className="caption text-[var(--color-link)]">
                {isEdit ? 'Account updated successfully.' : 'Account created successfully.'}
              </span>
            </div>
          )}

          {/* Account Details */}
          <section className="card-utility">
            <h2 className="caption-strong mb-5 text-[var(--color-ink)]">Account Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label-field">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Instructor Sarah"
                  id="input-user-name"
                />
                {errors.name && <p className={`caption mt-1.5 ${FIELD_ERROR}`}>{errors.name}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="label-field">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="instructor@example.com"
                  id="input-user-email"
                />
                {errors.email && <p className={`caption mt-1.5 ${FIELD_ERROR}`}>{errors.email}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="label-field flex items-center justify-between">
                  <span>{isEdit ? 'Reset Password' : 'Temporary Password'}</span>
                  {isEdit && (
                    <span className="fine-print text-[var(--color-ink-muted-48)] font-normal">
                      Leave blank to keep current
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-muted-48)]" />
                  <input
                    type="password"
                    required={!isEdit}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEdit ? 'Enter new password to reset' : 'At least 6 characters'}
                    className="input-field pl-11"
                    id="input-user-password"
                  />
                </div>
                {errors.password && <p className={`caption mt-1.5 ${FIELD_ERROR}`}>{errors.password}</p>}
              </div>
            </div>
          </section>

          {/* Authorization */}
          <section className="card-utility">
            <h2 className="caption-strong mb-1 text-[var(--color-ink)]">Authorization</h2>
            <p className="caption mb-5 text-[var(--color-ink-muted-48)]">
              Define what this account can access across the dojo portal.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="select-field"
                  id="input-user-role"
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
                  id="input-user-status"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onDone} className="btn-utility-sm" id="user-enrollment-cancel-bottom">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary" id="submit-user-form">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="spinner border-white/20 border-t-white" />
                  Saving...
                </span>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  {isEdit ? 'Save Changes' : 'Create Account'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
