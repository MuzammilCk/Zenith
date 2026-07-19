/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authService, hashPassword } from '../services/authService.js';
import { authenticate, requireRole, AuthenticatedRequest } from './middleware.js';
import { UserRole, BeltRank, StudentStatus, AttendanceStatus } from '../types.js';

export const apiRouter = Router();

// Help function to validate date
function isValidDate(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const timestamp = Date.parse(dateStr);
  return !isNaN(timestamp);
}

// Help function to validate email
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Auth Endpoints ---

// POST /api/auth/login
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const result = authService.login(email, password);
  if (!result) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  res.json(result);
});

// GET /api/auth/me
apiRouter.get('/auth/me', authenticate as any, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const user = db.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// --- Users / Instructors Management Endpoints (Admin only) ---

// GET /api/users
apiRouter.get('/users', [authenticate as any, requireRole([UserRole.ADMIN]) as any], (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers();
  const sanitizedUsers = users.map(u => {
    const { passwordHash, ...rest } = u;
    return rest;
  });
  res.json(sanitizedUsers);
});

// GET /api/users/:id
apiRouter.get('/users/:id', [authenticate as any, requireRole([UserRole.ADMIN]) as any], (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  const { passwordHash, ...sanitized } = user;
  res.json(sanitized);
});

// POST /api/users
apiRouter.post('/users', [authenticate as any, requireRole([UserRole.ADMIN]) as any], (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, status, image } = req.body;

  if (!name || name.trim().length < 2) {
    res.status(400).json({ error: 'Name is required.' });
    return;
  }
  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: 'Valid email address is required.' });
    return;
  }
  if (!password || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }
  if (role && ![UserRole.ADMIN, UserRole.INSTRUCTOR].includes(role)) {
    res.status(400).json({ error: 'Invalid user role.' });
    return;
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(400).json({ error: 'A user with this email already exists.' });
    return;
  }

  const newUser = db.createUser({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    role: role || UserRole.INSTRUCTOR,
    status: status || 'active',
    createdBy: req.user!.id,
    image: typeof image === 'string' ? image : undefined,
  });

  db.createAuditLog(req.user!.id, 'CREATE_USER', `Created user account for ${newUser.name} (${newUser.role}).`);
  
  const { passwordHash, ...sanitized } = newUser;
  res.status(201).json(sanitized);
});

// PUT /api/users/:id
apiRouter.put('/users/:id', [authenticate as any, requireRole([UserRole.ADMIN]) as any], (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const { name, email, password, role, status, image } = req.body;
  const updates: any = {};

  if (name !== undefined) {
    if (name.trim().length < 2) {
      res.status(400).json({ error: 'Name must be at least 2 characters.' });
      return;
    }
    updates.name = name.trim();
  }

  if (email !== undefined) {
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Invalid email address.' });
      return;
    }
    const existing = db.getUserByEmail(email);
    if (existing && existing.id !== req.params.id) {
      res.status(400).json({ error: 'A user with this email already exists.' });
      return;
    }
    updates.email = email.toLowerCase().trim();
  }

  if (password !== undefined && password !== '') {
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }
    updates.passwordHash = hashPassword(password);
  }

  if (role !== undefined) {
    if (![UserRole.ADMIN, UserRole.INSTRUCTOR].includes(role)) {
      res.status(400).json({ error: 'Invalid role.' });
      return;
    }
    if (req.params.id === req.user!.id && role !== user.role) {
      res.status(400).json({ error: 'You cannot change your own role.' });
      return;
    }
    updates.role = role;
  }

  if (status !== undefined) {
    if (!['active', 'inactive'].includes(status)) {
      res.status(400).json({ error: 'Status must be active or inactive.' });
      return;
    }
    if (req.params.id === req.user!.id && status === 'inactive') {
      res.status(400).json({ error: 'You cannot deactivate your own account.' });
      return;
    }
    updates.status = status;
  }

  if (image !== undefined) {
    if (image !== '' && typeof image !== 'string') {
      res.status(400).json({ error: 'Invalid image data.' });
      return;
    }
    updates.image = image;
  }

  const updatedUser = db.updateUser(req.params.id, updates);
  if (!updatedUser) {
    res.status(500).json({ error: 'Failed to update user.' });
    return;
  }

  db.createAuditLog(req.user!.id, 'UPDATE_USER', `Updated user account details for ${updatedUser.name}.`);

  const { passwordHash, ...sanitized } = updatedUser;
  res.json(sanitized);
});

// DELETE /api/users/:id
apiRouter.delete('/users/:id', [authenticate as any, requireRole([UserRole.ADMIN]) as any], (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (req.params.id === req.user!.id) {
    res.status(400).json({ error: 'You cannot delete your own account.' });
    return;
  }

  db.deleteUser(req.params.id);
  db.createAuditLog(req.user!.id, 'DELETE_USER', `Deleted user account for ${user.name}.`);
  res.json({ success: true, message: 'User deleted successfully.' });
});

// --- Batches Endpoints ---

// GET /api/batches
apiRouter.get('/batches', authenticate as any, (req, res) => {
  const batches = db.getBatches();
  res.json(batches);
});

// POST /api/batches (Admin only)
apiRouter.post('/batches', [authenticate as any, requireRole([UserRole.ADMIN]) as any], (req: AuthenticatedRequest, res: Response) => {
  const { name, schedule } = req.body;

  if (!name || name.trim().length < 3) {
    res.status(400).json({ error: 'Batch name is required and must be at least 3 characters.' });
    return;
  }
  if (!schedule || schedule.trim().length < 5) {
    res.status(400).json({ error: 'Batch schedule description is required.' });
    return;
  }

  const newBatch = db.createBatch({ name, schedule });
  db.createAuditLog(req.user!.id, 'CREATE_BATCH', `Created batch ${name}.`);
  res.status(201).json(newBatch);
});

// --- Students Endpoints ---

// GET /api/students (Search, Filter, Sort, Pagination)
apiRouter.get('/students', authenticate as any, (req, res) => {
  let students = db.getStudents();

  // 1. Search (name, email, phone)
  const query = req.query.q ? (req.query.q as string).toLowerCase().trim() : '';
  if (query) {
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.phone.includes(query)
    );
  }

  // 2. Filters
  const beltFilter = req.query.belt as string;
  if (beltFilter) {
    students = students.filter((s) => s.currentBelt === beltFilter);
  }

  const batchFilter = req.query.batchId as string;
  if (batchFilter) {
    students = students.filter((s) => s.batchId === batchFilter);
  }

  const statusFilter = req.query.status as string;
  if (statusFilter) {
    students = students.filter((s) => s.status === statusFilter);
  }

  // 3. Sorting
  const sortBy = (req.query.sortBy as string) || 'name';
  const order = (req.query.order as string) || 'asc';

  students.sort((a: any, b: any) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  // 4. Pagination
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const offset = (page - 1) * limit;

  const total = students.length;
  const paginatedStudents = students.slice(offset, offset + limit);

  // Inject batch info
  const result = paginatedStudents.map((student) => {
    const batch = db.getBatchById(student.batchId);
    return {
      ...student,
      batchName: batch ? batch.name : 'Unknown Batch',
    };
  });

  res.json({
    students: result,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

// GET /api/students/:id (Detailed Profile, History)
apiRouter.get('/students/:id', authenticate as any, (req, res) => {
  const student = db.getStudentById(req.params.id);
  if (!student) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const batch = db.getBatchById(student.batchId);
  const attendance = db.getAttendanceForStudent(student.id);
  const beltHistory = db.getBeltHistoryForStudent(student.id);

  res.json({
    ...student,
    batchName: batch ? batch.name : 'Unknown Batch',
    attendanceHistory: attendance,
    beltHistory,
  });
});

// POST /api/students (Create Student)
apiRouter.post('/students', authenticate as any, (req: AuthenticatedRequest, res) => {
  const {
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    currentBelt,
    status,
    batchId,
    joinedDate,
    notes,
    image,
    address,
    emergencyContactName,
    emergencyContactPhone,
    medicalNotes,
  } = req.body;

  // Validation
  if (!name || name.trim().length < 2) {
    res.status(400).json({ error: 'Name is required and must be at least 2 characters.' });
    return;
  }
  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }
  if (!phone || phone.trim().length < 5) {
    res.status(400).json({ error: 'Phone number is required.' });
    return;
  }
  if (!dateOfBirth || !isValidDate(dateOfBirth)) {
    res.status(400).json({ error: 'Date of birth is required (YYYY-MM-DD).' });
    return;
  }
  if (!gender || !['male', 'female', 'other'].includes(gender)) {
    res.status(400).json({ error: 'Gender must be male, female, or other.' });
    return;
  }
  if (!currentBelt || !Object.values(BeltRank).includes(currentBelt as any)) {
    res.status(400).json({ error: 'A valid starting belt rank is required.' });
    return;
  }
  if (!status || !Object.values(StudentStatus).includes(status as any)) {
    res.status(400).json({ error: 'Student status must be active or inactive.' });
    return;
  }
  if (!batchId || !db.getBatchById(batchId)) {
    res.status(400).json({ error: 'A valid batch assignment is required.' });
    return;
  }
  if (!joinedDate || !isValidDate(joinedDate)) {
    res.status(400).json({ error: 'Joined date is required (YYYY-MM-DD).' });
    return;
  }

  // Duplicate Check
  const students = db.getStudents();
  const duplicate = students.find(
    (s) => s.name.toLowerCase() === name.trim().toLowerCase() && s.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (duplicate) {
    res.status(409).json({ error: 'A student with the same name and email already exists.' });
    return;
  }

  const newStudent = db.createStudent({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    dateOfBirth,
    gender,
    currentBelt: currentBelt as BeltRank,
    status: status as StudentStatus,
    batchId,
    joinedDate,
    notes: notes ? notes.trim() : '',
    ...(image !== undefined && { image: String(image) }),
    ...(address !== undefined && { address: address.trim() }),
    ...(emergencyContactName !== undefined && { emergencyContactName: emergencyContactName.trim() }),
    ...(emergencyContactPhone !== undefined && { emergencyContactPhone: emergencyContactPhone.trim() }),
    ...(medicalNotes !== undefined && { medicalNotes: medicalNotes.trim() }),
  });

  db.createAuditLog(req.user!.id, 'CREATE_STUDENT', `Added student ${newStudent.name}.`);

  res.status(201).json(newStudent);
});

// PUT /api/students/:id (Update Student)
apiRouter.put('/students/:id', authenticate as any, (req: AuthenticatedRequest, res) => {
  const student = db.getStudentById(req.params.id);
  if (!student) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const {
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    status,
    batchId,
    joinedDate,
    notes,
    image,
    address,
    emergencyContactName,
    emergencyContactPhone,
    medicalNotes,
  } = req.body;

  // Validation
  if (name !== undefined && name.trim().length < 2) {
    res.status(400).json({ error: 'Name must be at least 2 characters.' });
    return;
  }
  if (email !== undefined && !isValidEmail(email)) {
    res.status(400).json({ error: 'Valid email address required.' });
    return;
  }
  if (phone !== undefined && phone.trim().length < 5) {
    res.status(400).json({ error: 'Phone number required.' });
    return;
  }
  if (dateOfBirth !== undefined && !isValidDate(dateOfBirth)) {
    res.status(400).json({ error: 'Date of birth must be YYYY-MM-DD.' });
    return;
  }
  if (gender !== undefined && !['male', 'female', 'other'].includes(gender)) {
    res.status(400).json({ error: 'Gender must be male, female, or other.' });
    return;
  }
  if (status !== undefined && !Object.values(StudentStatus).includes(status as any)) {
    res.status(400).json({ error: 'Status must be active or inactive.' });
    return;
  }
  if (batchId !== undefined && !db.getBatchById(batchId)) {
    res.status(400).json({ error: 'Valid batch assignment required.' });
    return;
  }
  if (joinedDate !== undefined && !isValidDate(joinedDate)) {
    res.status(400).json({ error: 'Joined date must be YYYY-MM-DD.' });
    return;
  }

  // Duplicate check for updated name/email
  if (name !== undefined && email !== undefined) {
    const duplicate = db.getStudents().find(
      (s) =>
        s.id !== student.id &&
        s.name.toLowerCase() === name.trim().toLowerCase() &&
        s.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (duplicate) {
      res.status(409).json({ error: 'Another student with this name and email already exists.' });
      return;
    }
  }

  const updated = db.updateStudent(student.id, {
    ...(name !== undefined && { name: name.trim() }),
    ...(email !== undefined && { email: email.trim().toLowerCase() }),
    ...(phone !== undefined && { phone: phone.trim() }),
    ...(dateOfBirth !== undefined && { dateOfBirth }),
    ...(gender !== undefined && { gender }),
    ...(status !== undefined && { status: status as StudentStatus }),
    ...(batchId !== undefined && { batchId }),
    ...(joinedDate !== undefined && { joinedDate }),
    ...(notes !== undefined && { notes: notes ? notes.trim() : '' }),
    ...(image !== undefined && { image: String(image) }),
    ...(address !== undefined && { address: address.trim() }),
    ...(emergencyContactName !== undefined && { emergencyContactName: emergencyContactName.trim() }),
    ...(emergencyContactPhone !== undefined && { emergencyContactPhone: emergencyContactPhone.trim() }),
    ...(medicalNotes !== undefined && { medicalNotes: medicalNotes.trim() }),
  });

  db.createAuditLog(req.user!.id, 'UPDATE_STUDENT', `Updated student details for ${student.name}.`);

  res.json(updated);
});

// DELETE /api/students/:id (Admin only)
apiRouter.delete('/students/:id', [authenticate as any, requireRole([UserRole.ADMIN]) as any], (req: AuthenticatedRequest, res: Response) => {
  const student = db.getStudentById(req.params.id);
  if (!student) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const success = db.deleteStudent(req.params.id);
  if (!success) {
    res.status(500).json({ error: 'Could not delete student.' });
    return;
  }

  db.createAuditLog(req.user!.id, 'DELETE_STUDENT', `Deleted student ${student.name} and cascaded records.`);

  res.json({ success: true, message: `Student ${student.name} deleted successfully.` });
});

// --- Attendance Endpoints ---

// GET /api/attendance?date=YYYY-MM-DD&batchId=...
apiRouter.get('/attendance', authenticate as any, (req, res) => {
  const { date, batchId, session } = req.query;

  let records = db.getAttendanceRecords();

  if (date) {
    records = records.filter((r) => r.date === date);
  }
  if (batchId) {
    records = records.filter((r) => r.batchId === batchId);
  }
  if (session) {
    records = records.filter((r) => r.session === session);
  }

  res.json(records);
});

// POST /api/attendance (Mark/Save Attendance)
apiRouter.post('/attendance', authenticate as any, (req: AuthenticatedRequest, res) => {
  const { date, batchId, session, records } = req.body;

  // Validate
  if (!date || !isValidDate(date)) {
    res.status(400).json({ error: 'A valid date (YYYY-MM-DD) is required.' });
    return;
  }
  if (!batchId || !db.getBatchById(batchId)) {
    res.status(400).json({ error: 'A valid batch assignment is required.' });
    return;
  }
  if (!session || session.trim().length === 0) {
    res.status(400).json({ error: 'Session description is required.' });
    return;
  }
  if (!records || !Array.isArray(records) || records.length === 0) {
    res.status(400).json({ error: 'Attendance records array must not be empty.' });
    return;
  }

  // Validate each record
  for (const item of records) {
    if (!item.studentId || !db.getStudentById(item.studentId)) {
      res.status(400).json({ error: `Attendance item has invalid studentId: ${item.studentId}` });
      return;
    }
    if (!item.status || !Object.values(AttendanceStatus).includes(item.status as any)) {
      res.status(400).json({ error: `Attendance item has invalid status: ${item.status}` });
      return;
    }
  }

  const recordsToSave = records.map((item) => ({
    studentId: item.studentId,
    batchId,
    date,
    session: session.trim(),
    status: item.status as AttendanceStatus,
    markedBy: req.user!.id,
  }));

  const saved = db.saveAttendanceRecords(recordsToSave);

  const batch = db.getBatchById(batchId);
  db.createAuditLog(
    req.user!.id,
    'MARK_ATTENDANCE',
    `Marked attendance for ${batch ? batch.name : 'batch'} on ${date} (${session}).`
  );

  res.status(201).json(saved);
});

// --- Belt & Promotions Endpoints ---

// GET /api/belt-history/:studentId
apiRouter.get('/belt-history/:studentId', authenticate as any, (req, res) => {
  const student = db.getStudentById(req.params.studentId);
  if (!student) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const history = db.getBeltHistoryForStudent(student.id);
  res.json(history);
});

// POST /api/students/:id/promote (Admin only)
apiRouter.post('/students/:id/promote', [authenticate as any, requireRole([UserRole.ADMIN]) as any], (req: AuthenticatedRequest, res: Response) => {
  const student = db.getStudentById(req.params.id);
  if (!student) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const { newBelt, date, notes } = req.body;

  // Validate
  if (!newBelt || !Object.values(BeltRank).includes(newBelt as any)) {
    res.status(400).json({ error: 'A valid promotion belt rank is required.' });
    return;
  }
  if (!date || !isValidDate(date)) {
    res.status(400).json({ error: 'Promotion date is required (YYYY-MM-DD).' });
    return;
  }

  // Validate belt progression
  const beltOrder = [
    BeltRank.WHITE,
    BeltRank.YELLOW,
    BeltRank.ORANGE,
    BeltRank.GREEN,
    BeltRank.BLUE,
    BeltRank.PURPLE,
    BeltRank.BROWN,
    BeltRank.BLACK,
  ];

  const currentIdx = beltOrder.indexOf(student.currentBelt);
  const newIdx = beltOrder.indexOf(newBelt as BeltRank);

  if (newIdx <= currentIdx) {
    res.status(400).json({
      error: `Invalid belt transition. Cannot demote or repeat current belt. (Current: ${student.currentBelt}, Attempted: ${newBelt})`,
    });
    return;
  }

  const instructorUser = db.getUserById(req.user!.id);
  const promotedByName = instructorUser ? instructorUser.name : 'Admin';

  const promotion = db.promoteStudent(
    student.id,
    newBelt as BeltRank,
    promotedByName,
    date,
    notes ? notes.trim() : 'Promotional test passed.'
  );

  db.createAuditLog(
    req.user!.id,
    'PROMOTE_STUDENT',
    `Promoted student ${student.name} from ${student.currentBelt} to ${newBelt}.`
  );

  res.status(201).json(promotion);
});

// --- Dashboard Statistics Endpoints ---

// GET /api/dashboard/stats
apiRouter.get('/dashboard/stats', authenticate as any, (req, res) => {
  const students = db.getStudents();
  const batches = db.getBatches();
  const attendance = db.getAttendanceRecords();
  const promotions = db.getBeltHistory();

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === StudentStatus.ACTIVE).length;

  // Overall Attendance Rate
  const totalAttendanceCount = attendance.length;
  const presentCount = attendance.filter(
    (ar) => ar.status === AttendanceStatus.PRESENT || ar.status === AttendanceStatus.TARDY
  ).length;
  const overallAttendanceRate =
    totalAttendanceCount > 0 ? Math.round((presentCount / totalAttendanceCount) * 100) : 100;

  // Belt Distribution
  const beltDistribution: Record<BeltRank, number> = {
    [BeltRank.WHITE]: 0,
    [BeltRank.YELLOW]: 0,
    [BeltRank.ORANGE]: 0,
    [BeltRank.GREEN]: 0,
    [BeltRank.BLUE]: 0,
    [BeltRank.PURPLE]: 0,
    [BeltRank.BROWN]: 0,
    [BeltRank.BLACK]: 0,
  };

  students.forEach((s) => {
    if (s.currentBelt in beltDistribution) {
      beltDistribution[s.currentBelt]++;
    }
  });

  // Recent Promotions (Last 5)
  const recentPromotions = promotions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((p) => {
      const s = db.getStudentById(p.studentId);
      return {
        id: p.id,
        studentName: s ? s.name : 'Unknown Student',
        oldBelt: p.oldBelt,
        newBelt: p.newBelt,
        date: p.date,
      };
    });

  // Attendance Trend (Past 7 dates with activity)
  // Group attendance by date
  const groupedByDate: Record<string, { present: number; absent: number; tardy: number }> = {};
  attendance.forEach((ar) => {
    if (!groupedByDate[ar.date]) {
      groupedByDate[ar.date] = { present: 0, absent: 0, tardy: 0 };
    }
    if (ar.status === AttendanceStatus.PRESENT) {
      groupedByDate[ar.date].present++;
    } else if (ar.status === AttendanceStatus.ABSENT) {
      groupedByDate[ar.date].absent++;
    } else if (ar.status === AttendanceStatus.TARDY) {
      groupedByDate[ar.date].tardy++;
    }
  });

  // Sort dates and take last 7
  const sortedDates = Object.keys(groupedByDate)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-7);

  const attendanceTrend = sortedDates.map((date) => ({
    date,
    ...groupedByDate[date],
  }));

  res.json({
    totalStudents,
    activeStudents,
    overallAttendanceRate,
    beltDistribution,
    recentPromotions,
    attendanceTrend,
  });
});

// GET /api/audit-logs (Admin only)
apiRouter.get('/audit-logs', [authenticate as any, requireRole([UserRole.ADMIN]) as any], (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAuditLogs().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Inject user info
  const result = logs.map((log) => {
    const user = db.getUserById(log.userId);
    return {
      ...log,
      userName: user ? user.name : 'System/Unknown',
    };
  });

  res.json(result);
});
