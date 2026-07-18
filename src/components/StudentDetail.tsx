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
  AlertTriangle,
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

export default function StudentDetail({
  token,
  studentId,
  onBack,
}: StudentDetailProps) {
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
        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="ui-label text-[11px] text-[var(--color-ink)]">Loading martial profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bevel-plate-platinum border border-[var(--color-error)] text-[var(--color-error)] p-6 rounded-sm text-center" id="student-detail-error">
        <p className="font-bold text-xs">{error || 'Unable to load student.'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-[var(--color-signal)] text-white rounded-xs font-bold text-[11px] ui-label hover:bg-[#ff9d38] border-b-2 border-[#b86105] transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
        >
          GO BACK
        </button>
      </div>
    );
  }

  // Calculate local stats
  const totalClasses = student.attendanceHistory.length;
  const presentCount = student.attendanceHistory.filter((a) => a.status === 'present').length;
  const tardyCount = student.attendanceHistory.filter((a) => a.status === 'tardy').length;
  const absentCount = student.attendanceHistory.filter((a) => a.status === 'absent').length;
  const presentRate = totalClasses > 0 ? Math.round(((presentCount + tardyCount) / totalClasses) * 100) : 100;

  const getBeltStyle = (b: BeltRank) => {
    if (b === BeltRank.WHITE) return 'bg-white border border-[var(--color-hairline)] text-[var(--color-ink)]';
    if (b === BeltRank.YELLOW) return 'bg-[#facc15] text-[var(--color-carbon)] border border-[#a16207]';
    if (b === BeltRank.ORANGE) return 'bg-[#fb923c] text-[var(--color-carbon)] border border-[#c2410c]';
    if (b === BeltRank.GREEN) return 'bg-[#4ade80] text-[var(--color-carbon)] border border-[#15803d]';
    if (b === BeltRank.BLUE) return 'bg-[#60a5fa] text-[var(--color-carbon)] border border-[#1d4ed8]';
    if (b === BeltRank.PURPLE) return 'bg-[#c084fc] text-[var(--color-carbon)] border border-[#7e22ce]';
    if (b === BeltRank.BROWN) return 'bg-[#78350f] text-white border border-[#451a03]';
    return 'bg-[var(--color-carbon)] text-white border border-black';
  };

  return (
    <div className="space-y-8" id="student-detail-view">
      {/* Back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-[var(--color-ink)] hover:text-[var(--color-primary)] ui-label text-[11px] transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-full border border-[var(--color-hairline)]"
          id="back-to-directory"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>BACK TO DIRECTORY</span>
        </button>
        <span className="text-[10px] font-mono text-[var(--color-ink-soft)] bg-white px-2 py-1 rounded-xs border border-[var(--color-hairline)]">ID: {student.id}</span>
      </div>

      {/* Main Student Header Card */}
      <div className="bevel-plate p-4 rounded-sm shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Decorative Circuit/Carbon backdrop can go here, but let's keep it simple with periwinkle chrome */}

        <div className="flex items-center space-x-4 pl-2">
          <div className="w-16 h-16 rounded-xs bg-[var(--color-carbon)] border-2 border-[var(--color-canvas-soft)] flex items-center justify-center text-[var(--color-primary)] text-3xl font-display font-black">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-white text-box-art" id="student-detail-name">{student.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className={`px-2 py-0.5 rounded-xs ui-label text-[10px] ${getBeltStyle(student.currentBelt)}`}>
                {student.currentBelt} Belt
              </span>
              <span className="px-2 py-0.5 rounded-xs ui-label text-[10px] bg-[var(--color-carbon)] text-[var(--color-canvas-soft)] border border-[var(--color-hairline)]">
                {student.batchName}
              </span>
              <span className={`px-2 py-0.5 rounded-xs ui-label text-[10px] ${
                student.status === StudentStatus.ACTIVE
                  ? 'bg-[#4ade80] text-[var(--color-carbon)] border border-[#15803d]'
                  : 'bg-[var(--color-muted-indigo)] text-white border border-[var(--color-chrome-indigo)]'
              }`}>
                {student.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-center w-full md:w-auto border-t md:border-t-0 border-[var(--color-chrome-indigo)] pt-4 md:pt-0 pl-2 md:pl-0 justify-around">
          <div>
            <span className="block ui-label text-[10px] text-[var(--color-ink)]">ATTENDANCE</span>
            <span className="font-display text-2xl font-black text-white text-box-art" id="detail-present-rate">{presentRate}%</span>
          </div>
          <div className="h-8 w-px bg-[var(--color-chrome-indigo)]" />
          <div>
            <span className="block ui-label text-[10px] text-[var(--color-ink)]">CLASSES</span>
            <span className="font-display text-2xl font-black text-white text-box-art">{totalClasses}</span>
          </div>
          <div className="h-8 w-px bg-[var(--color-chrome-indigo)]" />
          <div>
            <span className="block ui-label text-[10px] text-[var(--color-ink)]">PROMOTIONS</span>
            <span className="font-display text-2xl font-black text-[var(--color-primary)] text-box-art">{student.beltHistory.length}</span>
          </div>
        </div>
      </div>

      {/* Grid: Bento Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Column 1: Personal profile Details & Attendance Stats */}
        <div className="space-y-4 lg:col-span-1">
          
          {/* Profile Details Card */}
          <div className="bevel-plate-platinum p-3 rounded-sm space-y-3">
            <div className="flex items-center justify-between mb-2 bg-[var(--color-canvas)] text-[var(--color-ink)] px-2 py-1 border-b border-[var(--color-chrome-indigo)]">
              <h3 className="ui-label text-[11px] tracking-widest flex items-center space-x-2">
                <User className="w-3 h-3 text-[var(--color-ink)]" />
                <span>≡ PERSONAL INFORMATION</span>
              </h3>
            </div>

            <div className="space-y-2 text-xs px-2">
              <div className="flex items-center space-x-2 text-[var(--color-ink)]">
                <Mail className="w-4 h-4 text-[var(--color-ink-soft)] flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-[var(--color-ink)]">
                <Phone className="w-4 h-4 text-[var(--color-ink-soft)] flex-shrink-0" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-[var(--color-ink)]">
                <Calendar className="w-4 h-4 text-[var(--color-ink-soft)] flex-shrink-0" />
                <span>Born: <span className="font-bold font-mono">{student.dateOfBirth}</span></span>
              </div>
              <div className="flex items-center space-x-2 text-[var(--color-ink)]">
                <Clock className="w-4 h-4 text-[var(--color-ink-soft)] flex-shrink-0" />
                <span>Enrolled: <span className="font-bold font-mono">{student.joinedDate}</span></span>
              </div>
              <div className="flex items-center space-x-2 text-[var(--color-ink)]">
                <Activity className="w-4 h-4 text-[var(--color-ink-soft)] flex-shrink-0" />
                <span>Gender: <span className="font-bold capitalize">{student.gender}</span></span>
              </div>
            </div>

            {student.notes && (
              <div className="pt-2 border-t border-dotted border-[var(--color-muted-indigo)] space-y-1.5 px-2">
                <span className="ui-label text-[10px] text-[var(--color-ink-soft)] flex items-center space-x-1">
                  <BookOpen className="w-3 h-3" />
                  <span>DOJO SENSEI NOTES</span>
                </span>
                <p className="text-[11px] text-[var(--color-ink)] bg-white p-2 rounded-xs border border-[var(--color-hairline)] leading-relaxed italic">
                  "{student.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Quick Metrics Breakdown */}
          <div className="bevel-plate-platinum p-3 rounded-sm space-y-3">
            <div className="flex items-center justify-between mb-2 bg-[var(--color-canvas)] text-[var(--color-ink)] px-2 py-1 border-b border-[var(--color-chrome-indigo)]">
              <h3 className="ui-label text-[11px] tracking-widest flex items-center space-x-2">
                <CalendarCheck className="w-3 h-3 text-[var(--color-ink)]" />
                <span>≡ ATTENDANCE BREAKDOWN</span>
              </h3>
            </div>

            {totalClasses === 0 ? (
              <p className="text-[10px] text-[var(--color-ink-soft)] text-center py-2 italic font-bold">No attendance recorded yet</p>
            ) : (
              <div className="space-y-3 px-2">
                {/* Present Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--color-ink)]">Present ({presentCount})</span>
                    <span className="font-bold text-[#15803d]">{Math.round((presentCount / totalClasses) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[var(--color-hairline)]">
                    <div className="bg-[#4ade80] h-full" style={{ width: `${(presentCount / totalClasses) * 100}%` }} />
                  </div>
                </div>

                {/* Tardy Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--color-ink)]">Tardy ({tardyCount})</span>
                    <span className="font-bold text-[#1d4ed8]">{Math.round((tardyCount / totalClasses) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[var(--color-hairline)]">
                    <div className="bg-[#60a5fa] h-full" style={{ width: `${(tardyCount / totalClasses) * 100}%` }} />
                  </div>
                </div>

                {/* Absent Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--color-ink)]">Absent ({absentCount})</span>
                    <span className="font-bold text-[var(--color-error)]">{Math.round((absentCount / totalClasses) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[var(--color-hairline)]">
                    <div className="bg-[var(--color-error)] h-full" style={{ width: `${(absentCount / totalClasses) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 2 & 3: Historic timelines */}
        <div className="space-y-4 lg:col-span-2">
          
          {/* Belt promotions timeline */}
          <div className="bevel-plate-platinum p-3 rounded-sm">
            <div className="flex items-center justify-between mb-4 bg-[var(--color-canvas)] text-[var(--color-ink)] px-2 py-1 border-b border-[var(--color-chrome-indigo)]">
              <h3 className="ui-label text-[11px] tracking-widest flex items-center space-x-2">
                <Award className="w-3 h-3 text-[var(--color-ink)]" />
                <span>≡ PROMOTIONAL GRADING HISTORY</span>
              </h3>
            </div>

            {student.beltHistory.length === 0 ? (
              <div className="text-center py-4 text-[var(--color-ink-soft)] text-xs font-bold border border-dotted border-[var(--color-muted-indigo)] rounded-xs mx-2">
                🛡️ Enrolled with initial {student.currentBelt} Belt rank. No promotion records yet.
              </div>
            ) : (
              <div className="relative border-l border-[var(--color-hairline)] ml-3 space-y-4">
                {student.beltHistory.map((bh) => (
                  <div key={bh.id} className="relative pl-4">
                    {/* Timeline dot */}
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[var(--color-primary)] border border-white" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-[var(--color-ink)] text-xs flex items-center flex-wrap gap-2">
                          <span>Graded to</span>
                          <span className={`px-2 py-0.5 rounded-xs ui-label text-[10px] ${getBeltStyle(bh.newBelt)}`}>
                            {bh.newBelt}
                          </span>
                          <span className="text-[var(--color-ink-soft)] text-[10px] font-normal">from {bh.oldBelt}</span>
                        </h4>
                        <p className="text-[10px] text-[var(--color-ink)] mt-0.5">
                          Evaluated by: <span className="font-bold text-[var(--color-carbon)]">{bh.promotedBy}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-ink-soft)] font-bold">{bh.date}</span>
                    </div>
                    {bh.notes && (
                      <p className="text-[11px] text-[var(--color-ink)] bg-white border border-[var(--color-hairline)] p-2 rounded-xs mt-1.5 leading-relaxed">
                        {bh.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance logs timeline */}
          <div className="bevel-plate-platinum p-3 rounded-sm">
            <div className="flex items-center justify-between mb-2 bg-[var(--color-canvas)] text-[var(--color-ink)] px-2 py-1 border-b border-[var(--color-chrome-indigo)]">
              <h3 className="ui-label text-[11px] tracking-widest flex items-center space-x-2">
                <CalendarCheck className="w-3 h-3 text-[var(--color-ink)]" />
                <span>≡ ATTENDANCE HISTORY LOG</span>
              </h3>
            </div>

            {student.attendanceHistory.length === 0 ? (
              <div className="text-center py-6 text-[var(--color-ink-soft)] text-xs font-bold border border-dotted border-[var(--color-muted-indigo)] rounded-xs mx-2">
                No class attendance recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto px-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-hairline)] text-[var(--color-ink-soft)] ui-label text-[10px]">
                      <th className="py-2">DATE</th>
                      <th className="py-2">SESSION</th>
                      <th className="py-2">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-hairline)]">
                    {student.attendanceHistory
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record) => {
                        let statusStyle = 'bg-white text-[var(--color-ink)] border border-[var(--color-hairline)]';
                        if (record.status === 'present') {
                          statusStyle = 'bg-[#4ade80] text-[var(--color-carbon)] font-bold border border-[#15803d]';
                        } else if (record.status === 'tardy') {
                          statusStyle = 'bg-[#60a5fa] text-[var(--color-carbon)] font-bold border border-[#1d4ed8]';
                        } else if (record.status === 'absent') {
                          statusStyle = 'bg-[var(--color-error)] text-white font-bold border border-[#7f1d1d]';
                        }

                        return (
                          <tr key={record.id} className="hover:bg-white/50">
                            <td className="py-2 font-mono text-[10px] font-bold text-[var(--color-ink)]">{record.date}</td>
                            <td className="py-2 text-[var(--color-ink)] font-bold">{record.session}</td>
                            <td className="py-2">
                              <span className={`inline-flex px-2 py-0.5 rounded-xs ui-label text-[10px] ${statusStyle}`}>
                                {record.status}
                              </span>
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
