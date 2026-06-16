"use client";

import { useEffect, useRef } from "react";
import type { TripFormData, TripModalMode } from "@/types/trip";
import { TripForm } from "./TripForm";

interface Props {
  open: boolean;
  mode: TripModalMode;
  data: TripFormData;
  onChange: (data: TripFormData) => void;
  onClose: () => void;
  onSubmit: () => void;
  saving: boolean;
  error: string | null;
}

export function TripModal({
  open,
  mode,
  data,
  onChange,
  onClose,
  onSubmit,
  saving,
  error,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div className="overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="trip-modal-title">
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title" id="trip-modal-title">
            {mode === "add" ? "Add trip" : "Edit trip"}
          </h2>
          <button type="button" className="btn--icon" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal__body">
          <TripForm data={data} onChange={onChange} error={error} />
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={onSubmit} disabled={saving}>
            {saving ? "Saving…" : mode === "add" ? "Add trip" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
