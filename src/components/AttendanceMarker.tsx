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
  ArrowRight,
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
      // Fetch active students enrolled in the selected batch
      const params = new URLSearchParams({
        batchId: selectedBatchId,
        status: 'active',
        limit: '100', // load all batch students
      });

      const response = await fetch(`/api/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load students in batch.');
      }

      const data = await response.json();
      setStudents(data.students);

      // Fetch existing marked records for this date/batch/session to pre-populate
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

      // Initialize status markings
      const initialStates: Record<string, AttendanceStatus> = {};
      data.students.forEach((s: Student) => {
        initialStates[s.id] = recordsMap[s.id] || AttendanceStatus.PRESENT; // default to present if not marked
      });

      setAttendanceStates(initialStates);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading class student roll.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceStates((prev) => ({
      ...prev,
      [studentId]: status,
    }));
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
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Fetching active schedules...</p>
      </div>
    );
  }

  const selectedBatchObj = batches.find((b) => b.id === selectedBatchId);

  return (
    <div className="space-y-8" id="attendance-marking-workspace">
      
      {/* Search & Selection Controls Panel */}
      <div className="bevel-plate-platinum p-4 rounded-sm space-y-4">
        <div className="flex items-center justify-between mb-4 bg-[var(--color-canvas)] text-[var(--color-ink)] px-2 py-1 border-b border-[var(--color-chrome-indigo)]">
          <h3 className="ui-label text-[11px] tracking-widest flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[var(--color-ink)]" />
            <span>≡ CLASS ATTENDANCE CONFIG</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
          {/* Batch Choice */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-wider mb-1">
              Select Karate Class
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-3 py-1.5 border border-[var(--color-hairline)] rounded-xs bg-white focus:outline-none focus:border-[var(--color-primary)] text-xs font-bold text-[var(--color-ink)]"
              id="attendance-select-batch"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Choice */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-wider mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-[var(--color-hairline)] rounded-xs bg-white focus:outline-none focus:border-[var(--color-primary)] text-xs font-bold text-[var(--color-ink)] font-mono"
              id="attendance-date"
            />
          </div>

          {/* Session Description */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-wider mb-1">
              Session Type
            </label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full px-3 py-1.5 border border-[var(--color-hairline)] rounded-xs bg-white focus:outline-none focus:border-[var(--color-primary)] text-xs font-bold text-[var(--color-ink)]"
              placeholder="e.g. Sparring practice, Kata review"
              id="attendance-session"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end px-2">
          <button
            onClick={handleLoadStudents}
            disabled={loadingStudents}
            className="px-4 py-1.5 bg-[var(--color-signal)] hover:bg-[#ff9d38] text-white ui-label text-[11px] rounded-xs flex items-center space-x-2 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border-b-2 border-[#b86105] cursor-pointer"
            id="load-students-btn"
          >
            {loadingStudents ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Users className="w-4 h-4" />
                <span>FETCH STUDENT ROLLS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error / Success Feedback */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-3 text-sm" id="attendance-error-box">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start space-x-3 text-sm" id="attendance-success-box">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Roster Layout Sheet */}
      {students.length > 0 && (
        <div className="bevel-plate-platinum p-3 rounded-sm overflow-hidden" id="attendance-sheet">
          {/* Batch description header */}
          <div className="bg-[var(--color-carbon)] text-white px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-2 border-[var(--color-hairline)] mb-2">
            <div>
              <h4 className="ui-label text-base text-[var(--color-canvas-soft)]">{selectedBatchObj?.name}</h4>
              <p className="text-[10px] text-slate-400 font-medium font-mono mt-0.5">
                Class Schedule: {selectedBatchObj?.schedule}
              </p>
            </div>

            {/* Bulk mark triggers */}
            {!isAdmin ? (
              <div className="flex items-center space-x-2">
                <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest mr-2">Quick Mark:</span>
                <button
                  type="button"
                  onClick={() => handleBulkMark(AttendanceStatus.PRESENT)}
                  className="px-3 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900 rounded text-xxs font-extrabold uppercase hover:bg-emerald-900 hover:text-white transition-all cursor-pointer"
                  id="bulk-present-btn"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark(AttendanceStatus.ABSENT)}
                  className="px-3 py-1 bg-red-950/40 text-red-400 border border-red-900 rounded text-xxs font-extrabold uppercase hover:bg-red-900 hover:text-white transition-all cursor-pointer"
                  id="bulk-absent-btn"
                >
                  All Absent
                </button>
              </div>
            ) : (
              <span className="text-xxs font-bold text-red-400 bg-red-950/40 border border-red-900/50 px-2.5 py-1 rounded uppercase tracking-wider">
                Read-Only View
              </span>
            )}
          </div>

          {/* Student roll list */}
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {students.map((student) => {
              const currentStatus = attendanceStates[student.id];
              return (
                <div
                  key={student.id}
                  className="px-3 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                  id={`attendance-row-${student.id}`}
                >
                  <div className="flex items-center space-x-3 pr-2 min-w-0 w-full sm:w-auto">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200/50 flex-shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1 sm:flex-none">
                      <h5 className="font-bold text-slate-800 text-sm truncate">{student.name}</h5>
                      <span className="text-xxs font-semibold uppercase tracking-wider text-slate-400">
                        {student.currentBelt} Belt
                      </span>
                    </div>
                  </div>

                  {/* Marking Button Group */}
                  <div className="flex items-center space-x-1.5 flex-shrink-0 self-end sm:self-auto">
                    {/* Present */}
                    <button
                      type="button"
                      disabled={isAdmin}
                      onClick={() => !isAdmin && handleStatusChange(student.id, AttendanceStatus.PRESENT)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isAdmin ? 'cursor-not-allowed opacity-85' : 'cursor-pointer'
                      } ${
                        currentStatus === AttendanceStatus.PRESENT
                          ? 'bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-500/15'
                          : 'bg-white text-slate-400 border-slate-200 ' + (!isAdmin ? 'hover:text-emerald-500 hover:bg-emerald-50/30' : '')
                      }`}
                      title={isAdmin ? "Present (Read-Only)" : "Present"}
                      id={`mark-present-${student.id}`}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    {/* Tardy */}
                    <button
                      type="button"
                      disabled={isAdmin}
                      onClick={() => !isAdmin && handleStatusChange(student.id, AttendanceStatus.TARDY)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isAdmin ? 'cursor-not-allowed opacity-85' : 'cursor-pointer'
                      } ${
                        currentStatus === AttendanceStatus.TARDY
                          ? 'bg-blue-400 text-white border-transparent shadow-md shadow-blue-400/15'
                          : 'bg-white text-slate-400 border-slate-200 ' + (!isAdmin ? 'hover:text-blue-500 hover:bg-blue-50/30' : '')
                      }`}
                      title={isAdmin ? "Tardy (Read-Only)" : "Tardy"}
                      id={`mark-tardy-${student.id}`}
                    >
                      <Clock className="w-4 h-4" />
                    </button>

                    {/* Absent */}
                    <button
                      type="button"
                      disabled={isAdmin}
                      onClick={() => !isAdmin && handleStatusChange(student.id, AttendanceStatus.ABSENT)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isAdmin ? 'cursor-not-allowed opacity-85' : 'cursor-pointer'
                      } ${
                        currentStatus === AttendanceStatus.ABSENT
                          ? 'bg-red-400 text-white border-transparent shadow-md shadow-red-400/15'
                          : 'bg-white text-slate-400 border-slate-200 ' + (!isAdmin ? 'hover:text-red-500 hover:bg-red-50/30' : '')
                      }`}
                      title={isAdmin ? "Absent (Read-Only)" : "Absent"}
                      id={`mark-absent-${student.id}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit bar */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xxs font-mono text-slate-400 font-bold uppercase">
              Roster: {students.length} students loaded
            </span>

            {!isAdmin ? (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-red-600/15 disabled:opacity-50 transition-all cursor-pointer"
                id="submit-attendance-btn"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Submit Attendance</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-semibold italic">
                Viewing roster records in read-only mode.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
