/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { createServer } from '../../server.js';
import { db } from '../db/database.js';
import { BeltRank, StudentStatus, AttendanceStatus } from '../types.js';

const TEST_PORT = 3099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

test('Full-Stack Integration Test Suite', async (t) => {
  // Boot up server on a dedicated test port
  const app = await createServer();
  const server = app.listen(TEST_PORT, '0.0.0.0');

  // Reset database before integration checks
  db.clearAll();

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

  // Close the server down cleanly
  server.close();
});
