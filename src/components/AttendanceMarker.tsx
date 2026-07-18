/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Check,
  X,
  Clock,
  Users,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Batch, Student, AttendanceStatus, UserRole } from '../types.js';

interface AttendanceMarkerProps {
  token: string;
  userRole: UserRole;
}

export default function AttendanceMarker({ token, userRole }: AttendanceMarkerProps) {
  const isAdmin = userRole === UserRole.ADMIN;
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [session, setSession] = useState('Regular Practice');

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceStates, setAttendanceStates] = useState<Record<string, AttendanceStatus>>({});

  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoadingBatches(true);
    try {
      const response = await fetch('/api/batches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
        if (data.length > 0) {
          setSelectedBatchId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading batches:', err);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleLoadStudents = async () => {
    if (!selectedBatchId) {
      setError('Please select a batch class to load rolls.');
      return;
    }

    setLoadingStudents(true);
    setError(null);
    setSuccess(null);
    setStudents([]);

    try {
      const params = new URLSearchParams({
        batchId: selectedBatchId,
        status: 'active',
        limit: '100',
      });

      const response = await fetch(`/api/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load students in batch.');
      }

      const data = await response.json();
      setStudents(data.students);

      const attParams = new URLSearchParams({
        date,
        batchId: selectedBatchId,
        session,
      });

      const attResponse = await fetch(`/api/attendance?${attParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const existingRecords = attResponse.ok ? await attResponse.json() : [];
      const recordsMap: Record<string, AttendanceStatus> = {};
      existingRecords.forEach((r: any) => {
        recordsMap[r.studentId] = r.status;
      });

      const initialStates: Record<string, AttendanceStatus> = {};
      data.students.forEach((s: Student) => {
        initialStates[s.id] = recordsMap[s.id] || AttendanceStatus.PRESENT;
      });

      setAttendanceStates(initialStates);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading class student roll.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceStates((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleBulkMark = (status: AttendanceStatus) => {
    const updated = { ...attendanceStates };
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceStates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (students.length === 0) {
      setError('No students loaded to mark attendance for.');
      return;
    }

    setSaving(true);

    try {
      const recordsPayload = Object.entries(attendanceStates).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          batchId: selectedBatchId,
          session: session.trim(),
          records: recordsPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit attendance roster.');
      }

      setSuccess(`Attendance roster submitted successfully! Recorded presence for ${students.length} students on ${date}.`);
    } catch (err: any) {
      setError(err.message || 'Error occurred during attendance submission.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingBatches) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4" id="attendance-loading">
        <div className="spinner" />
        <p className="body-strong text-[var(--color-ink-muted-48)]">Loading schedules...</p>
      </div>
    );
  }

  const selectedBatchObj = batches.find((b) => b.id === selectedBatchId);

  return (
    <div className="space-y-8" id="attendance-marking-workspace">

      {/* Header */}
      <div>
        <h1 className="display-md text-[var(--color-ink)]">Attendance</h1>
        <p className="lead text-[var(--color-ink-muted-48)]" style={{ fontSize: 21 }}>
          Mark daily class attendance for active students.
        </p>
      </div>

      {/* Config Panel */}
      <div className="card-utility space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--color-ink)]" />
          <h3 className="caption-strong text-[var(--color-ink)]">Class Attendance Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-field">Select Karate Class</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="select-field"
              id="attendance-select-batch"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">Attendance Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              id="attendance-date"
            />
          </div>

          <div>
            <label className="label-field">Session Type</label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="input-field"
              placeholder="e.g. Sparring practice, Kata review"
              id="attendance-session"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleLoadStudents}
            disabled={loadingStudents}
            className="btn-primary"
            id="load-students-btn"
          >
            {loadingStudents ? (
              <span className="flex items-center gap-2">
                <div className="spinner border-white/20 border-t-white" />
                Loading...
              </span>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Fetch Student Rolls
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-start gap-3 p-4 border border-[#e60012] rounded-lg bg-[#e60012]/5" id="attendance-error-box">
          <AlertCircle className="w-5 h-5 text-[#e60012] flex-shrink-0 mt-0.5" />
          <span className="caption text-[#e60012]">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 border border-[#059669] rounded-lg bg-[#059669]/5" id="attendance-success-box">
          <CheckCircle className="w-5 h-5 text-[#059669] flex-shrink-0 mt-0.5" />
          <span className="caption text-[#059669]">{success}</span>
        </div>
      )}

      {/* Roster */}
      {students.length > 0 && (
        <div className="card-utility p-0 overflow-hidden" id="attendance-sheet">
          <div className="bg-[var(--color-surface-tile-1)] text-[var(--color-on-dark)] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="tagline text-[var(--color-on-dark)]" style={{ fontSize: 21 }}>{selectedBatchObj?.name}</h4>
              <p className="caption text-[var(--color-body-muted)] mt-1">Class Schedule: {selectedBatchObj?.schedule}</p>
            </div>

            {!isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="caption-strong text-[var(--color-body-muted)] mr-2">Quick Mark:</span>
                <button
                  type="button"
                  onClick={() => handleBulkMark(AttendanceStatus.PRESENT)}
                  className="btn-dark-utility text-xs"
                  id="bulk-present-btn"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark(AttendanceStatus.ABSENT)}
                  className="btn-dark-utility text-xs"
                  id="bulk-absent-btn"
                >
                  All Absent
                </button>
              </div>
            ) : (
              <span className="badge-status" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-body-muted)' }}>
                Read-Only View
              </span>
            )}
          </div>

          <div className="divide-y divide-[var(--color-divider-soft)] max-h-[500px] overflow-y-auto">
            {students.map((student) => {
              const currentStatus = attendanceStates[student.id];
              return (
                <div
                  key={student.id}
                  className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[var(--color-canvas-parchment)] transition-colors"
                  id={`attendance-row-${student.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-canvas-parchment)] text-[var(--color-ink)] flex items-center justify-center body-strong flex-shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1 sm:flex-none">
                      <h5 className="body-strong text-[var(--color-ink)] truncate">{student.name}</h5>
                      <span className="caption text-[var(--color-ink-muted-48)]">{student.currentBelt} Belt</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={isAdmin}
                      onClick={() => !isAdmin && handleStatusChange(student.id, AttendanceStatus.PRESENT)}
                      className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center ${
                        isAdmin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      } ${
                        currentStatus === AttendanceStatus.PRESENT
                          ? 'bg-[#4ade80] text-white border-transparent'
                          : 'bg-[var(--color-canvas)] text-[var(--color-ink-muted-48)] border-[var(--color-hairline)] hover:text-[#4ade80] hover:border-[#4ade80]'
                      }`}
                      title={isAdmin ? 'Present (Read-Only)' : 'Present'}
                      id={`mark-present-${student.id}`}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={isAdmin}
                      onClick={() => !isAdmin && handleStatusChange(student.id, AttendanceStatus.TARDY)}
                      className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center ${
                        isAdmin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      } ${
                        currentStatus === AttendanceStatus.TARDY
                          ? 'bg-[#60a5fa] text-white border-transparent'
                          : 'bg-[var(--color-canvas)] text-[var(--color-ink-muted-48)] border-[var(--color-hairline)] hover:text-[#60a5fa] hover:border-[#60a5fa]'
                      }`}
                      title={isAdmin ? 'Tardy (Read-Only)' : 'Tardy'}
                      id={`mark-tardy-${student.id}`}
                    >
                      <Clock className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={isAdmin}
                      onClick={() => !isAdmin && handleStatusChange(student.id, AttendanceStatus.ABSENT)}
                      className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center ${
                        isAdmin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      } ${
                        currentStatus === AttendanceStatus.ABSENT
                          ? 'bg-[#f87171] text-white border-transparent'
                          : 'bg-[var(--color-canvas)] text-[var(--color-ink-muted-48)] border-[var(--color-hairline)] hover:text-[#f87171] hover:border-[#f87171]'
                      }`}
                      title={isAdmin ? 'Absent (Read-Only)' : 'Absent'}
                      id={`mark-absent-${student.id}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 border-t border-[var(--color-divider-soft)] flex justify-between items-center">
            <span className="caption text-[var(--color-ink-muted-48)]">
              Roster: {students.length} students loaded
            </span>
            {!isAdmin ? (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="btn-primary"
                id="submit-attendance-btn"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="spinner border-white/20 border-t-white" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Submit Attendance
                  </>
                )}
              </button>
            ) : (
              <span className="caption text-[var(--color-ink-muted-48)] italic">
                Viewing roster records in read-only mode.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}