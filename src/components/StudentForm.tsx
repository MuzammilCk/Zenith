/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Student, Batch, BeltRank, StudentStatus } from '../types.js';

interface StudentFormProps {
  token: string;
  studentToEdit?: Student | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function StudentForm({ token, studentToEdit, onClose, onSaveSuccess }: StudentFormProps) {
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

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBatches();
    if (studentToEdit) {
      setName(studentToEdit.name);
      setEmail(studentToEdit.email);
      setPhone(studentToEdit.phone);
      setDateOfBirth(studentToEdit.dateOfBirth);
      setGender(studentToEdit.gender);
      setCurrentBelt(studentToEdit.currentBelt);
      setStatus(studentToEdit.status);
      setBatchId(studentToEdit.batchId);
      setJoinedDate(studentToEdit.joinedDate);
      setNotes(studentToEdit.notes || '');
    }
  }, [studentToEdit]);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
        if (data.length > 0 && !studentToEdit) {
          setBatchId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || name.trim().length < 2) {
      setFormError('Student name must be at least 2 characters.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!phone || phone.trim().length < 5) {
      setFormError('Please enter a valid phone number.');
      return;
    }
    if (!dateOfBirth) {
      setFormError('Date of birth is required.');
      return;
    }
    if (!batchId) {
      setFormError('Batch assignment is required.');
      return;
    }
    if (!joinedDate) {
      setFormError('Joined date is required.');
      return;
    }

    setSubmitting(true);

    try {
      const method = studentToEdit ? 'PUT' : 'POST';
      const url = studentToEdit ? `/api/students/${studentToEdit.id}` : '/api/students';

      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth,
        gender,
        status,
        batchId,
        joinedDate,
        notes: notes.trim(),
        ...(!studentToEdit && { currentBelt }),
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

      onSaveSuccess();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred during save.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" id="student-form-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="display-md text-[var(--color-ink)]" style={{ fontSize: 28 }} id="student-form-title">
            {studentToEdit ? 'Edit Student Profile' : 'Enroll New Student'}
          </h2>
          <button onClick={onClose} className="btn-icon-circular" style={{ width: 36, height: 36 }} id="close-student-form">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-5" id="student-form">
          {formError && (
            <div className="flex items-start gap-2 p-3 border border-[#e60012] rounded-lg bg-[#e60012]/5" id="form-validation-error">
              <AlertCircle className="w-5 h-5 text-[#e60012] flex-shrink-0 mt-0.5" />
              <span className="caption text-[#e60012]">{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Miyagi Chojun"
                id="input-student-name"
              />
            </div>

            <div>
              <label className="label-field">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="miyagi@dojo.com"
                id="input-student-email"
              />
            </div>

            <div>
              <label className="label-field">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="555-0155"
                id="input-student-phone"
              />
            </div>

            <div>
              <label className="label-field">Date of Birth</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="input-field"
                id="input-student-dob"
              />
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

            <div>
              <label className="label-field">Class Batch</label>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="select-field"
                id="input-student-batch"
              >
                <option value="" disabled>Select a Class</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.schedule})</option>
                ))}
              </select>
            </div>

            {!studentToEdit && (
              <div>
                <label className="label-field">Starting Belt Rank</label>
                <select
                  value={currentBelt}
                  onChange={(e: any) => setCurrentBelt(e.target.value)}
                  className="select-field"
                  id="input-student-belt"
                >
                  {Object.values(BeltRank).map((belt) => (
                    <option key={belt} value={belt}>{belt} Belt</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="label-field">Joined Date</label>
              <input
                type="date"
                required
                value={joinedDate}
                onChange={(e) => setJoinedDate(e.target.value)}
                className="input-field"
                id="input-student-joined"
              />
            </div>

            {studentToEdit && (
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
          </div>

          <div>
            <label className="label-field">Dojo Notes / Injury History</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical', minHeight: 90 }}
              placeholder="Write anything important about training progress or physical conditions here..."
              rows={3}
              id="input-student-notes"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-divider-soft)]">
            <button type="button" onClick={onClose} className="btn-utility-sm" style={{ padding: '11px 22px', fontSize: 14 }} id="cancel-student-form">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary" id="submit-student-form">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="spinner border-white/20 border-t-white" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}