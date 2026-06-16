"use client";

import type { TripSummary } from "@/types/trip";
import { formatDistance } from "@/utils/format";

interface Props {
  summary: TripSummary;
}

export function SummaryCards({ summary }: Props) {
  return (
    <section className="summary" aria-label="Trip statistics">
      <div className="summary__card">
        <div className="summary__label">Total trips</div>
        <div className="summary__value">{summary.totalTrips.toLocaleString()}</div>
      </div>
      <div className="summary__card">
        <div className="summary__label">Total distance</div>
        <div className="summary__value">
          {formatDistance(summary.totalDistanceKm).replace(" km", "")}
          <span className="summary__unit">km</span>
        </div>
      </div>
      <div className="summary__card">
        <div className="summary__label">Memorable</div>
        <div className="summary__value summary__value--accent">
          {summary.memorableTrips.toLocaleString()}
        </div>
      </div>
    </section>
  );
}
