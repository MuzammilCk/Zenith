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

export default function StudentForm({
  token,
  studentToEdit,
  onClose,
  onSaveSuccess,
}: StudentFormProps) {
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
          setBatchId(data[0].id); // default selection
        }
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Frontend validations
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
        ...(!studentToEdit && { currentBelt }), // Belt rank only mutable on creation, promotions handled via Promotion flow
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40" id="student-form-overlay">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <h3 className="font-bold text-lg" id="student-form-title">
            {studentToEdit ? 'Edit Student Profile' : 'Enroll New Student'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            id="close-student-form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6" id="student-form">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-3 text-sm" id="form-validation-error">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                placeholder="Miyagi Chojun"
                id="input-student-name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                placeholder="miyagi@dojo.com"
                id="input-student-email"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                placeholder="555-0155"
                id="input-student-phone"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all font-mono"
                id="input-student-dob"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                id="input-student-gender"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Batch Assignment */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Batch Class
              </label>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                id="input-student-batch"
              >
                <option value="" disabled>Select a Class Batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.schedule})
                  </option>
                ))}
              </select>
            </div>

            {/* Starting Belt Rank (Only on create) */}
            {!studentToEdit && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Starting Belt Rank
                </label>
                <select
                  value={currentBelt}
                  onChange={(e: any) => setCurrentBelt(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
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

            {/* Enrollment Date */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Joined Date
              </label>
              <input
                type="date"
                required
                value={joinedDate}
                onChange={(e) => setJoinedDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all font-mono"
                id="input-student-joined"
              />
            </div>

            {/* Active Status (Only on edit) */}
            {studentToEdit && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                  id="input-student-status"
                >
                  <option value={StudentStatus.ACTIVE}>Active</option>
                  <option value={StudentStatus.INACTIVE}>Inactive</option>
                </select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Dojo Notes / Injury History
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
              placeholder="Write anything important about training progress or physical conditions here..."
              rows={3}
              id="input-student-notes"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
              id="cancel-student-form"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-red-600/15 disabled:opacity-50 transition-all cursor-pointer"
              id="submit-student-form"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
