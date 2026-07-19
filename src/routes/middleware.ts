/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { db } from '../db/database.js';
import { UserRole } from '../types.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    assignedBatchIds?: string[];
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please provide a Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = authService.verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
    return;
  }

  // Enforce status active check
  const user = db.getUserById(decoded.id);
  if (!user) {
    res.status(401).json({ error: 'User account not found.' });
    return;
  }
  if (user.status === 'inactive') {
    res.status(403).json({ error: 'Access denied. Account is inactive.' });
    return;
  }

  req.user = decoded;
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied. You do not have the required permissions.' });
      return;
    }

    next();
  };
}
