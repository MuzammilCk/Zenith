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
    if (b === BeltRank.WHITE) return 'bg-white border border-[var(--color-hairline)] text-[var(--color-ink)]';
    if (b === BeltRank.YELLOW) return 'bg-[#fbbf24] text-[#451a03]';
    if (b === BeltRank.ORANGE) return 'bg-[#f97316] text-white';
    if (b === BeltRank.GREEN) return 'bg-[#059669] text-white';
    if (b === BeltRank.BLUE) return 'bg-[#2563eb] text-white';
    if (b === BeltRank.PURPLE) return 'bg-[#9333ea] text-white';
    if (b === BeltRank.BROWN) return 'bg-[#92400e] text-[#fef3c7]';
    return 'bg-[var(--color-carbon)] text-[var(--color-canvas)] border border-black';
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
            className="w-full pl-10 pr-4 py-1.5 border border-[var(--color-hairline)] bg-white rounded-xs focus:outline-none focus:border-[var(--color-primary)] text-xs text-[var(--color-ink)]"
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
          className="px-4 py-1.5 bg-[var(--color-amber)] text-[var(--color-carbon)] ui-label text-[11px] rounded-xs flex items-center justify-center space-x-2 border-b border-[#a87a27] cursor-pointer"
          id="enroll-student-btn"
        >
          <Plus className="w-4 h-4" />
          <span>ENROLL STUDENT</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bevel-plate-platinum p-3 rounded-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Class Filter */}
        <div className="space-y-1">
          <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-0.5">CLASS BATCH</label>
          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs px-2 py-1.5 border border-[var(--color-hairline)] rounded-xs bg-white focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-ink)] font-bold transition-all"
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
        <div className="space-y-1">
          <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-0.5">BELT RANK</label>
          <select
            value={selectedBelt}
            onChange={(e) => {
              setSelectedBelt(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs px-2 py-1.5 border border-[var(--color-hairline)] rounded-xs bg-white focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-ink)] font-bold transition-all"
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
        <div className="space-y-1">
          <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-0.5">ACTIVE STATUS</label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs px-2 py-1.5 border border-[var(--color-hairline)] rounded-xs bg-white focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-ink)] font-bold transition-all"
            id="filter-status"
          >
            <option value="">All Statuses</option>
            <option value={StudentStatus.ACTIVE}>Active Only</option>
            <option value={StudentStatus.INACTIVE}>Inactive Only</option>
          </select>
        </div>

        {/* Sort Field */}
        <div className="space-y-1">
          <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-0.5">SORT BY</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full text-xs px-2 py-1.5 border border-[var(--color-hairline)] rounded-xs bg-white focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-ink)] font-bold transition-all"
            id="sort-by-field"
          >
            <option value="name">Student Name</option>
            <option value="joinedDate">Enrollment Date</option>
            <option value="dateOfBirth">Birthdate</option>
            <option value="currentBelt">Belt Order</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="space-y-1">
          <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-0.5">SORT ORDER</label>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full text-xs px-2 py-1.5 border border-[var(--color-hairline)] rounded-xs bg-white focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-ink)] font-bold transition-all"
            id="sort-order"
          >
            <option value="asc">Ascending (A-Z)</option>
            <option value="desc">Descending (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Directory Grid/Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bevel-plate-platinum rounded-sm" id="list-loading">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="ui-label text-[11px] text-[var(--color-ink)]">Scanning enrollment rolls...</p>
        </div>
      ) : error ? (
        <div className="bevel-plate-platinum border border-[var(--color-error)] text-[var(--color-error)] p-6 rounded-sm text-center" id="list-error">
          <p className="font-bold text-xs">{error}</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bevel-plate-platinum py-16 px-4 rounded-sm text-center space-y-3" id="list-empty">
          <HelpCircle className="w-12 h-12 text-[var(--color-chrome-indigo)] mx-auto opacity-50" />
          <h4 className="font-extrabold text-[var(--color-ink)] text-xs">No Students Found</h4>
          <p className="text-[11px] text-[var(--color-ink-soft)] max-w-sm mx-auto">
            We couldn't find any students matching your filters. Try clearing your search queries or resetting filters.
          </p>
        </div>
      ) : (
        <div className="bevel-plate-platinum p-1 rounded-sm overflow-hidden" id="student-table-container">
          <div className="overflow-x-auto bg-[var(--color-platinum)] bevel-inset">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--color-canvas-soft)] border-b border-[var(--color-hairline)] text-[var(--color-ink-soft)] ui-label text-[10px]">
                  <th className="px-4 py-2 border-r border-[var(--color-hairline)]">STUDENT</th>
                  <th className="px-4 py-2 border-r border-[var(--color-hairline)]">BELT RANK</th>
                  <th className="px-4 py-2 border-r border-[var(--color-hairline)]">BATCH CLASS</th>
                  <th className="px-4 py-2 border-r border-[var(--color-hairline)]">STATUS</th>
                  <th className="px-4 py-2 border-r border-[var(--color-hairline)]">PHONE</th>
                  <th className="px-4 py-2 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-hairline)] text-[var(--color-ink)]">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/40 transition-colors group" id={`student-row-${student.id}`}>
                    {/* Name + Email */}
                    <td className="px-4 py-3 border-r border-[var(--color-hairline)]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xs bg-[var(--color-canvas)] text-[var(--color-ink)] flex items-center justify-center font-display font-black text-xs border border-[var(--color-chrome-indigo)] shadow-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-bold text-[var(--color-ink)] text-xs leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                            {student.name}
                          </h5>
                          <span className="text-[10px] font-mono text-[var(--color-ink-soft)] font-bold truncate max-w-[180px] block mt-0.5">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Belt Rank */}
                    <td className="px-4 py-3 border-r border-[var(--color-hairline)]">
                      <span className={`inline-flex px-2 py-0.5 rounded-xs text-[10px] ui-label ${getBeltStyle(student.currentBelt)}`}>
                        {student.currentBelt}
                      </span>
                    </td>

                    {/* Batch Name */}
                    <td className="px-4 py-3 text-[var(--color-ink)] font-bold text-xs border-r border-[var(--color-hairline)]">
                      {student.batchName}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 border-r border-[var(--color-hairline)]">
                      <span className={`inline-flex px-2 py-0.5 rounded-xs text-[10px] ui-label ${
                        student.status === StudentStatus.ACTIVE
                          ? 'bg-[#4ade80] text-[var(--color-carbon)] border border-[#15803d]'
                          : 'bg-[var(--color-canvas)] text-[var(--color-ink-soft)] border border-[var(--color-chrome-indigo)]'
                      }`}>
                        {student.status}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-xs font-mono text-[var(--color-ink)] font-bold border-r border-[var(--color-hairline)]">
                      {student.phone}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right space-x-1.5">
                      {/* View details */}
                      <button
                        onClick={() => onViewStudent(student.id)}
                        className="p-1 text-[var(--color-ink-soft)] hover:text-black hover:bg-[var(--color-canvas-soft)] rounded-xs transition-all cursor-pointer border border-transparent hover:border-[var(--color-hairline)]"
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
                        className="p-1 text-[var(--color-ink-soft)] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-xs transition-all cursor-pointer border border-transparent hover:border-[#bfdbfe]"
                        title="Edit Profile"
                        id={`btn-edit-${student.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Promote (Admin only) */}
                      {userRole === UserRole.ADMIN && (
                        <button
                          onClick={() => setStudentToPromote(student)}
                          className="p-1 text-[var(--color-ink-soft)] hover:text-[#f97316] hover:bg-[#fff7ed] rounded-xs transition-all cursor-pointer border border-transparent hover:border-[#fed7aa]"
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
                          className="p-1 text-[var(--color-ink-soft)] hover:text-[var(--color-error)] hover:bg-[#fef2f2] rounded-xs transition-all cursor-pointer border border-transparent hover:border-[#fecaca]"
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
            <div className="px-4 py-3 bg-[var(--color-platinum)] border-t border-[var(--color-hairline)] flex items-center justify-between" id="pagination-controls">
              <span className="text-[10px] text-[var(--color-ink-soft)] font-mono font-bold">
                SHOWING {(page - 1) * 8 + 1} - {Math.min(page * 8, totalRecords)} OF {totalRecords} RECORDS
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1 border border-[var(--color-hairline)] bg-white hover:bg-[var(--color-canvas)] rounded-xs text-[var(--color-ink)] disabled:opacity-40 transition-all cursor-pointer"
                  id="prev-page-btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold text-[var(--color-ink)] font-mono px-3">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1 border border-[var(--color-hairline)] bg-white hover:bg-[var(--color-canvas)] rounded-xs text-[var(--color-ink)] disabled:opacity-40 transition-all cursor-pointer"
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
