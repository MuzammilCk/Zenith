/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Users,
  Award,
  CalendarCheck,
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

export default function Dashboard({ token }: DashboardProps) {
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
        headers: { Authorization: `Bearer ${token}` },
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
        <div className="spinner" />
        <p className="body-strong text-[var(--color-ink-muted-48)]">Loading dojo statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="card-utility text-center space-y-4" id="dashboard-error">
        <p className="body-strong text-[var(--color-ink-muted-48)]">{error || 'Unable to load dashboard data.'}</p>
        <button onClick={fetchStats} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const dominantBelt = Object.entries(stats.beltDistribution).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    [BeltRank.WHITE, 0]
  );

  return (
    <div className="space-y-6" id="dashboard-view">
      <section className="hero-panel">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="pill-chip w-fit">Live dojo command center</p>
            <h1 className="display-lg mt-3 text-[var(--color-ink)]">Welcome back, Sensei.</h1>
            <p className="lead mt-3 text-[var(--color-ink-muted-48)]" style={{ fontSize: 21 }}>
              Keep attendance, belt milestones, and student progress organized from one calm workspace.
            </p>
          </div>
          <div className="section-surface w-full max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="caption-strong text-[var(--color-ink-muted-48)]">Current focus</p>
                <p className="body-strong text-[var(--color-ink)]">{stats.totalStudents} students enrolled</p>
              </div>
              <div className="rounded-full bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)]">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-utility flex items-center justify-between">
          <div>
            <p className="caption-strong text-[var(--color-ink-muted-48)]">Total Students</p>
            <p className="display-md mt-1" id="stat-total-students" style={{ fontSize: 40, fontFamily: 'var(--font-display)', lineHeight: 1.1, letterSpacing: 0 }}>{stats.totalStudents}</p>
            <p className="caption mt-1 text-[var(--color-ink-muted-48)]">Enrollment directory</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-canvas-parchment)] text-[var(--color-primary)]">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="card-utility flex items-center justify-between">
          <div>
            <p className="caption-strong text-[var(--color-ink-muted-48)]">Active Members</p>
            <p className="display-md mt-2" id="stat-active-students" style={{ fontSize: 40, fontFamily: 'var(--font-display)', lineHeight: 1.1, letterSpacing: 0 }}>{stats.activeStudents}</p>
            <p className="caption mt-1 text-[var(--color-ink-muted-48)]">
              {stats.totalStudents > 0 ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% active rate` : 'No students enrolled'}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-canvas-parchment)] text-[var(--color-primary)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="card-utility flex items-center justify-between">
          <div>
            <p className="caption-strong text-[var(--color-ink-muted-48)]">Attendance Rate</p>
            <p className="display-md mt-2" style={{ fontSize: 40, fontFamily: 'var(--font-display)', lineHeight: 1.1, letterSpacing: 0 }} id="stat-attendance-rate">{stats.overallAttendanceRate}%</p>
            <p className="caption mt-1 text-[var(--color-ink-muted-48)]">Average presence</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-canvas-parchment)] text-[var(--color-primary)]">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="card-utility flex items-center justify-between">
          <div>
            <p className="caption-strong text-[var(--color-ink-muted-48)]">Dominant Rank</p>
            <p className="display-md mt-2" style={{ fontSize: 34, fontFamily: 'var(--font-display)', lineHeight: 1.1, letterSpacing: 0 }} id="stat-dominant-belt">{dominantBelt[0]}</p>
            <p className="caption mt-1 text-[var(--color-ink-muted-48)]">
              {dominantBelt[1]} student{dominantBelt[1] !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card-utility lg:col-span-1">
          <div className="mb-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-[var(--color-ink)]" />
            <h3 className="caption-strong text-[var(--color-ink)]">Belt Distribution</h3>
          </div>

          <div className="space-y-4" id="belt-distribution-chart">
            {Object.entries(stats.beltDistribution).map(([belt, count]) => {
              const values = Object.values(stats.beltDistribution) as number[];
              const maxCount = Math.max(...values, 1);
              const percentage = Math.round(((count as number) / maxCount) * 100);

              let barColor = 'bg-[var(--color-ink)]';
              if (belt === BeltRank.WHITE) { barColor = 'bg-[var(--color-hairline)]'; }
              else if (belt === BeltRank.YELLOW) { barColor = 'bg-[#fbbf24]'; }
              else if (belt === BeltRank.ORANGE) { barColor = 'bg-[#f97316]'; }
              else if (belt === BeltRank.GREEN) { barColor = 'bg-[#059669]'; }
              else if (belt === BeltRank.BLUE) { barColor = 'bg-[#2563eb]'; }
              else if (belt === BeltRank.PURPLE) { barColor = 'bg-[#9333ea]'; }
              else if (belt === BeltRank.BROWN) { barColor = 'bg-[#92400e]'; }
              else if (belt === BeltRank.BLACK) { barColor = 'bg-[var(--color-ink)]'; }

              return (
                <div key={belt} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="fine-print flex items-center gap-2 font-semibold text-[var(--color-ink)]">
                      <span className={`h-2.5 w-2.5 rounded-full ${barColor}`} />
                      {belt}
                    </span>
                    <span className="fine-print font-semibold text-[var(--color-ink-muted-48)]">{count as number}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-divider-soft)]">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-utility flex flex-col lg:col-span-2">
          <div className="mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--color-ink)]" />
            <h3 className="caption-strong text-[var(--color-ink)]">Attendance Activity Trend</h3>
          </div>

          <div className="overflow-x-auto">
            <div className="relative flex min-h-[220px] min-w-[500px] items-end justify-between border-b border-[var(--color-hairline)] pb-2 pt-6" id="attendance-trend-chart">
              {stats.attendanceTrend.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="caption text-[var(--color-ink-muted-48)]">No attendance activity recorded yet.</p>
                </div>
              ) : (
                stats.attendanceTrend.map((trend) => {
                  const total = trend.present + trend.absent + trend.tardy;
                  const maxTotal = Math.max(...stats.attendanceTrend.map((t) => t.present + t.absent + t.tardy), 1);

                  const presentPct = total > 0 ? (trend.present / maxTotal) * 100 : 0;
                  const tardyPct = total > 0 ? (trend.tardy / maxTotal) * 100 : 0;
                  const absentPct = total > 0 ? (trend.absent / maxTotal) * 100 : 0;

                  return (
                    <div key={trend.date} className="group relative flex flex-1 flex-col items-center">
                      <div className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-[var(--color-surface-tile-1)] px-3 py-2 text-[var(--color-on-dark)] opacity-0 transition-opacity group-hover:opacity-100 fine-print">
                        <p className="mb-1 border-b border-white/10 pb-1 font-semibold">{trend.date}</p>
                        <p className="text-[#4ade80]">Present: {trend.present}</p>
                        <p className="text-[#60a5fa]">Tardy: {trend.tardy}</p>
                        <p className="text-[#f87171]">Absent: {trend.absent}</p>
                      </div>
                      <div className="flex h-[180px] w-7 flex-col justify-end space-y-px overflow-hidden rounded-t-sm bg-[var(--color-canvas-parchment)]">
                        {trend.absent > 0 && <div className="w-full bg-[#f87171]" style={{ height: `${absentPct}%` }} />}
                        {trend.tardy > 0 && <div className="w-full bg-[#60a5fa]" style={{ height: `${tardyPct}%` }} />}
                        {trend.present > 0 && <div className="w-full bg-[#4ade80]" style={{ height: `${presentPct}%` }} />}
                      </div>
                      <span className="mt-2 rotate-12 origin-left whitespace-nowrap fine-print text-[var(--color-ink-muted-48)]">
                        {trend.date.substring(5)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {stats.attendanceTrend.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-6 fine-print">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
                <span className="text-[var(--color-ink)]">Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#60a5fa]" />
                <span className="text-[var(--color-ink)]">Tardy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                <span className="text-[var(--color-ink)]">Absent</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card-utility" id="recent-promotions-section">
        <div className="mb-6 flex items-center gap-2">
          <Award className="h-5 w-5 text-[var(--color-ink)]" />
          <h3 className="caption-strong text-[var(--color-ink)]">Recent Promotions</h3>
        </div>

        {stats.recentPromotions.length === 0 ? (
          <p className="py-8 text-center caption text-[var(--color-ink-muted-48)]">No promotions recorded recently.</p>
        ) : (
          <div className="ml-3 space-y-6 border-l border-[var(--color-hairline)]">
            {stats.recentPromotions.map((p) => {
              const getBeltStyle = (b: BeltRank) => {
                if (b === BeltRank.WHITE) return 'bg-white border border-[var(--color-hairline)] text-[var(--color-ink)]';
                if (b === BeltRank.YELLOW) return 'bg-[#fbbf24] text-[#451a03]';
                if (b === BeltRank.ORANGE) return 'bg-[#f97316] text-white';
                if (b === BeltRank.GREEN) return 'bg-[#059669] text-white';
                if (b === BeltRank.BLUE) return 'bg-[#2563eb] text-white';
                if (b === BeltRank.PURPLE) return 'bg-[#9333ea] text-white';
                if (b === BeltRank.BROWN) return 'bg-[#92400e] text-[#fef3c7]';
                return 'bg-[var(--color-ink)] text-white';
              };

              return (
                <div key={p.id} className="relative pl-6">
                  <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h5 className="body-strong text-[var(--color-ink)]">{p.studentName}</h5>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`badge-belt ${getBeltStyle(p.oldBelt)}`}>{p.oldBelt}</span>
                        <ArrowRight className="h-4 w-4 text-[var(--color-ink-muted-48)]" />
                        <span className={`badge-belt ${getBeltStyle(p.newBelt)}`}>{p.newBelt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 fine-print text-[var(--color-ink-muted-48)]">
                      <Clock className="h-3.5 w-3.5" />
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