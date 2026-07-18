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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-40" id="belt-promoter-overlay">
      <div className="bevel-plate rounded-sm w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[var(--color-canvas)] px-4 py-3 flex items-center justify-between border-b border-[var(--color-chrome-indigo)]">
          <h3 className="ui-label text-[12px] text-[var(--color-ink)] tracking-widest flex items-center space-x-2">
            <Award className="w-4 h-4 text-[var(--color-primary)]" />
            <span>RANK PROMOTION EXAM</span>
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--color-ink-soft)] hover:text-black transition-colors cursor-pointer p-1 rounded-xs hover:bg-[var(--color-canvas-soft)]"
            id="close-promoter"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 bg-[var(--color-platinum)] space-y-4" id="belt-promotion-form">
          {error && (
            <div className="bg-white border border-[var(--color-error)] text-[var(--color-error)] p-3 rounded-xs flex items-start space-x-2 text-[11px] font-bold" id="promoter-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Student current rank display */}
          <div className="bg-[var(--color-canvas-soft)] p-3 rounded-xs border border-[var(--color-hairline)] text-center">
            <h4 className="text-[10px] ui-label text-[var(--color-ink-soft)]">PROMOTING STUDENT</h4>
            <p className="text-xs font-bold text-[var(--color-ink)] mt-1">{student.name}</p>
            
            <div className="flex items-center justify-center space-x-3 mt-2">
              <span className={`px-2 py-0.5 rounded-xs text-[10px] ui-label ${getBeltStyle(student.currentBelt)}`}>
                {student.currentBelt}
              </span>
              <ArrowRight className="w-3 h-3 text-[var(--color-ink-soft)]" />
              {eligibleBelts.length > 0 ? (
                <span className={`px-2 py-0.5 rounded-xs text-[10px] ui-label ${getBeltStyle(newBelt)}`}>
                  {newBelt}
                </span>
              ) : (
                <span className="text-[10px] ui-label text-[var(--color-ink-soft)] italic">MAX RANK REACHED</span>
              )}
            </div>
          </div>

          {eligibleBelts.length === 0 ? (
            <div className="text-center py-4 text-xs font-bold text-[var(--color-ink-soft)]">
              🎓 This student has already achieved the highest rank (**Black Belt**). No further promotions are possible.
            </div>
          ) : (
            <div className="space-y-4">
              {/* New Belt Selection */}
              <div>
                <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-1">
                  TARGET BELT RANK
                </label>
                <select
                  value={newBelt}
                  onChange={(e: any) => setNewBelt(e.target.value)}
                  className="w-full px-2 py-1.5 border border-[var(--color-hairline)] rounded-xs bg-white focus:outline-none focus:border-[var(--color-primary)] text-xs text-[var(--color-ink)] font-bold transition-all"
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
                <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-1">
                  PROMOTION DATE
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2 py-1.5 border border-[var(--color-hairline)] rounded-xs bg-white focus:outline-none focus:border-[var(--color-primary)] text-xs text-[var(--color-ink)] font-mono font-bold transition-all"
                  id="promoter-date"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] ui-label text-[var(--color-ink-soft)] mb-1">
                  EXAMINER'S GRADING NOTES
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2 py-2 border border-[var(--color-hairline)] rounded-xs bg-white focus:outline-none focus:border-[var(--color-primary)] text-xs text-[var(--color-ink)] transition-all"
                  placeholder="e.g. Demonstrated outstanding kata form and strong spirit during sparring..."
                  rows={3}
                  id="promoter-notes"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dotted border-[var(--color-chrome-indigo)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--color-hairline)] bg-[var(--color-carbon)] text-white ui-label rounded-xs text-[11px] transition-all cursor-pointer"
              id="cancel-promotion-btn"
            >
              CLOSE
            </button>
            {eligibleBelts.length > 0 && (
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[var(--color-signal)] text-white ui-label rounded-xs text-[11px] flex items-center space-x-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border-b-2 border-[#b86105] hover:bg-[#ff9d38] disabled:opacity-50 transition-all cursor-pointer"
                id="submit-promotion-btn"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>CONFIRM UPGRADE</span>
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
