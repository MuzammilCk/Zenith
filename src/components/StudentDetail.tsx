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
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading martial profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center" id="student-detail-error">
        <p className="font-semibold">{error || 'Unable to load student.'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-950 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer"
        >
          Go Back
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
    if (b === BeltRank.WHITE) return 'bg-slate-50 border border-slate-300 text-slate-700';
    if (b === BeltRank.YELLOW) return 'bg-amber-100 text-amber-800 border border-amber-300';
    if (b === BeltRank.ORANGE) return 'bg-orange-100 text-orange-800 border border-orange-300';
    if (b === BeltRank.GREEN) return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    if (b === BeltRank.BLUE) return 'bg-blue-100 text-blue-800 border border-blue-300';
    if (b === BeltRank.PURPLE) return 'bg-purple-100 text-purple-800 border border-purple-300';
    if (b === BeltRank.BROWN) return 'bg-amber-950 text-amber-200 border border-amber-900';
    return 'bg-slate-950 text-white border border-slate-900';
  };

  return (
    <div className="space-y-8" id="student-detail-view">
      {/* Back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors cursor-pointer"
          id="back-to-directory"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>
        <span className="text-xs font-mono text-slate-400">ID: {student.id}</span>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Karate Red Line accent */}
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-red-600" />

        <div className="flex items-center space-x-4 pl-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-red-500 text-2xl font-bold font-mono">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight" id="student-detail-name">{student.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className={`px-2.5 py-0.5 rounded text-xxs font-extrabold uppercase tracking-wider ${getBeltStyle(student.currentBelt)}`}>
                {student.currentBelt} Belt
              </span>
              <span className="px-2.5 py-0.5 rounded text-xxs font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wider">
                {student.batchName}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xxs font-extrabold uppercase tracking-wider ${
                student.status === StudentStatus.ACTIVE
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                  : 'bg-slate-850 text-slate-500 border border-slate-700'
              }`}>
                {student.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-center w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 pl-2 md:pl-0 justify-around">
          <div>
            <span className="block text-xxs font-bold text-slate-400 uppercase tracking-widest">Attendance</span>
            <span className="text-2xl font-extrabold text-emerald-400" id="detail-present-rate">{presentRate}%</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="block text-xxs font-bold text-slate-400 uppercase tracking-widest">Classes</span>
            <span className="text-2xl font-extrabold text-white">{totalClasses}</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="block text-xxs font-bold text-slate-400 uppercase tracking-widest">Promotions</span>
            <span className="text-2xl font-extrabold text-red-500">{student.beltHistory.length}</span>
          </div>
        </div>
      </div>

      {/* Grid: Bento Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Personal profile Details & Attendance Stats */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* Profile Details Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Personal Information</span>
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center space-x-3 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Born: <span className="font-semibold font-mono">{student.dateOfBirth}</span></span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Enrolled: <span className="font-semibold font-mono">{student.joinedDate}</span></span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Activity className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Gender: <span className="font-semibold capitalize">{student.gender}</span></span>
              </div>
            </div>

            {student.notes && (
              <div className="pt-4 border-t border-slate-100 space-y-1.5">
                <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Dojo Sensei Notes</span>
                </span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed italic border border-slate-100">
                  "{student.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Quick Metrics Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-slate-400" />
              <span>Attendance Breakdown</span>
            </h3>

            {totalClasses === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 italic font-medium">No attendance recorded yet</p>
            ) : (
              <div className="space-y-3">
                {/* Present Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Present ({presentCount})</span>
                    <span className="font-bold text-emerald-600">{Math.round((presentCount / totalClasses) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(presentCount / totalClasses) * 100}%` }} />
                  </div>
                </div>

                {/* Tardy Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Tardy ({tardyCount})</span>
                    <span className="font-bold text-blue-500">{Math.round((tardyCount / totalClasses) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: `${(tardyCount / totalClasses) * 100}%` }} />
                  </div>
                </div>

                {/* Absent Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Absent ({absentCount})</span>
                    <span className="font-bold text-red-500">{Math.round((absentCount / totalClasses) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-400 h-full rounded-full" style={{ width: `${(absentCount / totalClasses) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 2 & 3: Historic timelines */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* Belt promotions timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 mb-6 flex items-center space-x-2">
              <Award className="w-4 h-4 text-red-600" />
              <span>Promotional Grading History</span>
            </h3>

            {student.beltHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-xl">
                🛡️ Enrolled with initial {student.currentBelt} Belt rank. No promotion records yet.
              </div>
            ) : (
              <div className="relative border-l border-slate-200 ml-3 space-y-6">
                {student.beltHistory.map((bh) => (
                  <div key={bh.id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-red-600 border border-white" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm flex items-center flex-wrap gap-2">
                          <span>Graded to</span>
                          <span className={`px-2 py-0.5 rounded text-xxs font-extrabold uppercase tracking-wider ${getBeltStyle(bh.newBelt)}`}>
                            {bh.newBelt}
                          </span>
                          <span className="text-slate-400 text-xs font-normal">from {bh.oldBelt}</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Evaluated by: <span className="font-semibold text-slate-700">{bh.promotedBy}</span>
                        </p>
                      </div>
                      <span className="text-xxs font-mono text-slate-400 font-bold">{bh.date}</span>
                    </div>
                    {bh.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-lg mt-2 leading-relaxed">
                        {bh.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance logs timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span>Attendance History Log</span>
            </h3>

            {student.attendanceHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-xl">
                No class attendance recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xxs font-bold uppercase tracking-wider">
                      <th className="py-3">Date</th>
                      <th className="py-3">Session</th>
                      <th className="py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {student.attendanceHistory
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record) => {
                        let statusStyle = 'bg-slate-100 text-slate-700';
                        if (record.status === 'present') {
                          statusStyle = 'bg-emerald-100 text-emerald-800 font-bold';
                        } else if (record.status === 'tardy') {
                          statusStyle = 'bg-blue-100 text-blue-800 font-bold';
                        } else if (record.status === 'absent') {
                          statusStyle = 'bg-red-100 text-red-800 font-bold';
                        }

                        return (
                          <tr key={record.id} className="hover:bg-slate-50/50">
                            <td className="py-3 font-mono text-xs font-bold text-slate-600">{record.date}</td>
                            <td className="py-3 text-slate-600 font-medium">{record.session}</td>
                            <td className="py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xxs uppercase tracking-wider ${statusStyle}`}>
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
