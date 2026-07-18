/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Clock, Search, FileText, RefreshCw } from 'lucide-react';
import { AuditLog } from '../types.js';

interface AuditLogsProps {
  token: string;
}

interface DetailedAuditLog extends AuditLog {
  userName: string;
}

export default function AuditLogs({ token }: AuditLogsProps) {
  const [logs, setLogs] = useState<DetailedAuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DetailedAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [token]);

  useEffect(() => {
    if (!search) {
      setFilteredLogs(logs);
    } else {
      const q = search.toLowerCase();
      setFilteredLogs(
        logs.filter(
          (l) =>
            l.action.toLowerCase().includes(q) ||
            l.details.toLowerCase().includes(q) ||
            l.userName.toLowerCase().includes(q)
        )
      );
    }
  }, [search, logs]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to load system audit logs.');
      }
      const data = await response.json();
      setLogs(data);
      setFilteredLogs(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading logs.');
    } finally {
      setLoading(false);
    }
  };

  const getActionStyle = (action: string) => {
    if (action.includes('DELETE')) return 'bg-[#e60012]/10 text-[#e60012]';
    if (action.includes('CREATE') || action.includes('PROMOTE')) return 'bg-[#059669]/10 text-[#059669]';
    if (action.includes('UPDATE')) return 'bg-[#0071e3]/10 text-[var(--color-primary)]';
    return 'bg-[var(--color-canvas-parchment)] text-[var(--color-ink-muted-80)]';
  };

  return (
    <div className="space-y-8" id="audit-logs-workspace">

      {/* Header */}
      <div>
        <h1 className="display-md text-[var(--color-ink)]">Audit Logs</h1>
        <p className="lead text-[var(--color-ink-muted-48)]" style={{ fontSize: 21 }}>
          System-level action history and security trails.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-ink-muted-48)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-pill w-full pl-11"
            placeholder="Filter logs by action, details, or user..."
            id="audit-search-input"
          />
        </div>

        <button onClick={fetchLogs} className="btn-utility-sm">
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4" id="logs-loading">
          <div className="spinner" />
          <p className="body-strong text-[var(--color-ink-muted-48)]">Loading audit trail...</p>
        </div>
      ) : error ? (
        <div className="card-utility text-center space-y-4" id="logs-error">
          <p className="body-strong text-[var(--color-ink)]">{error}</p>
          <button onClick={fetchLogs} className="btn-primary">Try Again</button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card-utility py-16 text-center space-y-3" id="logs-empty">
          <FileText className="w-12 h-12 text-[var(--color-ink-muted-48)] mx-auto" />
          <h4 className="display-md text-[var(--color-ink)]" style={{ fontSize: 28 }}>No Audit Entries</h4>
          <p className="caption text-[var(--color-ink-muted-48)]">No system actions match your current filter.</p>
        </div>
      ) : (
        <div className="card-utility p-0 overflow-hidden" id="audit-logs-table-container">
          <div className="overflow-x-auto">
            <table className="table-apple">
              <thead>
                <tr>
                  <th>Action Type</th>
                  <th>User</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} id={`audit-row-${log.id}`}>
                    <td>
                      <span className={`badge-status ${getActionStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-canvas-parchment)] text-[var(--color-ink)] flex items-center justify-center body-strong">
                          {log.userName.charAt(0)}
                        </div>
                        <span className="body-strong text-[var(--color-ink)]">{log.userName}</span>
                      </div>
                    </td>
                    <td className="caption text-[var(--color-ink)] max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 caption text-[var(--color-ink-muted-48)]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{log.createdAt.replace('T', ' ').substring(0, 19)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}