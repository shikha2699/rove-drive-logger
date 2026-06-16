"use client";

interface Props {
  onAddTrip: () => void;
  filterActive?: boolean;
}

export function EmptyState({ onAddTrip, filterActive }: Props) {
  return (
    <div className="state">
      <svg className="state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M9 20l-5.447-2.724A2 2 0 014 15.382V6.618a2 2 0 011.553-1.946L9 2l5.447 2.672A2 2 0 0116 6.618v8.764a2 2 0 01-1.553 1.946L9 20z" />
        <path d="M9 2v18M15 6.5l-6 3" />
      </svg>
      <h3 className="state__title">
        {filterActive ? "No memorable trips yet" : "No trips logged"}
      </h3>
      <p className="state__text">
        {filterActive
          ? "Star a trip to mark it as memorable and see it here."
          : "Record your first drive — a commute, road trip, or meaningful journey."}
      </p>
      {!filterActive && (
        <button type="button" className="btn btn--primary" onClick={onAddTrip}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add your first trip
        </button>
      )}
    </div>
  );
}
