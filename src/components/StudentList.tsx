/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Award,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { Student, Batch, BeltRank, StudentStatus, UserRole } from '../types.js';
import BeltPromoter from './BeltPromoter.js';

interface StudentListProps {
  token: string;
  userRole: UserRole;
  onViewStudent: (studentId: string) => void;
  onEnroll: () => void;
  onEditStudent: (studentId: string) => void;
}

export default function StudentList({ token, userRole, onViewStudent, onEnroll, onEditStudent }: StudentListProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedBelt, setSelectedBelt] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

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
      `Are you sure you want to delete student "${student.name}"? This will permanently delete all linked attendance logs and belt history. This action cannot be undone.`
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
    return 'bg-[var(--color-ink)] text-white';
  };

  return (
    <div className="space-y-6" id="student-list-view">
      <section className="hero-panel">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="pill-chip">Student directory</p>
            <h1 className="display-lg mt-3 text-[var(--color-ink)]">Students</h1>
            <p className="lead mt-3 text-[var(--color-ink-muted-48)]" style={{ fontSize: 21 }}>
              Review profiles, monitor belt progression, and keep every class roster ready.
            </p>
          </div>
          <button
            onClick={onEnroll}
            className="btn-primary"
            id="enroll-student-btn"
          >
            <Plus className="mr-2 h-4 w-4" />
            Enroll Student
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-ink-muted-48)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="search-pill w-full pl-11"
              placeholder="Search students..."
              id="search-input"
            />
          </div>
          <div className="pill-chip w-fit">{totalRecords} records loaded</div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label-field">Class Batch</label>
          <select value={selectedBatch} onChange={(e) => { setSelectedBatch(e.target.value); setPage(1); }} className="select-field" id="filter-batch">
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">Belt Rank</label>
          <select value={selectedBelt} onChange={(e) => { setSelectedBelt(e.target.value); setPage(1); }} className="select-field" id="filter-belt">
            <option value="">All Ranks</option>
            {Object.values(BeltRank).map((belt) => (
              <option key={belt} value={belt}>{belt} Belt</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">Status</label>
          <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }} className="select-field" id="filter-status">
            <option value="">All Statuses</option>
            <option value={StudentStatus.ACTIVE}>Active</option>
            <option value={StudentStatus.INACTIVE}>Inactive</option>
          </select>
        </div>

        <div>
          <label className="label-field">Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select-field" id="sort-by-field">
            <option value="name">Name</option>
            <option value="joinedDate">Enrollment Date</option>
            <option value="dateOfBirth">Birthdate</option>
            <option value="currentBelt">Belt Rank</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4" id="list-loading">
          <div className="spinner" />
          <p className="body-strong text-[var(--color-ink-muted-48)]">Loading students...</p>
        </div>
      ) : error ? (
        <div className="card-utility text-center space-y-4" id="list-error">
          <p className="body-strong text-[var(--color-ink)]">{error}</p>
          <button onClick={fetchStudents} className="btn-primary">Try Again</button>
        </div>
      ) : students.length === 0 ? (
        <div className="card-utility py-16 text-center space-y-4" id="list-empty">
          <HelpCircle className="mx-auto h-12 w-12 text-[var(--color-ink-muted-48)]" />
          <h4 className="display-md text-[var(--color-ink)]" style={{ fontSize: 28 }}>No Students Found</h4>
          <p className="lead text-[var(--color-ink-muted-48)]" style={{ fontSize: 19 }}>
            We couldn't find any students matching your filters.
          </p>
        </div>
      ) : (
        <div className="card-utility overflow-hidden p-0" id="student-table-container">
          <div className="overflow-x-auto">
            <table className="table-apple" id="students-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Belt</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} id={`student-row-${student.id}`}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--color-canvas-parchment)] text-[var(--color-ink)] body-strong">
                          {student.image ? (
                            <img src={student.image} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <button onClick={() => onViewStudent(student.id)} className="body-strong text-[var(--color-ink)] text-link" id={`btn-view-${student.id}`}>
                            {student.name}
                          </button>
                          <p className="caption text-[var(--color-ink-muted-48)]">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-belt ${getBeltStyle(student.currentBelt)}`}>{student.currentBelt}</span>
                    </td>
                    <td className="caption text-[var(--color-ink)]">{student.batchName}</td>
                    <td>
                      <span className={`badge-status ${student.status === StudentStatus.ACTIVE ? 'bg-[var(--color-link)]/10 text-[var(--color-link)]' : 'bg-[var(--color-canvas-parchment)] text-[var(--color-ink-muted-48)]'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="caption text-[var(--color-ink-muted-48)]">{student.phone}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onViewStudent(student.id)} className="rounded-full p-2 text-[var(--color-ink-muted-48)] transition-colors hover:bg-[var(--color-canvas-parchment)] hover:text-[var(--color-primary)]" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => onEditStudent(student.id)} className="rounded-full p-2 text-[var(--color-ink-muted-48)] transition-colors hover:bg-[var(--color-canvas-parchment)] hover:text-[var(--color-primary)]" title="Edit" id={`btn-edit-${student.id}`}>
                          <Edit className="h-4 w-4" />
                        </button>
                        {userRole === UserRole.ADMIN && (
                          <button onClick={() => setStudentToPromote(student)} className="rounded-full p-2 text-[var(--color-ink-muted-48)] transition-colors hover:bg-[var(--color-canvas-parchment)] hover:text-[var(--color-primary)]" title="Promote Belt" id={`btn-promote-${student.id}`}>
                            <Award className="h-4 w-4" />
                          </button>
                        )}
                        {userRole === UserRole.ADMIN && (
                          <button onClick={() => handleDelete(student)} className="rounded-full p-2 text-[var(--color-ink-muted-48)] transition-colors hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]" title="Delete" id={`btn-delete-${student.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--color-divider-soft)] px-6 py-4" id="pagination-controls">
              <span className="caption text-[var(--color-ink-muted-48)]">Showing {(page - 1) * 8 + 1}–{Math.min(page * 8, totalRecords)} of {totalRecords}</span>
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-canvas-parchment)] disabled:opacity-40" id="prev-page-btn">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="body-strong px-3 text-[var(--color-ink)]">{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-canvas-parchment)] disabled:opacity-40" id="next-page-btn">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {studentToPromote && (
        <BeltPromoter
          token={token}
          student={studentToPromote}
          onClose={() => setStudentToPromote(null)}
          onSuccess={() => { setStudentToPromote(null); fetchStudents(); }}
        />
      )}
    </div>
  );
}