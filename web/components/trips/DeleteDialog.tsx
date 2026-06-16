"use client";

import { useEffect, useRef } from "react";
import type { Trip } from "@/types/trip";

interface Props {
  trip: Trip | null;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}

export function DeleteDialog({ trip, onConfirm, onCancel, deleting }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trip) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [trip, onCancel]);

  if (!trip) return null;

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onCancel();
  }

  return (
    <div className="overlay" ref={overlayRef} onClick={handleOverlayClick} role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title">
      <div className="dialog">
        <h2 className="dialog__title" id="delete-dialog-title">Delete this trip?</h2>
        <p className="dialog__text">
          This will permanently remove the trip from <strong>{trip.startLocation}</strong> to{" "}
          <strong>{trip.endLocation}</strong>. This action cannot be undone.
        </p>
        <div className="dialog__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete trip"}
          </button>
        </div>
      </div>
    </div>
  );
}
