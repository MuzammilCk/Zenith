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

export default function BeltPromoter({ token, student, onClose, onSuccess }: BeltPromoterProps) {
  const beltOrder = [
    BeltRank.WHITE, BeltRank.YELLOW, BeltRank.ORANGE, BeltRank.GREEN,
    BeltRank.BLUE, BeltRank.PURPLE, BeltRank.BROWN, BeltRank.BLACK,
  ];

  const currentIdx = beltOrder.indexOf(student.currentBelt);
  const eligibleBelts = beltOrder.slice(currentIdx + 1);

  const [newBelt, setNewBelt] = useState<BeltRank>(eligibleBelts[0] || BeltRank.WHITE);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    return 'bg-[var(--color-ink)] text-white';
  };

  return (
    <div className="modal-overlay" id="belt-promoter-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="display-md text-[var(--color-ink)] flex items-center gap-2" style={{ fontSize: 28 }}>
            <Award className="w-6 h-6 text-[var(--color-primary)]" />
            Rank Promotion Exam
          </h2>
          <button onClick={onClose} className="btn-icon-circular" style={{ width: 36, height: 36 }} id="close-promoter">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-5" id="belt-promotion-form">
          {error && (
            <div className="flex items-start gap-2 p-3 border border-[var(--color-error)] rounded-lg bg-[var(--color-error)]/5" id="promoter-error">
              <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
              <span className="caption text-[var(--color-error)]">{error}</span>
            </div>
          )}

          {/* Student current → target display */}
          <div className="bg-[var(--color-canvas-parchment)] rounded-lg p-5 text-center space-y-2">
            <p className="caption-strong text-[var(--color-ink-muted-48)]">Promoting Student</p>
            <p className="body-strong text-[var(--color-ink)]" style={{ fontSize: 19 }}>{student.name}</p>
            <div className="flex items-center justify-center gap-3">
              <span className={`badge-belt ${getBeltStyle(student.currentBelt)}`}>{student.currentBelt}</span>
              <ArrowRight className="w-4 h-4 text-[var(--color-ink-muted-48)]" />
              {eligibleBelts.length > 0 ? (
                <span className={`badge-belt ${getBeltStyle(newBelt)}`}>{newBelt}</span>
              ) : (
                <span className="caption text-[var(--color-ink-muted-48)] italic">Max Rank Reached</span>
              )}
            </div>
          </div>

          {eligibleBelts.length === 0 ? (
            <p className="caption text-[var(--color-ink-muted-48)] text-center py-4">
              This student has already achieved the highest rank (Black Belt). No further promotions are possible.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="label-field">Target Belt Rank</label>
                <select
                  value={newBelt}
                  onChange={(e: any) => setNewBelt(e.target.value)}
                  className="select-field"
                  id="select-new-belt"
                >
                  {eligibleBelts.map((belt) => (
                    <option key={belt} value={belt}>{belt} Belt</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Promotion Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                  id="promoter-date"
                />
              </div>

              <div>
                <label className="label-field">Examiner's Grading Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical', minHeight: 90 }}
                  placeholder="e.g. Demonstrated outstanding kata form and strong spirit during sparring..."
                  rows={3}
                  id="promoter-notes"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-divider-soft)]">
            <button type="button" onClick={onClose} className="btn-utility-sm" style={{ padding: '11px 22px', fontSize: 14 }} id="cancel-promotion-btn">
              Close
            </button>
            {eligibleBelts.length > 0 && (
              <button type="submit" disabled={submitting} className="btn-primary" id="submit-promotion-btn">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="spinner border-white/20 border-t-white" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Confirm Promotion
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