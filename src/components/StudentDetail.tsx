/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Award,
  User,
  Activity,
  Clock,
  BookOpen,
  CalendarCheck,
} from 'lucide-react';
import { Student, BeltRank, StudentStatus, AttendanceRecord, BeltHistory } from '../types.js';

interface StudentDetailProps {
  token: string;
  studentId: string;
  onBack: () => void;
}

interface DetailedStudent extends Student {
  batchName: string;
  attendanceHistory: AttendanceRecord[];
  beltHistory: BeltHistory[];
}

export default function StudentDetail({ token, studentId, onBack }: StudentDetailProps) {
  const [student, setStudent] = useState<DetailedStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentDetail();
  }, [studentId]);

  const fetchStudentDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to load student details.');
      }
      const data = await response.json();
      setStudent(data);
    } catch (err: any) {
      setError(err.message || 'Error loading profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4" id="student-detail-loading">
        <div className="spinner" />
        <p className="body-strong text-[var(--color-ink-muted-48)]">Loading student profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="card-utility text-center space-y-4" id="student-detail-error">
        <p className="body-strong text-[var(--color-ink)]">{error || 'Unable to load student.'}</p>
        <button onClick={onBack} className="btn-primary">Go Back</button>
      </div>
    );
  }

  const totalClasses = student.attendanceHistory.length;
  const presentCount = student.attendanceHistory.filter((a) => a.status === 'present').length;
  const tardyCount = student.attendanceHistory.filter((a) => a.status === 'tardy').length;
  const absentCount = student.attendanceHistory.filter((a) => a.status === 'absent').length;
  const presentRate = totalClasses > 0 ? Math.round(((presentCount + tardyCount) / totalClasses) * 100) : 100;

  const getBeltStyle = (b: BeltRank) => {
    if (b === BeltRank.WHITE) return 'bg-white border border-[var(--color-hairline)] text-[var(--color-ink)]';
    if (b === BeltRank.YELLOW) return 'bg-[#fbbf24] text-[#451a03]';
    if (b === BeltRank.ORANGE) return 'bg-[#f97316] text-white';
    if (b === BeltRank.GREEN) return 'bg-[#059669] text-white';
    if (b === BeltRank.BLUE) return 'bg-[#2563eb] text-white';
    if (b === BeltRank.PURPLE) return 'bg-[#9333ea] text-white';
    if (b === BeltRank.BROWN) return 'bg-[#92400e] text-[#fef3c7]';
    return 'bg-[var(--color-ink)] text-white';
  };

  return (
    <div className="space-y-8" id="student-detail-view">

      {/* Back link */}
      <button
        onClick={onBack}
        className="text-link flex items-center gap-1.5 body-strong"
        id="back-to-directory"
      >
        <ArrowLeft className="w-4 h-4" />
        Directory
      </button>

      {/* Hero Header Card */}
      <div className="card-utility flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[var(--color-canvas-parchment)] text-[var(--color-ink)] flex items-center justify-center overflow-hidden"
               style={{ fontSize: 36, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
            {student.image ? (
              <img src={student.image} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              student.name.charAt(0)
            )}
          </div>
          <div>
            <h1 className="display-lg text-[var(--color-ink)]" id="student-detail-name" style={{ fontSize: 40 }}>{student.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`badge-belt ${getBeltStyle(student.currentBelt)}`}>{student.currentBelt} Belt</span>
              <span className="badge-status" style={{ backgroundColor: 'var(--color-canvas-parchment)', color: 'var(--color-ink-muted-80)' }}>
                {student.batchName}
              </span>
              <span className={`badge-status ${
                student.status === StudentStatus.ACTIVE
                  ? 'bg-[var(--color-link)]/10 text-[var(--color-link)]'
                  : 'bg-[var(--color-canvas-parchment)] text-[var(--color-ink-muted-48)]'
              }`}>
                {student.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto justify-around md:justify-end">
          <div className="text-center">
            <p className="caption-strong text-[var(--color-ink-muted-48)]">Attendance</p>
            <p className="display-md text-[var(--color-ink)]" style={{ fontSize: 34 }} id="detail-present-rate">{presentRate}%</p>
          </div>
          <div className="text-center">
            <p className="caption-strong text-[var(--color-ink-muted-48)]">Classes</p>
            <p className="display-md text-[var(--color-ink)]" style={{ fontSize: 34 }}>{totalClasses}</p>
          </div>
          <div className="text-center">
            <p className="caption-strong text-[var(--color-ink-muted-48)]">Promotions</p>
            <p className="display-md text-[var(--color-primary)]" style={{ fontSize: 34 }}>{student.beltHistory.length}</p>
          </div>
        </div>
      </div>

      {/* Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Column 1 - Profile & Breakdown */}
        <div className="space-y-4 lg:col-span-1">

          <div className="card-utility">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[var(--color-ink)]" />
              <h3 className="caption-strong text-[var(--color-ink)]">Personal Information</h3>
            </div>
            <div className="space-y-3 caption">
              <div className="flex items-center gap-2 text-[var(--color-ink)]">
                <Mail className="w-4 h-4 text-[var(--color-ink-muted-48)] flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-ink)]">
                <Phone className="w-4 h-4 text-[var(--color-ink-muted-48)] flex-shrink-0" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-ink)]">
                <Calendar className="w-4 h-4 text-[var(--color-ink-muted-48)] flex-shrink-0" />
                <span>Born: <span className="body-strong">{student.dateOfBirth}</span></span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-ink)]">
                <Clock className="w-4 h-4 text-[var(--color-ink-muted-48)] flex-shrink-0" />
                <span>Enrolled: <span className="body-strong">{student.joinedDate}</span></span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-ink)]">
                <Activity className="w-4 h-4 text-[var(--color-ink-muted-48)] flex-shrink-0" />
                <span>Gender: <span className="body-strong capitalize">{student.gender}</span></span>
              </div>
              {student.address && (
                <div className="flex items-center gap-2 text-[var(--color-ink)]">
                  <User className="w-4 h-4 text-[var(--color-ink-muted-48)] flex-shrink-0" />
                  <span className="truncate">{student.address}</span>
                </div>
              )}
              {student.emergencyContactName && (
                <div className="flex items-center gap-2 text-[var(--color-ink)]">
                  <Phone className="w-4 h-4 text-[var(--color-ink-muted-48)] flex-shrink-0" />
                  <span>Emergency: <span className="body-strong">{student.emergencyContactName}</span> {student.emergencyContactPhone && <span className="caption text-[var(--color-ink-muted-48)]">{student.emergencyContactPhone}</span>}</span>
                </div>
              )}
            </div>

            {student.notes && (
              <div className="mt-5 pt-4 border-t border-[var(--color-divider-soft)] space-y-2">
                <span className="caption-strong text-[var(--color-ink-muted-48)] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Dojo Notes
                </span>
                <p className="caption text-[var(--color-ink)] italic bg-[var(--color-canvas-parchment)] p-3 rounded-lg leading-relaxed">
                  "{student.notes}"
                </p>
              </div>
            )}
          </div>

          <div className="card-utility">
            <div className="flex items-center gap-2 mb-4">
              <CalendarCheck className="w-4 h-4 text-[var(--color-ink)]" />
              <h3 className="caption-strong text-[var(--color-ink)]">Attendance Breakdown</h3>
            </div>

            {totalClasses === 0 ? (
              <p className="caption text-[var(--color-ink-muted-48)] text-center py-4 italic">No attendance recorded yet</p>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Present', count: presentCount, color: 'bg-[var(--color-link)]', textColor: 'text-[var(--color-link)]' },
                  { label: 'Tardy', count: tardyCount, color: 'bg-[var(--color-warning)]', textColor: 'text-[var(--color-warning-deep)]' },
                  { label: 'Absent', count: absentCount, color: 'bg-[var(--color-error)]', textColor: 'text-[var(--color-error)]' },
                ].map((row) => (
                  <div key={row.label} className="space-y-1.5">
                    <div className="flex items-center justify-between caption">
                      <span className="body-strong text-[var(--color-ink)]">{row.label} ({row.count})</span>
                      <span className={`body-strong ${row.textColor}`}>{Math.round((row.count / totalClasses) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-divider-soft)] rounded-full overflow-hidden">
                      <div className={`${row.color} h-full rounded-full`} style={{ width: `${(row.count / totalClasses) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2/3 - Timeline & Logs */}
        <div className="space-y-4 lg:col-span-2">

          <div className="card-utility">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-[var(--color-ink)]" />
              <h3 className="caption-strong text-[var(--color-ink)]">Promotional Grading History</h3>
            </div>

            {student.beltHistory.length === 0 ? (
              <p className="caption text-[var(--color-ink-muted-48)] text-center py-6 italic">
                Enrolled with initial {student.currentBelt} Belt rank. No promotion records yet.
              </p>
            ) : (
              <div className="relative border-l border-[var(--color-hairline)] ml-3 space-y-5">
                {student.beltHistory.map((bh) => (
                  <div key={bh.id} className="relative pl-5">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="body-strong text-[var(--color-ink)] flex items-center flex-wrap gap-2">
                          <span>Graded to</span>
                          <span className={`badge-belt ${getBeltStyle(bh.newBelt)}`}>{bh.newBelt}</span>
                          <span className="caption text-[var(--color-ink-muted-48)]">from {bh.oldBelt}</span>
                        </h4>
                        <p className="caption text-[var(--color-ink)] mt-1">
                          Evaluated by: <span className="body-strong text-[var(--color-ink)]">{bh.promotedBy}</span>
                        </p>
                      </div>
                      <span className="fine-print text-[var(--color-ink-muted-48)]">{bh.date}</span>
                    </div>
                    {bh.notes && (
                      <p className="caption text-[var(--color-ink)] bg-[var(--color-canvas-parchment)] p-3 rounded-lg mt-2 leading-relaxed">
                        {bh.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-utility">
            <div className="flex items-center gap-2 mb-4">
              <CalendarCheck className="w-4 h-4 text-[var(--color-ink)]" />
              <h3 className="caption-strong text-[var(--color-ink)]">Attendance History Log</h3>
            </div>

            {student.attendanceHistory.length === 0 ? (
              <p className="caption text-[var(--color-ink-muted-48)] text-center py-6 italic">
                No class attendance recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-apple">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Session</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.attendanceHistory
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record) => {
                        let statusStyle = 'bg-[var(--color-canvas-parchment)] text-[var(--color-ink)]';
                        if (record.status === 'present') statusStyle = 'bg-[var(--color-link)]/15 text-[var(--color-link)]';
                        else if (record.status === 'tardy') statusStyle = 'bg-[var(--color-warning)]/15 text-[var(--color-warning-deep)]';
                        else if (record.status === 'absent') statusStyle = 'bg-[var(--color-error)]/15 text-[var(--color-error)]';

                        return (
                          <tr key={record.id}>
                            <td className="caption-strong text-[var(--color-ink)]">{record.date}</td>
                            <td className="caption text-[var(--color-ink)]">{record.session}</td>
                            <td>
                              <span className={`badge-status ${statusStyle}`}>{record.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}