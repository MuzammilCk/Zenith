/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Clock, Search, ShieldAlert, FileText } from 'lucide-react';
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
    if (action.includes('DELETE')) {
      return 'bg-[var(--color-error)] text-white border border-[#7f1d1d]';
    }
    if (action.includes('CREATE') || action.includes('PROMOTE')) {
      return 'bg-[#4ade80] text-[var(--color-carbon)] border border-[#15803d]';
    }
    if (action.includes('UPDATE')) {
      return 'bg-[#60a5fa] text-[var(--color-carbon)] border border-[#1d4ed8]';
    }
    return 'bg-[var(--color-canvas)] text-[var(--color-ink)] border border-[var(--color-chrome-indigo)]';
  };

  return (
    <div className="space-y-4" id="audit-logs-workspace">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-[var(--color-ink-soft)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 border border-[var(--color-hairline)] bg-white rounded-xs focus:outline-none focus:border-[var(--color-primary)] text-xs transition-all"
            placeholder="Filter logs by action, details, or sensei..."
            id="audit-search-input"
          />
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-1.5 bg-[var(--color-carbon)] hover:bg-[#333] text-white ui-label text-[11px] rounded-xs transition-colors cursor-pointer border border-[var(--color-hairline)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
        >
          REFRESH LOG TRAIL
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bevel-plate-platinum rounded-sm" id="logs-loading">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="ui-label text-[11px] text-[var(--color-ink)]">Retrieving dojo security audit trail...</p>
        </div>
      ) : error ? (
        <div className="bevel-plate-platinum border border-[var(--color-error)] text-[var(--color-error)] p-6 rounded-sm text-center" id="logs-error">
          <p className="font-bold text-xs">{error}</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bevel-plate-platinum py-16 px-4 rounded-sm text-center space-y-3" id="logs-empty">
          <FileText className="w-12 h-12 text-[var(--color-chrome-indigo)] mx-auto opacity-50" />
          <h4 className="font-bold text-[var(--color-ink)] text-xs">No Audit Entries</h4>
          <p className="text-[11px] text-[var(--color-ink-soft)] max-w-xs mx-auto">
            No system actions match your current log filter terms.
          </p>
        </div>
      ) : (
        <div className="bevel-plate-platinum p-1 rounded-sm overflow-hidden" id="audit-logs-table-container">
          <div className="overflow-x-auto bg-[var(--color-platinum)] bevel-inset">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--color-canvas-soft)] border-b border-[var(--color-hairline)] text-[var(--color-ink-soft)] ui-label text-[10px]">
                  <th className="px-4 py-2 border-r border-[var(--color-hairline)]">ACTION TYPE</th>
                  <th className="px-4 py-2 border-r border-[var(--color-hairline)]">SENSEI USER</th>
                  <th className="px-4 py-2 border-r border-[var(--color-hairline)]">LOG DETAILS</th>
                  <th className="px-4 py-2">LOG DATE/TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-hairline)] text-[var(--color-ink)]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/40 transition-colors" id={`audit-row-${log.id}`}>
                    <td className="px-4 py-3 border-r border-[var(--color-hairline)]">
                      <span className={`inline-flex px-2 py-0.5 rounded-xs ui-label text-[10px] ${getActionStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-[var(--color-hairline)]">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-xs bg-[var(--color-canvas)] text-[var(--color-ink)] border border-[var(--color-chrome-indigo)] flex items-center justify-center font-display font-black text-xs shadow-sm">
                          {log.userName.charAt(0)}
                        </div>
                        <span className="font-bold text-[var(--color-ink)]">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[var(--color-ink)] max-w-sm truncate border-r border-[var(--color-hairline)]" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--color-ink-soft)] font-bold flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{log.createdAt.replace('T', ' ').substring(0, 19)}</span>
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
