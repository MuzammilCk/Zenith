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
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Fetching dojo statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center" id="dashboard-error">
        <p className="font-semibold">{error || 'Unable to load dashboard data.'}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-500 transition-all cursor-pointer"
        >
          Try Again
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Students */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1" id="stat-total-students">{stats.totalStudents}</h3>
            <p className="text-xs text-slate-500 mt-1">Enrollment directory size</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Active Students */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Members</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1" id="stat-active-students">{stats.activeStudents}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {stats.totalStudents > 0
                ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% active rate`
                : 'No students enrolled'}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Attendance Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1" id="stat-attendance-rate">{stats.overallAttendanceRate}%</h3>
            <p className="text-xs text-slate-500 mt-1">Average session presence</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Most Common Belt */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dominant Rank</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5" id="stat-dominant-belt">{dominantBelt[0]}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {dominantBelt[1]} student{dominantBelt[1] !== 1 ? 's' : ''} at this rank
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Visualized Charts and Recent Promotion logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Belt Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-extrabold text-slate-900 text-lg">Belt Distribution</h4>
              <p className="text-xs text-slate-500 font-medium">Rank population breakdown</p>
            </div>
            <Award className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4" id="belt-distribution-chart">
            {Object.entries(stats.beltDistribution).map(([belt, count]) => {
              const values = Object.values(stats.beltDistribution) as number[];
              const maxCount = Math.max(...values, 1);
              const percentage = Math.round(((count as number) / maxCount) * 100);
              
              // Map belt name to custom aesthetic color accents
              let barBgColor = 'bg-slate-400';
              let badgeBgColor = 'bg-slate-100 text-slate-700';

              if (belt === BeltRank.WHITE) {
                barBgColor = 'bg-slate-300 border border-slate-400';
                badgeBgColor = 'bg-slate-100 text-slate-700';
              } else if (belt === BeltRank.YELLOW) {
                barBgColor = 'bg-amber-400';
                badgeBgColor = 'bg-amber-100 text-amber-800';
              } else if (belt === BeltRank.ORANGE) {
                barBgColor = 'bg-orange-500';
                badgeBgColor = 'bg-orange-100 text-orange-800';
              } else if (belt === BeltRank.GREEN) {
                barBgColor = 'bg-emerald-600';
                badgeBgColor = 'bg-emerald-100 text-emerald-800';
              } else if (belt === BeltRank.BLUE) {
                barBgColor = 'bg-blue-600';
                badgeBgColor = 'bg-blue-100 text-blue-800';
              } else if (belt === BeltRank.PURPLE) {
                barBgColor = 'bg-purple-600';
                badgeBgColor = 'bg-purple-100 text-purple-800';
              } else if (belt === BeltRank.BROWN) {
                barBgColor = 'bg-amber-800';
                badgeBgColor = 'bg-amber-950 text-amber-200';
              } else if (belt === BeltRank.BLACK) {
                barBgColor = 'bg-slate-950 border border-slate-900';
                badgeBgColor = 'bg-slate-950 text-white';
              }

              return (
                <div key={belt} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${barBgColor}`} />
                      <span>{belt}</span>
                    </span>
                    <span className="font-mono text-slate-500 font-bold">{count} student{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barBgColor} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Activity Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-extrabold text-slate-900 text-lg">Attendance Activity Trend</h4>
              <p className="text-xs text-slate-500 font-medium">Class presence trend (recent active sessions)</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>

          <div className="flex-1 min-h-[220px] flex items-end justify-between relative pt-6 border-b border-slate-100 pb-1" id="attendance-trend-chart">
            {stats.attendanceTrend.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-semibold">
                No attendance activity recorded yet.
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
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white rounded px-2.5 py-1 text-xxs leading-relaxed whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10 flex flex-col border border-slate-800">
                      <span className="font-bold border-b border-slate-800 pb-0.5 mb-1 text-slate-400">{trend.date}</span>
                      <span className="text-emerald-400">Present: {trend.present}</span>
                      <span className="text-blue-400">Tardy: {trend.tardy}</span>
                      <span className="text-red-400">Absent: {trend.absent}</span>
                    </div>

                    {/* Stacked Bar Chart */}
                    <div className="w-8 flex flex-col justify-end space-y-0.5 bg-slate-50 rounded-t-md hover:bg-slate-100/50 transition-colors h-[180px]">
                      {trend.absent > 0 && (
                        <div
                          className="w-full bg-red-400 rounded-t-sm"
                          style={{ height: `${absentPct}%` }}
                        />
                      )}
                      {trend.tardy > 0 && (
                        <div
                          className="w-full bg-blue-400"
                          style={{ height: `${tardyPct}%` }}
                        />
                      )}
                      {trend.present > 0 && (
                        <div
                          className="w-full bg-emerald-500 rounded-b-sm"
                          style={{ height: `${presentPct}%` }}
                        />
                      )}
                    </div>
                    {/* Date label */}
                    <span className="text-xxs font-mono text-slate-400 mt-2 rotate-12 origin-left whitespace-nowrap">
                      {trend.date.substring(5)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Chart Legend */}
          {stats.attendanceTrend.length > 0 && (
            <div className="flex items-center space-x-6 mt-4 justify-center text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-slate-600 font-semibold">Present</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-400" />
                <span className="text-slate-600 font-semibold">Tardy</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-400" />
                <span className="text-slate-600 font-semibold">Absent</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Promotions timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" id="recent-promotions-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="font-extrabold text-slate-900 text-lg">Recent Promotions</h4>
            <p className="text-xs text-slate-500 font-medium">Latest belt upgrades in the dojo</p>
          </div>
          <Award className="w-5 h-5 text-red-600" />
        </div>

        {stats.recentPromotions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm font-semibold border-2 border-dashed border-slate-100 rounded-xl">
            No promotions recorded recently.
          </div>
        ) : (
          <div className="relative border-l border-slate-200 ml-4 space-y-6">
            {stats.recentPromotions.map((p) => {
              // Custom color mappings for old & new belts
              const getBeltStyle = (b: BeltRank) => {
                if (b === BeltRank.WHITE) return 'bg-slate-100 text-slate-700 border border-slate-300';
                if (b === BeltRank.YELLOW) return 'bg-amber-100 text-amber-800';
                if (b === BeltRank.ORANGE) return 'bg-orange-100 text-orange-800';
                if (b === BeltRank.GREEN) return 'bg-emerald-100 text-emerald-800';
                if (b === BeltRank.BLUE) return 'bg-blue-100 text-blue-800';
                if (b === BeltRank.PURPLE) return 'bg-purple-100 text-purple-800';
                if (b === BeltRank.BROWN) return 'bg-amber-950 text-amber-200';
                return 'bg-slate-950 text-white';
              };

              return (
                <div key={p.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-red-600 border border-white" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm">
                        {p.studentName}
                      </h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${getBeltStyle(p.oldBelt)}`}>
                          {p.oldBelt}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${getBeltStyle(p.newBelt)}`}>
                          {p.newBelt}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium font-mono">
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
