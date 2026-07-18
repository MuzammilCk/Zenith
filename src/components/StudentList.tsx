/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Award,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Student, Batch, BeltRank, StudentStatus, UserRole } from '../types.js';
import StudentForm from './StudentForm.js';
import BeltPromoter from './BeltPromoter.js';

interface StudentListProps {
  token: string;
  userRole: UserRole;
  onViewStudent: (studentId: string) => void;
}

export default function StudentList({
  token,
  userRole,
  onViewStudent,
}: StudentListProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedBelt, setSelectedBelt] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modals / Overlay states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToPromote, setStudentToPromote] = useState<Student | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, search, selectedBelt, selectedBatch, selectedStatus, sortBy, order]);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      }
    } catch (err) {
      console.error('Error loading batches:', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '8',
        sortBy,
        order,
        ...(search && { q: search }),
        ...(selectedBelt && { belt: selectedBelt }),
        ...(selectedBatch && { batchId: selectedBatch }),
        ...(selectedStatus && { status: selectedStatus }),
      });

      const response = await fetch(`/api/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load students directory.');
      }

      const data = await response.json();
      setStudents(data.students);
      setTotalPages(data.pagination.pages);
      setTotalRecords(data.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (student: Student) => {
    if (userRole !== UserRole.ADMIN) {
      alert('Unauthorized. Only Admin Sensei can delete student records.');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ WARNING: Are you sure you want to completely delete student "${student.name}"? This will permanently delete all linked attendance logs and belt promotional history. This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete student.');
      }

      // Reset page if needed
      if (students.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred during deletion.');
    }
  };

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
    <div className="space-y-6" id="student-list-view">
      
      {/* Search and Action Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all shadow-xs"
            placeholder="Search students by name, email, or phone..."
            id="search-input"
          />
        </div>

        {/* Enroll Button */}
        <button
          onClick={() => {
            setStudentToEdit(null);
            setIsFormOpen(true);
          }}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-600/15 transition-all cursor-pointer"
          id="enroll-student-btn"
        >
          <Plus className="w-5 h-5" />
          <span>Enroll Student</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Class Filter */}
        <div className="space-y-1.5">
          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Class Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-red-600 text-slate-600 font-medium"
            id="filter-batch"
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Belt Rank Filter */}
        <div className="space-y-1.5">
          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Belt Rank</label>
          <select
            value={selectedBelt}
            onChange={(e) => {
              setSelectedBelt(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-red-600 text-slate-600 font-medium"
            id="filter-belt"
          >
            <option value="">All Belt Ranks</option>
            {Object.values(BeltRank).map((belt) => (
              <option key={belt} value={belt}>
                {belt} Belt
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Active Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-red-600 text-slate-600 font-medium"
            id="filter-status"
          >
            <option value="">All Statuses</option>
            <option value={StudentStatus.ACTIVE}>Active Only</option>
            <option value={StudentStatus.INACTIVE}>Inactive Only</option>
          </select>
        </div>

        {/* Sort Field */}
        <div className="space-y-1.5">
          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-red-600 text-slate-600 font-medium"
            id="sort-by-field"
          >
            <option value="name">Student Name</option>
            <option value="joinedDate">Enrollment Date</option>
            <option value="dateOfBirth">Birthdate</option>
            <option value="currentBelt">Belt Order</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="space-y-1.5">
          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Sort Order</label>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-red-600 text-slate-600 font-medium"
            id="sort-order"
          >
            <option value="asc">Ascending (A-Z)</option>
            <option value="desc">Descending (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Directory Grid/Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4" id="list-loading">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Scanning enrollment rolls...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center" id="list-error">
          <p className="font-semibold">{error}</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white py-16 px-4 rounded-2xl border border-slate-200 text-center space-y-3" id="list-empty">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-slate-700 text-base">No Students Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            We couldn't find any students matching your filters. Try clearing your search queries or resetting filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="student-table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-400 text-xxs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Belt Rank</th>
                  <th className="px-6 py-4">Batch Class</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/40 transition-colors group" id={`student-row-${student.id}`}>
                    {/* Name + Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-extrabold text-sm border border-slate-200/50">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-red-600 transition-colors">
                            {student.name}
                          </h5>
                          <span className="text-xs text-slate-400 font-medium truncate max-w-[180px] block mt-0.5">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Belt Rank */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xxs font-extrabold uppercase tracking-wider ${getBeltStyle(student.currentBelt)}`}>
                        {student.currentBelt}
                      </span>
                    </td>

                    {/* Batch Name */}
                    <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                      {student.batchName}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xxs font-extrabold uppercase tracking-wider ${
                        student.status === StudentStatus.ACTIVE
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 font-semibold">
                      {student.phone}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {/* View details */}
                      <button
                        onClick={() => onViewStudent(student.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                        title="View Profile Details"
                        id={`btn-view-${student.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Details */}
                      <button
                        onClick={() => {
                          setStudentToEdit(student);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        title="Edit Profile"
                        id={`btn-edit-${student.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Promote (Admin only) */}
                      {userRole === UserRole.ADMIN && (
                        <button
                          onClick={() => setStudentToPromote(student)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                          title="Promote Belt Rank"
                          id={`btn-promote-${student.id}`}
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete (Admin only) */}
                      {userRole === UserRole.ADMIN && (
                        <button
                          onClick={() => handleDelete(student)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Record"
                          id={`btn-delete-${student.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between" id="pagination-controls">
              <span className="text-xs text-slate-400 font-mono font-bold">
                Showing {(page - 1) * 8 + 1} - {Math.min(page * 8, totalRecords)} of {totalRecords} Records
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1 border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-40 transition-all cursor-pointer"
                  id="prev-page-btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 font-mono px-3">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1 border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-40 transition-all cursor-pointer"
                  id="next-page-btn"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enroll / Edit Modal */}
      {isFormOpen && (
        <StudentForm
          token={token}
          studentToEdit={studentToEdit}
          onClose={() => {
            setIsFormOpen(false);
            setStudentToEdit(null);
          }}
          onSaveSuccess={() => {
            setIsFormOpen(false);
            setStudentToEdit(null);
            fetchStudents();
          }}
        />
      )}

      {/* Promotion Modal */}
      {studentToPromote && (
        <BeltPromoter
          token={token}
          student={studentToPromote}
          onClose={() => setStudentToPromote(null)}
          onSuccess={() => {
            setStudentToPromote(null);
            fetchStudents();
          }}
        />
      )}
    </div>
  );
}
