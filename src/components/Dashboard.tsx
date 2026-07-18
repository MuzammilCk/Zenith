/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Users,
  Award,
  CalendarCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { DashboardStats, BeltRank } from '../types.js';

interface DashboardProps {
  token: string;
  onViewStudent: (studentId: string) => void;
}

export default function Dashboard({ token, onViewStudent }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load dashboard metrics.');
      }
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4" id="dashboard-loading">
        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="ui-label text-[11px] text-[var(--color-ink)]">Fetching dojo statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bevel-plate-platinum border border-[var(--color-error)] text-[var(--color-error)] p-6 rounded-sm text-center" id="dashboard-error">
        <p className="font-bold text-xs">{error || 'Unable to load dashboard data.'}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-[var(--color-signal)] text-white rounded-xs font-bold text-xs hover:bg-[#ff9d38] transition-all cursor-pointer border-b-2 border-[#b86105]"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  // Find dominant belt rank
  const dominantBelt = Object.entries(stats.beltDistribution).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    [BeltRank.WHITE, 0]
  );

  return (
    <div className="space-y-8" id="dashboard-view">
      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bevel-plate-platinum p-4 rounded-sm flex items-center justify-between">
          <div>
            <span className="ui-label text-[10px] text-[var(--color-ink-soft)]">TOTAL STUDENTS</span>
            <h3 className="font-display text-2xl font-black text-[var(--color-ink)] mt-1" id="stat-total-students">{stats.totalStudents}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Enrollment directory size</p>
          </div>
          <div className="p-2 bg-white text-[var(--color-chrome-indigo)] rounded-full border border-[var(--color-hairline)]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Active Students */}
        <div className="bevel-plate-platinum p-4 rounded-sm flex items-center justify-between">
          <div>
            <span className="ui-label text-[10px] text-[var(--color-ink-soft)]">ACTIVE MEMBERS</span>
            <h3 className="font-display text-2xl font-black text-[var(--color-ink)] mt-1" id="stat-active-students">{stats.activeStudents}</h3>
            <p className="text-[10px] text-slate-500 mt-1">
              {stats.totalStudents > 0
                ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% active rate`
                : 'No students enrolled'}
            </p>
          </div>
          <div className="p-2 bg-white text-[var(--color-chrome-indigo)] rounded-full border border-[var(--color-hairline)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Attendance Rate */}
        <div className="bevel-plate-platinum p-4 rounded-sm flex items-center justify-between">
          <div>
            <span className="ui-label text-[10px] text-[var(--color-ink-soft)]">ATTENDANCE RATE</span>
            <h3 className="font-display text-2xl font-black text-[var(--color-ink)] mt-1" id="stat-attendance-rate">{stats.overallAttendanceRate}%</h3>
            <p className="text-[10px] text-slate-500 mt-1">Average session presence</p>
          </div>
          <div className="p-2 bg-white text-[var(--color-chrome-indigo)] rounded-full border border-[var(--color-hairline)]">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Most Common Belt */}
        <div className="bevel-plate-platinum p-4 rounded-sm flex items-center justify-between">
          <div>
            <span className="ui-label text-[10px] text-[var(--color-ink-soft)]">DOMINANT RANK</span>
            <h3 className="font-display text-xl font-black text-[var(--color-ink)] mt-1" id="stat-dominant-belt">{dominantBelt[0]}</h3>
            <p className="text-[10px] text-slate-500 mt-1">
              {dominantBelt[1]} student{dominantBelt[1] !== 1 ? 's' : ''} at this rank
            </p>
          </div>
          <div className="p-2 bg-[var(--color-amber)] text-[var(--color-carbon)] rounded-full border border-[#a87a27]">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Visualized Charts and Recent Promotion logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Belt Distribution Bar Chart */}
        <div className="bevel-plate-platinum p-4 rounded-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4 bg-[var(--color-canvas)] text-[var(--color-ink)] px-2 py-1 border-b border-[var(--color-chrome-indigo)]">
            <h4 className="ui-label text-[11px] tracking-widest">≡ BELT DISTRIBUTION</h4>
            <Award className="w-3 h-3 text-[var(--color-ink)]" />
          </div>

          <div className="space-y-4 px-2" id="belt-distribution-chart">
            {Object.entries(stats.beltDistribution).map(([belt, count]) => {
              const values = Object.values(stats.beltDistribution) as number[];
              const maxCount = Math.max(...values, 1);
              const percentage = Math.round(((count as number) / maxCount) * 100);
              
              // Map belt name to custom aesthetic color accents
              let barBgColor = 'bg-[var(--color-carbon)]';
              let badgeBgColor = 'bg-[var(--color-platinum)] text-[var(--color-ink)] border border-[var(--color-hairline)]';

              if (belt === BeltRank.WHITE) {
                barBgColor = 'bg-[var(--color-platinum)] border border-[var(--color-hairline)]';
                badgeBgColor = 'bg-[var(--color-platinum)] text-[var(--color-ink)] border border-[var(--color-hairline)]';
              } else if (belt === BeltRank.YELLOW) {
                barBgColor = 'bg-[#fbbf24]';
                badgeBgColor = 'bg-[#fbbf24] text-[#451a03]';
              } else if (belt === BeltRank.ORANGE) {
                barBgColor = 'bg-[#f97316]';
                badgeBgColor = 'bg-[#f97316] text-white';
              } else if (belt === BeltRank.GREEN) {
                barBgColor = 'bg-[#059669]';
                badgeBgColor = 'bg-[#059669] text-white';
              } else if (belt === BeltRank.BLUE) {
                barBgColor = 'bg-[#2563eb]';
                badgeBgColor = 'bg-[#2563eb] text-white';
              } else if (belt === BeltRank.PURPLE) {
                barBgColor = 'bg-[#9333ea]';
                badgeBgColor = 'bg-[#9333ea] text-white';
              } else if (belt === BeltRank.BROWN) {
                barBgColor = 'bg-[#92400e]';
                badgeBgColor = 'bg-[#92400e] text-[#fef3c7]';
              } else if (belt === BeltRank.BLACK) {
                barBgColor = 'bg-black';
                badgeBgColor = 'bg-[var(--color-carbon)] text-white';
              }

              return (
                <div key={belt} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] ui-label">
                    <span className="text-[var(--color-ink)] flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-[1px] ${barBgColor}`} />
                      <span>{belt}</span>
                    </span>
                    <span className="font-mono text-[var(--color-ink-soft)] font-bold">{count} student{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-[var(--color-canvas)] rounded-sm h-3 overflow-hidden border border-[var(--color-hairline)] shadow-inner">
                    <div
                      className={`h-full ${barBgColor} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Activity Trend Chart */}
        <div className="bevel-plate-platinum p-4 rounded-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4 bg-[var(--color-canvas)] text-[var(--color-ink)] px-2 py-1 border-b border-[var(--color-chrome-indigo)]">
            <h4 className="ui-label text-[11px] tracking-widest">≡ ATTENDANCE ACTIVITY TREND</h4>
            <Activity className="w-3 h-3 text-[var(--color-ink)]" />
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[500px] flex-1 min-h-[220px] flex items-end justify-between relative pt-6 border-b border-[var(--color-chrome-indigo)] pb-1" id="attendance-trend-chart">
              {stats.attendanceTrend.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--color-ink-soft)] text-xs ui-label">
                  NO ATTENDANCE ACTIVITY RECORDED YET.
                </div>
              ) : (
                stats.attendanceTrend.map((trend) => {
                  const total = trend.present + trend.absent + trend.tardy;
                  const maxTotal = Math.max(
                    ...stats.attendanceTrend.map((t) => t.present + t.absent + t.tardy),
                    1
                  );
  
                  const presentPct = total > 0 ? (trend.present / maxTotal) * 100 : 0;
                  const tardyPct = total > 0 ? (trend.tardy / maxTotal) * 100 : 0;
                  const absentPct = total > 0 ? (trend.absent / maxTotal) * 100 : 0;
  
                  return (
                    <div key={trend.date} className="flex flex-col items-center flex-1 group relative">
                      {/* Tooltip on Hover */}
                      <div className="absolute bottom-full mb-2 bg-[var(--color-carbon)] text-white rounded-xs px-2.5 py-1 text-[10px] ui-label leading-relaxed whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10 flex flex-col border border-[var(--color-hairline)]">
                        <span className="border-b border-[#444] pb-0.5 mb-1 text-[var(--color-canvas-soft)]">{trend.date}</span>
                        <span className="text-[#4ade80]">PRESENT: {trend.present}</span>
                        <span className="text-[#60a5fa]">TARDY: {trend.tardy}</span>
                        <span className="text-[#f87171]">ABSENT: {trend.absent}</span>
                      </div>
  
                      {/* Stacked Bar Chart */}
                      <div className="w-6 sm:w-8 flex flex-col justify-end space-y-[1px] bg-[var(--color-canvas)] border border-[var(--color-hairline)] border-b-0 hover:bg-white transition-colors h-[180px]">
                        {trend.absent > 0 && (
                          <div
                            className="w-full bg-[#f87171]"
                            style={{ height: `${absentPct}%` }}
                          />
                        )}
                        {trend.tardy > 0 && (
                          <div
                            className="w-full bg-[#60a5fa]"
                            style={{ height: `${tardyPct}%` }}
                          />
                        )}
                        {trend.present > 0 && (
                          <div
                            className="w-full bg-[#4ade80]"
                            style={{ height: `${presentPct}%` }}
                          />
                        )}
                      </div>
                      {/* Date label */}
                      <span className="text-[9px] font-mono text-[var(--color-ink-soft)] font-bold mt-2 rotate-12 origin-left whitespace-nowrap">
                        {trend.date.substring(5)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chart Legend */}
          {stats.attendanceTrend.length > 0 && (
            <div className="flex items-center space-x-6 mt-4 justify-center text-[10px] ui-label">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-[#4ade80]" />
                <span className="text-[var(--color-ink)]">PRESENT</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-[#60a5fa]" />
                <span className="text-[var(--color-ink)]">TARDY</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-[#f87171]" />
                <span className="text-[var(--color-ink)]">ABSENT</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Promotions timeline */}
      <div className="bevel-plate-platinum p-4 rounded-sm" id="recent-promotions-section">
        <div className="flex items-center justify-between mb-4 bg-[var(--color-canvas)] text-[var(--color-ink)] px-2 py-1 border-b border-[var(--color-chrome-indigo)]">
          <h4 className="ui-label text-[11px] tracking-widest">≡ RECENT PROMOTIONS</h4>
          <Award className="w-3 h-3 text-[var(--color-ink)]" />
        </div>

        {stats.recentPromotions.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-ink-soft)] text-[10px] ui-label border border-dotted border-[var(--color-chrome-indigo)] rounded-sm">
            NO PROMOTIONS RECORDED RECENTLY.
          </div>
        ) : (
          <div className="relative border-l border-dotted border-[var(--color-chrome-indigo)] ml-4 space-y-6">
            {stats.recentPromotions.map((p) => {
              // Custom color mappings for old & new belts
              const getBeltStyle = (b: BeltRank) => {
                if (b === BeltRank.WHITE) return 'bg-white border border-[var(--color-hairline)] text-[var(--color-ink)]';
                if (b === BeltRank.YELLOW) return 'bg-[#fbbf24] text-[#451a03]';
                if (b === BeltRank.ORANGE) return 'bg-[#f97316] text-white';
                if (b === BeltRank.GREEN) return 'bg-[#059669] text-white';
                if (b === BeltRank.BLUE) return 'bg-[#2563eb] text-white';
                if (b === BeltRank.PURPLE) return 'bg-[#9333ea] text-white';
                if (b === BeltRank.BROWN) return 'bg-[#92400e] text-[#fef3c7]';
                return 'bg-[var(--color-carbon)] text-[var(--color-canvas)] border border-black';
              };

              return (
                <div key={p.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-[var(--color-primary)] border border-white" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h5 className="font-bold text-[var(--color-ink)] text-xs">
                        {p.studentName}
                      </h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] ui-label ${getBeltStyle(p.oldBelt)}`}>
                          {p.oldBelt}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" />
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] ui-label ${getBeltStyle(p.newBelt)}`}>
                          {p.newBelt}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-[var(--color-ink-soft)] font-bold font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{p.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
