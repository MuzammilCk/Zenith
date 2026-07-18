/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as crypto from 'crypto';
import { db } from '../db/database.js';
import { User, UserRole, LoginResponse } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'karate-master-secret-key-2026';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export class AuthService {
  /**
   * Generates a secure, self-contained signed session token.
   * Format: base64(userId:role:expiry) . signature
   */
  generateToken(user: User): string {
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const payload = `${user.id}:${user.role}:${expiry}`;
    const payloadBase64 = Buffer.from(payload).toString('base64');
    
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadBase64)
      .digest('hex');

    return `${payloadBase64}.${signature}`;
  }

  /**
   * Verifies and decodes a signed session token.
   */
  verifyToken(token: string): { id: string; role: UserRole } | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadBase64)
      .digest('hex');

    if (signature !== expectedSignature) return null;

    try {
      const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const [userId, role, expiryStr] = decodedPayload.split(':');
      const expiry = parseInt(expiryStr, 10);

      if (Date.now() > expiry) {
        return null; // Token expired
      }

      return { id: userId, role: role as UserRole };
    } catch {
      return null;
    }
  }

  /**
   * Performs user login verification.
   */
  login(email: string, password: string): LoginResponse | null {
    const user = db.getUserByEmail(email);
    if (!user) return null;
    if (user.status === 'inactive') return null;

    const hashedPassword = hashPassword(password);
    if (user.passwordHash !== hashedPassword) return null;

    const token = this.generateToken(user);
    db.createAuditLog(user.id, 'USER_LOGIN', `User ${user.name} logged in successfully.`);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export const authService = new AuthService();
