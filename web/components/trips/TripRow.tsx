"use client";

import type { Trip } from "@/types/trip";
import { formatDateRange, formatDistance } from "@/utils/format";
import { StarToggle } from "./StarToggle";

interface Props {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onToggleMemorable: (trip: Trip) => void;
  togglingId: string | null;
}

export function TripRow({ trip, onEdit, onDelete, onToggleMemorable, togglingId }: Props) {
  return (
    <article
      className={`trip-card ${trip.memorable ? "trip-card--memorable" : ""}`}
      aria-label={`Trip from ${trip.startLocation} to ${trip.endLocation}`}
    >
      <StarToggle
        active={trip.memorable}
        onToggle={() => onToggleMemorable(trip)}
        label={trip.memorable ? "Remove memorable mark" : "Mark as memorable"}
      />

      <div>
        <div className="trip-card__route">
          <span>{trip.startLocation}</span>
          <span className="trip-card__arrow" aria-hidden="true">→</span>
          <span>{trip.endLocation}</span>
          {trip.memorable && (
            <span className="trip-card__badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Memorable
            </span>
          )}
        </div>
        <div className="trip-card__meta">
          <span>{formatDateRange(trip.startTime, trip.endTime)}</span>
          <span>{formatDistance(trip.distanceKm)}</span>
        </div>
        {trip.notes && <p className="trip-card__notes">&ldquo;{trip.notes}&rdquo;</p>}
      </div>

      <div className="trip-card__actions">
        <button
          type="button"
          className="btn--icon"
          onClick={() => onEdit(trip)}
          aria-label={`Edit trip from ${trip.startLocation} to ${trip.endLocation}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          type="button"
          className="btn--icon"
          onClick={() => onDelete(trip)}
          aria-label={`Delete trip from ${trip.startLocation} to ${trip.endLocation}`}
          disabled={togglingId === trip.id}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
    </article>
  );
}
