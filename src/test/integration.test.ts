/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert';
import * as crypto from 'node:crypto';
import { createServer } from '../../server.js';
import { db } from '../db/database.js';
import { BeltRank, StudentStatus, AttendanceStatus, UserRole } from '../types.js';

const TEST_PORT = 3099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

test('Full-Stack Integration Test Suite', async (t) => {
  // Boot up server on a dedicated test port
  const app = await createServer();
  const server = app.listen(TEST_PORT, '0.0.0.0');

  // Reset database before integration checks
  db.clearAll();

  // Dynamically seed instructor user for integration checks.
  // Assigned to b-1 so they can see/mark the student created in that batch below.
  db.createUser({
    name: 'Instructor Ken',
    email: 'instructor@karate.com',
    passwordHash: crypto.createHash('sha256').update('instructor123').digest('hex'),
    role: UserRole.INSTRUCTOR,
    assignedBatchIds: ['b-1'],
  });

  // Tokens
  let adminToken = '';
  let instructorToken = '';
  let createdStudentId = '';

  await t.test('1. Auth Integration: Secure login credentials', async () => {
    // Admin login
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@karate.com', password: 'admin123' }),
    });
    assert.strictEqual(adminRes.status, 200, 'Admin login should succeed');
    const adminData = await adminRes.json();
    assert.ok(adminData.token, 'Should return a token');
    adminToken = adminData.token;

    // Instructor login
    const instRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'instructor@karate.com', password: 'instructor123' }),
    });
    assert.strictEqual(instRes.status, 200, 'Instructor login should succeed');
    const instData = await instRes.json();
    instructorToken = instData.token;

    // Bad login credentials
    const badRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@karate.com', password: 'badpassword' }),
    });
    assert.strictEqual(badRes.status, 401, 'Should block invalid password with 401');
  });

  await t.test('2. Student CRUD Integration: Create student', async () => {
    const studentPayload = {
      name: 'Integration Karateka',
      email: 'karateka@integration.com',
      phone: '555-9876',
      dateOfBirth: '2000-01-01',
      gender: 'male',
      currentBelt: BeltRank.WHITE,
      status: StudentStatus.ACTIVE,
      batchId: 'b-1',
      joinedDate: '2026-07-01',
      notes: 'Test notes',
    };

    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(studentPayload),
    });

    assert.strictEqual(res.status, 201, 'Should create student record successfully');
    const data = await res.json();
    assert.ok(data.id, 'Should generate database ID');
    assert.strictEqual(data.name, studentPayload.name);
    createdStudentId = data.id;

    // Duplicate check
    const dupRes = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(studentPayload),
    });
    assert.strictEqual(dupRes.status, 409, 'Should reject duplicate name/email combination with 409 Conflict');
  });

  await t.test('3. Student CRUD Integration: View and search directory', async () => {
    assert.ok(createdStudentId, 'Pre-requisite: student ID exists');

    // Get Student by ID
    const res = await fetch(`${BASE_URL}/students/${createdStudentId}`, {
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.name, 'Integration Karateka');

    // Search students directory
    const searchRes = await fetch(`${BASE_URL}/students?q=Integration`, {
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert.strictEqual(searchRes.status, 200);
    const searchData = await searchRes.json();
    assert.strictEqual(searchData.students.length, 1, 'Should return exactly 1 searched student');
  });

  await t.test('4. Attendance Integration: Marking and fetching daily roster', async () => {
    assert.ok(createdStudentId, 'Student exists');

    const attendancePayload = {
      date: '2026-07-18',
      batchId: 'b-1',
      session: 'Tournament Practice',
      records: [
        { studentId: createdStudentId, status: AttendanceStatus.PRESENT },
      ],
    };

    const res = await fetch(`${BASE_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify(attendancePayload),
    });

    assert.strictEqual(res.status, 201, 'Should register attendance log');
    const data = await res.json();
    assert.strictEqual(data.length, 1);
    assert.strictEqual(data[0].status, AttendanceStatus.PRESENT);

    // Fetch daily logs
    const getRes = await fetch(`${BASE_URL}/attendance?date=2026-07-18&batchId=b-1`, {
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert.strictEqual(getRes.status, 200);
    const getData = await getRes.json();
    assert.strictEqual(getData.length, 1, 'Should return the marked log');
  });

  await t.test('5. Belt Rank Integration: Promote student and validate', async () => {
    assert.ok(createdStudentId, 'Student exists');

    // Attempt invalid belt transition (same belt or lower belt)
    const badPromoPayload = {
      newBelt: BeltRank.WHITE, // student is already white belt
      date: '2026-07-18',
      notes: 'Attempted invalid demotion test',
    };

    const badRes = await fetch(`${BASE_URL}/students/${createdStudentId}/promote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(badPromoPayload),
    });
    assert.strictEqual(badRes.status, 400, 'Should reject equal/demote belt upgrades with 400');

    // Attempt valid belt transition
    const goodPromoPayload = {
      newBelt: BeltRank.YELLOW,
      date: '2026-07-18',
      notes: 'Graded to Yellow Belt by Sensei Miyagi',
    };

    const goodRes = await fetch(`${BASE_URL}/students/${createdStudentId}/promote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(goodPromoPayload),
    });
    assert.strictEqual(goodRes.status, 201, 'Should successfully promote the student');

    // Check student record is updated
    const checkRes = await fetch(`${BASE_URL}/students/${createdStudentId}`, {
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    const checkData = await checkRes.json();
    assert.strictEqual(checkData.currentBelt, BeltRank.YELLOW, 'Current student belt rank must be updated');
  });

  await t.test('6. RBAC Role checks: Delete permissions', async () => {
    assert.ok(createdStudentId, 'Student exists');

    // Try deleting as Instructor (Should FAIL)
    const instDelRes = await fetch(`${BASE_URL}/students/${createdStudentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert.strictEqual(instDelRes.status, 403, 'Should block Instructor deletion request with 403 Forbidden');

    // Delete as Admin (Should SUCCEED)
    const adminDelRes = await fetch(`${BASE_URL}/students/${createdStudentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(adminDelRes.status, 200, 'Admin can delete student record successfully');
  });

  await t.test('7. User Management: Admin creating, editing, deactivating and deleting instructors', async () => {
    // 1. Admin creates Instructor Bob
    const createRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Instructor Bob',
        email: 'bob@karate.com',
        password: 'bobpassword123',
        role: UserRole.INSTRUCTOR,
      }),
    });
    assert.strictEqual(createRes.status, 201, 'Admin should successfully create Instructor Bob');
    const bobData = await createRes.json();
    assert.ok(bobData.id, 'Should return created user ID');
    const bobId = bobData.id;

    // 2. Admin retrieves user list
    const listRes = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(listRes.status, 200, 'Admin can list users');
    const userList = await listRes.json();
    const bobInList = userList.find((u: any) => u.id === bobId);
    assert.ok(bobInList, 'Instructor Bob should exist in the user list');
    assert.strictEqual(bobInList.status, 'active', 'Instructor Bob should be active initially');

    // 3. Instructor Bob logs in successfully
    const bobLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@karate.com', password: 'bobpassword123' }),
    });
    assert.strictEqual(bobLoginRes.status, 200, 'Instructor Bob should login successfully');
    const bobLoginData = await bobLoginRes.json();
    assert.ok(bobLoginData.token, 'Should return login token for Bob');
    const bobToken = bobLoginData.token;

    // 4. Admin deactivates Instructor Bob
    const deactivateRes = await fetch(`${BASE_URL}/users/${bobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'inactive' }),
    });
    assert.strictEqual(deactivateRes.status, 200, 'Deactivation should succeed');

    // 5. Instructor Bob attempts to load details - should be BLOCKED due to inactive status
    const bobMeRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    assert.strictEqual(bobMeRes.status, 403, 'Should block de-activated Bob with 403 Forbidden');

    // 6. Instructor Bob attempts login - should be BLOCKED
    const bobLoginFailedRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@karate.com', password: 'bobpassword123' }),
    });
    assert.ok([401, 403].includes(bobLoginFailedRes.status), 'Deactivated account login must fail with 401 or 403');

    // 7. Admin deletes Instructor Bob
    const deleteBobRes = await fetch(`${BASE_URL}/users/${bobId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(deleteBobRes.status, 200, 'Admin can delete Bob');

    // 8. Admin retrieves user list - Bob should be gone
    const listFinalRes = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const finalUserList = await listFinalRes.json();
    const bobInFinalList = finalUserList.find((u: any) => u.id === bobId);
    assert.ok(!bobInFinalList, 'Instructor Bob should be completely deleted from list');
  });

  // Close the server down cleanly
  server.close();
});

test('Instructor Class-Scoping Suite (Section 0.5 / Section 11 / Section 14)', async (t) => {
  const app = await createServer();
  const server = app.listen(TEST_PORT, '0.0.0.0');
  db.clearAll();

  // Seed two instructors, each assigned to a different batch.
  db.createUser({
    name: 'Sensei A',
    email: 'a@karate.com',
    passwordHash: crypto.createHash('sha256').update('password123').digest('hex'),
    role: UserRole.INSTRUCTOR,
    assignedBatchIds: ['b-1'],
  });
  db.createUser({
    name: 'Sensei B',
    email: 'b@karate.com',
    passwordHash: crypto.createHash('sha256').update('password123').digest('hex'),
    role: UserRole.INSTRUCTOR,
    assignedBatchIds: ['b-2'],
  });

  let adminToken = '';
  let tokenA = '';
  let tokenB = '';
  let studentInB1 = '';
  let studentInB2 = '';

  await t.test('1. Login as admin and both scoped instructors', async () => {
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@karate.com', password: 'admin123' }),
    });
    adminToken = (await adminRes.json()).token;

    const aRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@karate.com', password: 'password123' }),
    });
    const aData = await aRes.json();
    tokenA = aData.token;
    assert.deepStrictEqual(aData.user.assignedBatchIds, ['b-1'], 'Instructor A token should carry assignedBatchIds');

    const bRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'b@karate.com', password: 'password123' }),
    });
    tokenB = (await bRes.json()).token;
  });

  await t.test('2. Admin creates one student in each batch', async () => {
    const mk = (name: string, email: string, batchId: string) =>
      fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          name, email, phone: '555-0000', dateOfBirth: '2010-01-01', gender: 'male',
          currentBelt: BeltRank.WHITE, status: StudentStatus.ACTIVE, batchId, joinedDate: '2026-07-01',
        }),
      });

    const r1 = await mk('Student One', 'one@karate.com', 'b-1');
    assert.strictEqual(r1.status, 201);
    studentInB1 = (await r1.json()).id;

    const r2 = await mk('Student Two', 'two@karate.com', 'b-2');
    assert.strictEqual(r2.status, 201);
    studentInB2 = (await r2.json()).id;
  });

  await t.test('3. Instructor A sees only b-1 students, not b-2', async () => {
    const res = await fetch(`${BASE_URL}/students`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const ids = data.students.map((s: any) => s.id);
    assert.ok(ids.includes(studentInB1), 'Instructor A should see their assigned student');
    assert.ok(!ids.includes(studentInB2), 'Instructor A must NOT see student from another class');
    assert.strictEqual(data.pagination.total, 1, 'Instructor A directory total should be 1');
  });

  await t.test('4. Instructor B sees only b-2 students, not b-1', async () => {
    const res = await fetch(`${BASE_URL}/students`, { headers: { Authorization: `Bearer ${tokenB}` } });
    const data = await res.json();
    const ids = data.students.map((s: any) => s.id);
    assert.ok(ids.includes(studentInB2), 'Instructor B should see their assigned student');
    assert.ok(!ids.includes(studentInB1), 'Instructor B must NOT see student from another class');
  });

  await t.test('5. Instructor A is blocked (403) from viewing b-2 student detail', async () => {
    const res = await fetch(`${BASE_URL}/students/${studentInB2}`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert.strictEqual(res.status, 403, 'Cross-class student detail must be forbidden');
  });

  await t.test('6. Instructor A is blocked (403) from marking attendance in b-2', async () => {
    const res = await fetch(`${BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        date: '2026-07-19', batchId: 'b-2', session: 'Class',
        records: [{ studentId: studentInB2, status: AttendanceStatus.PRESENT }],
      }),
    });
    assert.strictEqual(res.status, 403, 'Cross-class attendance marking must be forbidden');
  });

  await t.test('7. Instructor A CAN mark attendance in their own b-1', async () => {
    const res = await fetch(`${BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        date: '2026-07-19', batchId: 'b-1', session: 'Class',
        records: [{ studentId: studentInB1, status: AttendanceStatus.PRESENT }],
      }),
    });
    assert.strictEqual(res.status, 201, 'Own-class attendance marking should succeed');
  });

  await t.test('8. Instructor A attendance GET is scoped to b-1 only', async () => {
    const res = await fetch(`${BASE_URL}/attendance?date=2026-07-19`, { headers: { Authorization: `Bearer ${tokenA}` } });
    const data = await res.json();
    assert.ok(data.every((r: any) => r.batchId === 'b-1'), 'Instructor A attendance feed must be scoped to b-1');
  });

  await t.test('9. Dashboard stats are scoped per instructor', async () => {
    const resA = await fetch(`${BASE_URL}/dashboard/stats`, { headers: { Authorization: `Bearer ${tokenA}` } });
    const statsA = await resA.json();
    assert.strictEqual(statsA.totalStudents, 1, 'Instructor A dashboard total should be 1');

    const resAdmin = await fetch(`${BASE_URL}/dashboard/stats`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const statsAdmin = await resAdmin.json();
    assert.strictEqual(statsAdmin.totalStudents, 2, 'Admin dashboard total should be 2');
  });

  await t.test('10. Admin can assign batches to an instructor via API', async () => {
    const createRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Sensei C', email: 'c@karate.com', password: 'password123',
        role: UserRole.INSTRUCTOR, assignedBatchIds: ['b-3'],
      }),
    });
    assert.strictEqual(createRes.status, 201, 'Admin should create scoped instructor');
    const c = await createRes.json();
    assert.deepStrictEqual(c.assignedBatchIds, ['b-3'], 'assignedBatchIds should round-trip');

    // Invalid batch id is rejected
    const badRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Sensei D', email: 'd@karate.com', password: 'password123',
        role: UserRole.INSTRUCTOR, assignedBatchIds: ['b-999'],
      }),
    });
    assert.strictEqual(badRes.status, 400, 'Unknown batch id must be rejected');
  });

  server.close();
});
