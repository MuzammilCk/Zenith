/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status?: 'active' | 'inactive';
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  image?: string; // base64 data URL of the account avatar
  // Batches (classes) this instructor is assigned to. Admins ignore this
  // (they see everything). Instructors only see students/attendance for these batches.
  assignedBatchIds?: string[];
}

export enum BeltRank {
  WHITE = 'White',
  YELLOW = 'Yellow',
  ORANGE = 'Orange',
  GREEN = 'Green',
  BLUE = 'Blue',
  PURPLE = 'Purple',
  BROWN = 'Brown',
  BLACK = 'Black',
}

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface Batch {
  id: string;
  name: string; // e.g., 'Morning Batch', 'Evening Advanced'
  schedule: string; // e.g., 'Mon/Wed 9:00 AM', 'Tue/Thu 5:00 PM'
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  currentBelt: BeltRank;
  status: StudentStatus;
  batchId: string; // foreign key to Batch
  joinedDate: string;
  notes?: string;
  image?: string; // base64 data URL of the student portrait
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalNotes?: string;
  createdAt: string;
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  TARDY = 'tardy',
}

export interface AttendanceRecord {
  id: string;
  studentId: string; // foreign key to Student
  batchId: string; // foreign key to Batch
  date: string; // YYYY-MM-DD
  session: string; // e.g., 'Regular Class', 'Sparring Class'
  status: AttendanceStatus;
  markedBy: string; // User id
  createdAt: string;
}

export interface BeltHistory {
  id: string;
  studentId: string; // foreign key to Student
  oldBelt: BeltRank;
  newBelt: BeltRank;
  promotedBy: string; // User name/id
  date: string; // YYYY-MM-DD
  notes: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string; // e.g., 'CREATE_STUDENT', 'DELETE_STUDENT'
  details: string;
  createdAt: string;
}

// Client API responses and requests
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    assignedBatchIds?: string[];
  };
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  overallAttendanceRate: number; // percentage
  beltDistribution: Record<BeltRank, number>;
  recentPromotions: Array<{
    id: string;
    studentName: string;
    oldBelt: BeltRank;
    newBelt: BeltRank;
    date: string;
  }>;
  attendanceTrend: Array<{
    date: string;
    present: number;
    absent: number;
    tardy: number;
  }>;
}
