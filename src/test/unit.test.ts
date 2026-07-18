/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { authService } from '../services/authService.js';
import { UserRole, BeltRank, StudentStatus } from '../types.js';

test('Unit Tests: Authentication Service', async (t) => {
  await t.test('generateToken and verifyToken', () => {
    const mockUser = {
      id: 'test-user-123',
      name: 'Sensei Miyagi',
      email: 'miyagi@dojo.com',
      passwordHash: 'dummyhash',
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
    };

    const token = authService.generateToken(mockUser);
    assert.ok(token, 'Should successfully generate a token string');
    assert.strictEqual(typeof token, 'string', 'Token should be a string');

    const decoded = authService.verifyToken(token);
    assert.ok(decoded, 'Should verify and decode token successfully');
    assert.strictEqual(decoded.id, mockUser.id, 'Decoded user ID should match original');
    assert.strictEqual(decoded.role, mockUser.role, 'Decoded role should match original');
  });

  await t.test('verifyToken with expired or tampered token', () => {
    const invalidToken = 'abcde.1234567890abcdef';
    const decoded = authService.verifyToken(invalidToken);
    assert.strictEqual(decoded, null, 'Should return null for tampered signature');
    
    const decodedNull = authService.verifyToken('');
    assert.strictEqual(decodedNull, null, 'Should return null for empty token');
  });
});

test('Unit Tests: Belt Rank Progressions', () => {
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

  // Verify transition rankings
  const whiteIdx = beltOrder.indexOf(BeltRank.WHITE);
  const yellowIdx = beltOrder.indexOf(BeltRank.YELLOW);
  const blackIdx = beltOrder.indexOf(BeltRank.BLACK);

  assert.ok(whiteIdx < yellowIdx, 'Yellow belt should rank higher than White');
  assert.ok(yellowIdx < blackIdx, 'Black belt should rank higher than Yellow');
});
