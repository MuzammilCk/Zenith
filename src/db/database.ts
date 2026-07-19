/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  User,
  UserRole,
  Student,
  Batch,
  AttendanceRecord,
  BeltHistory,
  AuditLog,
  BeltRank,
  StudentStatus,
} from '../types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: User[];
  batches: Batch[];
  students: Student[];
  attendance_records: AttendanceRecord[];
  belt_history: BeltHistory[];
  audit_logs: AuditLog[];
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const DEFAULT_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Admin Sensei',
    email: 'admin@karate.com',
    passwordHash: hashPassword('admin123'),
    role: UserRole.ADMIN,
    createdAt: new Date('2026-01-01').toISOString(),
  },
];

const DEFAULT_BATCHES: Batch[] = [
  {
    id: 'b-1',
    name: 'Dragons (Kids 5-10)',
    schedule: 'Mon/Wed 4:00 PM - 5:00 PM',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'b-2',
    name: 'Samurai (Teens Advanced)',
    schedule: 'Mon/Wed 5:15 PM - 6:30 PM',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'b-3',
    name: 'Adults Open Class',
    schedule: 'Tue/Thu 7:00 PM - 8:30 PM',
    createdAt: new Date('2026-01-02').toISOString(),
  },
  {
    id: 'b-4',
    name: 'Weekend Black Belt prep',
    schedule: 'Sat 9:00 AM - 11:00 AM',
    createdAt: new Date('2026-01-03').toISOString(),
  },
];

const DEFAULT_STUDENTS: Student[] = [];

const DEFAULT_BELT_HISTORY: BeltHistory[] = [];

const DEFAULT_ATTENDANCE: AttendanceRecord[] = [];

export class RelationalDB {
  private schema: DatabaseSchema;

  constructor() {
    this.schema = {
      users: [],
      batches: [],
      students: [],
      attendance_records: [],
      belt_history: [],
      audit_logs: [],
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.schema = JSON.parse(fileContent);
        let modified = false;
        if (!this.schema.users || this.schema.users.length === 0) {
          this.schema.users = DEFAULT_USERS;
          modified = true;
        }
        if (!this.schema.batches || this.schema.batches.length === 0) {
          this.schema.batches = DEFAULT_BATCHES;
          modified = true;
        }
        if (!this.schema.students || this.schema.students.length === 0) {
          this.schema.students = DEFAULT_STUDENTS;
          modified = true;
        }
        if (!this.schema.belt_history || this.schema.belt_history.length === 0) {
          this.schema.belt_history = DEFAULT_BELT_HISTORY;
          modified = true;
        }
        if (!this.schema.attendance_records || this.schema.attendance_records.length === 0) {
          this.schema.attendance_records = DEFAULT_ATTENDANCE;
          modified = true;
        }
        if (modified) {
          this.save();
        }
      } else {
        this.schema = {
          users: DEFAULT_USERS,
          batches: DEFAULT_BATCHES,
          students: DEFAULT_STUDENTS,
          attendance_records: DEFAULT_ATTENDANCE,
          belt_history: DEFAULT_BELT_HISTORY,
          audit_logs: [
            {
              id: 'log-1',
              userId: 'u-1',
              action: 'SEED_DATABASE',
              details: 'Database seeded with default configurations.',
              createdAt: new Date().toISOString(),
            },
          ],
        };
        this.save();
      }
    } catch (error) {
      console.error('Error initializing file-based database, using in-memory fallback:', error);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.schema, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing to database file:', error);
    }
  }

  // --- Users Operations ---
  getUsers(): User[] {
    return [...this.schema.users];
  }

  getUserById(id: string): User | undefined {
    return this.schema.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.schema.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      status: 'active',
      ...user,
      id: `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.schema.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | undefined {
    const idx = this.schema.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    const updatedUser = {
      ...this.schema.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.schema.users[idx] = updatedUser;
    this.save();
    return updatedUser;
  }

  deleteUser(id: string): boolean {
    const initialLen = this.schema.users.length;
    this.schema.users = this.schema.users.filter((u) => u.id !== id);
    if (this.schema.users.length < initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Batches Operations ---
  getBatches(): Batch[] {
    return [...this.schema.batches];
  }

  getBatchById(id: string): Batch | undefined {
    return this.schema.batches.find((b) => b.id === id);
  }

  createBatch(batch: Omit<Batch, 'id' | 'createdAt'>): Batch {
    const newBatch: Batch = {
      ...batch,
      id: `b-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.schema.batches.push(newBatch);
    this.save();
    return newBatch;
  }

  // --- Students Operations ---
  getStudents(): Student[] {
    return [...this.schema.students];
  }

  // Returns students whose batchId is in the provided list. Used to scope
  // instructor visibility to only the classes the admin assigned them to.
  getStudentsInBatches(batchIds: string[]): Student[] {
    if (!batchIds || batchIds.length === 0) return [];
    const set = new Set(batchIds);
    return this.schema.students.filter((s) => set.has(s.batchId));
  }

  getStudentById(id: string): Student | undefined {
    return this.schema.students.find((s) => s.id === id);
  }

  createStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
    const newStudent: Student = {
      ...student,
      id: `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.schema.students.push(newStudent);
    this.save();
    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Omit<Student, 'id' | 'createdAt'>>): Student | undefined {
    const studentIdx = this.schema.students.findIndex((s) => s.id === id);
    if (studentIdx === -1) return undefined;

    const updatedStudent = {
      ...this.schema.students[studentIdx],
      ...updates,
    };
    this.schema.students[studentIdx] = updatedStudent;
    this.save();
    return updatedStudent;
  }

  deleteStudent(id: string): boolean {
    const initialLen = this.schema.students.length;
    this.schema.students = this.schema.students.filter((s) => s.id !== id);
    
    // Cascading delete elements to avoid dangling references in normalised layout:
    this.schema.attendance_records = this.schema.attendance_records.filter((ar) => ar.studentId !== id);
    this.schema.belt_history = this.schema.belt_history.filter((bh) => bh.studentId !== id);

    const success = this.schema.students.length < initialLen;
    if (success) {
      this.save();
    }
    return success;
  }

  // --- Attendance Operations ---
  getAttendanceRecords(): AttendanceRecord[] {
    return [...this.schema.attendance_records];
  }

  getAttendanceForStudent(studentId: string): AttendanceRecord[] {
    return this.schema.attendance_records.filter((ar) => ar.studentId === studentId);
  }

  saveAttendanceRecords(records: Array<Omit<AttendanceRecord, 'id' | 'createdAt'>>): AttendanceRecord[] {
    const saved: AttendanceRecord[] = [];
    
    records.forEach((rec) => {
      // Upsert: check if attendance already marked for this student, date, batch, session
      const existingIdx = this.schema.attendance_records.findIndex(
        (ar) =>
          ar.studentId === rec.studentId &&
          ar.date === rec.date &&
          ar.batchId === rec.batchId &&
          ar.session === rec.session
      );

      const timestamp = new Date().toISOString();

      if (existingIdx !== -1) {
        // Update status and marker
        this.schema.attendance_records[existingIdx] = {
          ...this.schema.attendance_records[existingIdx],
          status: rec.status,
          markedBy: rec.markedBy,
        };
        saved.push(this.schema.attendance_records[existingIdx]);
      } else {
        // Create new record
        const newRecord: AttendanceRecord = {
          ...rec,
          id: `a-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          createdAt: timestamp,
        };
        this.schema.attendance_records.push(newRecord);
        saved.push(newRecord);
      }
    });

    this.save();
    return saved;
  }

  // --- Belt History Operations ---
  getBeltHistory(): BeltHistory[] {
    return [...this.schema.belt_history];
  }

  getBeltHistoryForStudent(studentId: string): BeltHistory[] {
    return this.schema.belt_history.filter((bh) => bh.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  promoteStudent(
    studentId: string,
    newBelt: BeltRank,
    promotedBy: string,
    date: string,
    notes: string
  ): BeltHistory | undefined {
    const student = this.getStudentById(studentId);
    if (!student) return undefined;

    const oldBelt = student.currentBelt;

    // Save current belt in student record
    this.updateStudent(studentId, { currentBelt: newBelt });

    // Create history entry
    const newPromo: BeltHistory = {
      id: `h-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId,
      oldBelt,
      newBelt,
      promotedBy,
      date,
      notes,
      createdAt: new Date().toISOString(),
    };

    this.schema.belt_history.push(newPromo);
    this.save();
    return newPromo;
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return [...this.schema.audit_logs];
  }

  createAuditLog(userId: string, action: string, details: string): AuditLog {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    this.schema.audit_logs.push(newLog);
    this.save();
    return newLog;
  }

  // For testing purposes
  clearAll() {
    this.schema = {
      users: [...DEFAULT_USERS],
      batches: [...DEFAULT_BATCHES],
      students: [],
      attendance_records: [],
      belt_history: [],
      audit_logs: [],
    };
    this.save();
  }
}

export const db = new RelationalDB();
