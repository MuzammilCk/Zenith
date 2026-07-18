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
      return 'bg-red-50 text-red-700 border border-red-200';
    }
    if (action.includes('CREATE') || action.includes('PROMOTE')) {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
    }
    if (action.includes('UPDATE')) {
      return 'bg-blue-50 text-blue-700 border border-blue-200/60';
    }
    return 'bg-slate-50 text-slate-600 border border-slate-200';
  };

  return (
    <div className="space-y-6" id="audit-logs-workspace">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all shadow-xs"
            placeholder="Filter logs by action, details, or sensei..."
            id="audit-search-input"
          />
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
        >
          Refresh Log Trail
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4" id="logs-loading">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Retrieving dojo security audit trail...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center" id="logs-error">
          <p className="font-semibold">{error}</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white py-16 px-4 rounded-2xl border border-slate-200 text-center space-y-3" id="logs-empty">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-base">No Audit Entries</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            No system actions match your current log filter terms.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="audit-logs-table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-400 text-xxs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Action Type</th>
                  <th className="px-6 py-4">Sensei User</th>
                  <th className="px-6 py-4">Log Details</th>
                  <th className="px-6 py-4">Log Date/Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/40 transition-colors" id={`audit-row-${log.id}`}>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xxs font-extrabold uppercase tracking-wider ${getActionStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-3xs font-extrabold font-mono">
                          {log.userName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-xs">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 font-bold flex items-center space-x-1.5">
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
