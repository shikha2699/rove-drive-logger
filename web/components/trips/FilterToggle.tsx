"use client";

import type { TripFilter } from "@/types/trip";

interface Props {
  value: TripFilter;
  onChange: (value: TripFilter) => void;
}

export function FilterToggle({ value, onChange }: Props) {
  return (
    <div className="filter" role="group" aria-label="Filter trips">
      <button
        type="button"
        className={`filter__btn ${value === "all" ? "filter__btn--active" : ""}`}
        onClick={() => onChange("all")}
        aria-pressed={value === "all"}
      >
        All trips
      </button>
      <button
        type="button"
        className={`filter__btn ${value === "memorable" ? "filter__btn--active" : ""}`}
        onClick={() => onChange("memorable")}
        aria-pressed={value === "memorable"}
      >
        Memorable
      </button>
    </div>
  );
}
