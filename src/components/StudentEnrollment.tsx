/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Save,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { Student, Batch, BeltRank, StudentStatus, UserRole } from '../types.js';

interface StudentEnrollmentProps {
  token: string;
  studentToEdit?: Student | null;
  onDone: () => void;
  onSaved?: () => void;
  currentUserRole?: UserRole;
  assignedBatchIds?: string[];
}

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

const FIELD_ERROR = 'text-[var(--color-error)]';

export default function StudentEnrollment({
  token,
  studentToEdit,
  onDone,
  onSaved,
  currentUserRole,
  assignedBatchIds,
}: StudentEnrollmentProps) {
  const isEdit = Boolean(studentToEdit);
  const [batches, setBatches] = useState<Batch[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [currentBelt, setCurrentBelt] = useState<BeltRank>(BeltRank.WHITE);
  const [status, setStatus] = useState<StudentStatus>(StudentStatus.ACTIVE);
  const [batchId, setBatchId] = useState('');
  const [joinedDate, setJoinedDate] = useState(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');

  const [image, setImage] = useState<string | undefined>(undefined);
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBatches();
    if (!studentToEdit) return;

    // If a full record was passed, hydrate directly.
    if (studentToEdit.name) {
      hydrate(studentToEdit);
      return;
    }

    // Otherwise fetch the full record by id (edit flow from the directory).
    (async () => {
      try {
        const response = await fetch(`/api/students/${studentToEdit.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          hydrate((await response.json()) as Student);
        }
      } catch (err) {
        console.error('Error loading student for edit:', err);
      }
    })();
  }, [studentToEdit]);

  const hydrate = (s: Student) => {
    setName(s.name);
    setEmail(s.email);
    setPhone(s.phone);
    setDateOfBirth(s.dateOfBirth);
    setGender(s.gender);
    setCurrentBelt(s.currentBelt);
    setStatus(s.status);
    setBatchId(s.batchId);
    setJoinedDate(s.joinedDate);
    setNotes(s.notes || '');
    setImage(s.image);
    setAddress(s.address || '');
    setEmergencyContactName(s.emergencyContactName || '');
    setEmergencyContactPhone(s.emergencyContactPhone || '');
    setMedicalNotes(s.medicalNotes || '');
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data: Batch[] = await response.json();
        // Instructors may only enroll students into their assigned batches.
        const visible =
          currentUserRole === UserRole.ADMIN || !assignedBatchIds
            ? data
            : data.filter((b) => assignedBatchIds.includes(b.id));
        setBatches(visible);
        if (visible.length > 0 && !studentToEdit && !batchId) {
          setBatchId(visible[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
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

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name || name.trim().length < 2) next.name = 'Student name must be at least 2 characters.';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Please enter a valid email address.';
    if (!phone || phone.trim().length < 5) next.phone = 'Please enter a valid phone number.';
    if (!dateOfBirth) next.dateOfBirth = 'Date of birth is required.';
    if (!batchId) next.batchId = 'Batch assignment is required.';
    if (!joinedDate) next.joinedDate = 'Joined date is required.';
    if (emergencyContactName && !emergencyContactPhone)
      next.emergencyContactPhone = 'Add a phone number for the emergency contact.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaved(false);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/students/${studentToEdit!.id}` : '/api/students';

      const payload: Record<string, any> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth,
        gender,
        status,
        batchId,
        joinedDate,
        notes: notes.trim(),
        address: address.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        medicalNotes: medicalNotes.trim(),
        image: image ?? '',
        ...(!isEdit && { currentBelt }),
      };

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
        throw new Error(data.error || 'Failed to save student record.');
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
    <div className="space-y-6" id="enrollment-view">
      {/* Header */}
      <section className="hero-panel">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="pill-chip">{isEdit ? 'Edit student profile' : 'New enrollment'}</p>
            <h1 className="display-lg mt-3 text-[var(--color-ink)]">
              {isEdit ? 'Update Enrollment' : 'Student Enrollment'}
            </h1>
            <p className="lead mt-3 text-[var(--color-ink-muted-48)]" style={{ fontSize: 21 }}>
              Capture every detail that helps instructors train, support, and keep each student safe.
            </p>
          </div>
          <button onClick={onDone} className="btn-utility-sm" id="enrollment-cancel-top">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Directory
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]" id="enrollment-form">
        {/* Left: Portrait */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="card-utility flex flex-col items-center text-center">
            <p className="caption-strong mb-4 self-start text-[var(--color-ink)]">Student Portrait</p>
            <div className="relative">
              <div
                className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-[var(--color-hairline)] bg-[var(--color-canvas-parchment)] text-[var(--color-ink-muted-48)]"
                style={{ boxShadow: 'rgba(0,0,0,0.12) 0px 8px 30px' }}
              >
                {image ? (
                  <img src={image} alt="Student portrait preview" className="h-full w-full object-cover" />
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
                  id="remove-photo-btn"
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
              id="photo-input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-utility-sm mt-5"
              id="choose-photo-btn"
            >
              <Camera className="mr-1.5 h-4 w-4" />
              {image ? 'Replace Photo' : 'Add Photo'}
            </button>
            <p className="caption mt-3 text-[var(--color-ink-muted-48)]">
              JPG, PNG or WebP. Square crops best. Stored privately with the record.
            </p>
            {errors.image && <p className={`caption mt-2 ${FIELD_ERROR}`}>{errors.image}</p>}
          </div>
        </aside>

        {/* Right: Form sections */}
        <div className="space-y-6">
          {formError && (
            <div className="flex items-start gap-2 rounded-lg border border-[var(--color-error)] bg-[var(--color-error)]/5 p-3" id="form-validation-error">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-error)]" />
              <span className="caption text-[var(--color-error)]">{formError}</span>
            </div>
          )}

          {saved && (
            <div className="flex items-start gap-2 rounded-lg border border-[var(--color-link)] bg-[var(--color-link)]/10 p-3" id="form-success">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-link)]" />
              <span className="caption text-[var(--color-link)]">
                {isEdit ? 'Profile updated successfully.' : 'Student enrolled successfully.'}
              </span>
            </div>
          )}

          {/* Personal Details */}
          <section className="card-utility">
            <h2 className="caption-strong mb-5 text-[var(--color-ink)]">Personal Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label-field">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Miyagi Chojun"
                  id="input-student-name"
                />
                {errors.name && <p className={`caption mt-1.5 ${FIELD_ERROR}`}>{errors.name}</p>}
              </div>

              <div>
                <label className="label-field">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="miyagi@dojo.com"
                  id="input-student-email"
                />
                {errors.email && <p className={`caption mt-1.5 ${FIELD_ERROR}`}>{errors.email}</p>}
              </div>

              <div>
                <label className="label-field">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  placeholder="555-0155"
                  id="input-student-phone"
                />
                {errors.phone && <p className={`caption mt-1.5 ${FIELD_ERROR}`}>{errors.phone}</p>}
              </div>

              <div>
                <label className="label-field">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="input-field"
                  id="input-student-dob"
                />
                {errors.dateOfBirth && <p className={`caption mt-1.5 ${FIELD_ERROR}`}>{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="label-field">Gender</label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="select-field"
                  id="input-student-gender"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="label-field">Home Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  placeholder="123 Tranquility Lane, Okinawa"
                  id="input-student-address"
                />
              </div>
            </div>
          </section>

          {/* Enrollment */}
          <section className="card-utility">
            <h2 className="caption-strong mb-5 text-[var(--color-ink)]">Enrollment</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Class Batch</label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="select-field"
                  id="input-student-batch"
                >
                  <option value="" disabled>
                    Select a Class
                  </option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.schedule})
                    </option>
                  ))}
                </select>
                {errors.batchId && <p className={`caption mt-1.5 ${FIELD_ERROR}`}>{errors.batchId}</p>}
              </div>

              {!isEdit && (
                <div>
                  <label className="label-field">Starting Belt Rank</label>
                  <select
                    value={currentBelt}
                    onChange={(e: any) => setCurrentBelt(e.target.value)}
                    className="select-field"
                    id="input-student-belt"
                  >
                    {Object.values(BeltRank).map((belt) => (
                      <option key={belt} value={belt}>
                        {belt} Belt
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="label-field">Joined Date</label>
                <input
                  type="date"
                  value={joinedDate}
                  onChange={(e) => setJoinedDate(e.target.value)}
                  className="input-field"
                  id="input-student-joined"
                />
                {errors.joinedDate && <p className={`caption mt-1.5 ${FIELD_ERROR}`}>{errors.joinedDate}</p>}
              </div>

              {isEdit && (
                <div>
                  <label className="label-field">Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="select-field"
                    id="input-student-status"
                  >
                    <option value={StudentStatus.ACTIVE}>Active</option>
                    <option value={StudentStatus.INACTIVE}>Inactive</option>
                  </select>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="label-field">Dojo Notes / Training History</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical', minHeight: 90 }}
                  placeholder="Progress, strengths, or anything the instructor should know..."
                  rows={3}
                  id="input-student-notes"
                />
              </div>
            </div>
          </section>

          {/* Emergency & Medical */}
          <section className="card-utility">
            <h2 className="caption-strong mb-1 text-[var(--color-ink)]">Emergency &amp; Medical</h2>
            <p className="caption mb-5 text-[var(--color-ink-muted-48)]">
              Kept on file so instructors can respond quickly if needed.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Emergency Contact Name</label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="input-field"
                  placeholder="Parent or guardian"
                  id="input-emergency-name"
                />
              </div>

              <div>
                <label className="label-field">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="input-field"
                  placeholder="555-0199"
                  id="input-emergency-phone"
                />
                {errors.emergencyContactPhone && (
                  <p className={`caption mt-1.5 ${FIELD_ERROR}`}>{errors.emergencyContactPhone}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="label-field">Medical Notes / Allergies</label>
                <textarea
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical', minHeight: 80 }}
                  placeholder="Allergies, injuries, conditions instructors should be aware of..."
                  rows={3}
                  id="input-medical-notes"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onDone} className="btn-utility-sm" id="enrollment-cancel-bottom">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary" id="submit-student-form">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="spinner border-white/20 border-t-white" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? 'Save Changes' : 'Enroll Student'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
