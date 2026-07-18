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

  // Dynamically seed instructor user for integration checks
  db.createUser({
    name: 'Instructor Ken',
    email: 'instructor@karate.com',
    passwordHash: crypto.createHash('sha256').update('instructor123').digest('hex'),
    role: UserRole.INSTRUCTOR,
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
