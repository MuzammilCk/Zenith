/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Award, AlertCircle, ArrowRight } from 'lucide-react';
import { Student, BeltRank } from '../types.js';

interface BeltPromoterProps {
  token: string;
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BeltPromoter({
  token,
  student,
  onClose,
  onSuccess,
}: BeltPromoterProps) {
  const [newBelt, setNewBelt] = useState<BeltRank>(BeltRank.WHITE);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Karate Belt Progression Order
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

  const currentIdx = beltOrder.indexOf(student.currentBelt);

  // Filter available belts to only show strictly higher ranks
  const eligibleBelts = beltOrder.slice(currentIdx + 1);

  // Set default selection to the next belt in order if available
  useState(() => {
    if (eligibleBelts.length > 0) {
      setNewBelt(eligibleBelts[0]);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const newIdx = beltOrder.indexOf(newBelt);
    if (newIdx <= currentIdx) {
      setError(`Invalid rank upgrade. New belt must be strictly higher than ${student.currentBelt} belt.`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/students/${student.id}/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newBelt,
          date,
          notes: notes.trim() || `Promoted to ${newBelt} belt.`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process student belt promotion.');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error occurred during belt promotion.');
    } finally {
      setSubmitting(false);
    }
  };

  const getBeltStyle = (b: BeltRank) => {
    if (b === BeltRank.WHITE) return 'bg-slate-50 border border-slate-300 text-slate-700';
    if (b === BeltRank.YELLOW) return 'bg-amber-400 text-amber-950';
    if (b === BeltRank.ORANGE) return 'bg-orange-500 text-white';
    if (b === BeltRank.GREEN) return 'bg-emerald-600 text-white';
    if (b === BeltRank.BLUE) return 'bg-blue-600 text-white';
    if (b === BeltRank.PURPLE) return 'bg-purple-600 text-white';
    if (b === BeltRank.BROWN) return 'bg-amber-800 text-amber-100';
    return 'bg-slate-950 text-white border border-slate-800';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40" id="belt-promoter-overlay">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Award className="w-5 h-5 text-red-600" />
            <span>Rank Promotion Exam</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            id="close-promoter"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6" id="belt-promotion-form">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-3 text-sm" id="promoter-error">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Student current rank display */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Promoting Student</h4>
            <p className="text-base font-extrabold text-slate-800 mt-1">{student.name}</p>
            
            <div className="flex items-center justify-center space-x-4 mt-3">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${getBeltStyle(student.currentBelt)}`}>
                {student.currentBelt}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              {eligibleBelts.length > 0 ? (
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${getBeltStyle(newBelt)}`}>
                  {newBelt}
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400 italic">Max Rank Reached</span>
              )}
            </div>
          </div>

          {eligibleBelts.length === 0 ? (
            <div className="text-center py-4 text-sm font-semibold text-slate-500">
              🎓 This student has already achieved the highest rank (**Black Belt**). No further promotions are possible.
            </div>
          ) : (
            <div className="space-y-4">
              {/* New Belt Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Target Belt Rank
                </label>
                <select
                  value={newBelt}
                  onChange={(e: any) => setNewBelt(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                  id="select-new-belt"
                >
                  {eligibleBelts.map((belt) => (
                    <option key={belt} value={belt}>
                      {belt} Belt
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Promotion Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all font-mono"
                  id="promoter-date"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Examiner's Grading Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                  placeholder="e.g. Demonstrated outstanding kata form and strong spirit during sparring..."
                  rows={3}
                  id="promoter-notes"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
              id="cancel-promotion-btn"
            >
              Close
            </button>
            {eligibleBelts.length > 0 && (
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-red-600/15 disabled:opacity-50 transition-all cursor-pointer"
                id="submit-promotion-btn"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Confirm Upgrade</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
