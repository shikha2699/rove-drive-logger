"use client";

import { useEffect, useRef } from "react";
import type { TripFormData } from "@/types/trip";
import { NOTES_MAX_LENGTH } from "@/constants/trip";

interface Props {
  data: TripFormData;
  onChange: (data: TripFormData) => void;
  error: string | null;
}

export function TripForm({ data, onChange, error }: Props) {
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (error && notesRef.current) {
      notesRef.current.focus();
    }
  }, [error]);

  function update(field: keyof TripFormData, value: string | boolean) {
    onChange({ ...data, [field]: value });
  }

  return (
    <form className="form" onSubmit={(e) => e.preventDefault()}>
      {error && <div className="form__error" role="alert">{error}</div>}

      <div className="form__row form__row--2">
        <div className="form__group">
          <label className="form__label" htmlFor="startLocation">Start location</label>
          <input
            id="startLocation"
            className="form__input"
            type="text"
            value={data.startLocation}
            onChange={(e) => update("startLocation", e.target.value)}
            placeholder="e.g. San Francisco, CA"
            required
            autoFocus
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="endLocation">End location</label>
          <input
            id="endLocation"
            className="form__input"
            type="text"
            value={data.endLocation}
            onChange={(e) => update("endLocation", e.target.value)}
            placeholder="e.g. Los Angeles, CA"
            required
          />
        </div>
      </div>

      <div className="form__row form__row--2">
        <div className="form__group">
          <label className="form__label" htmlFor="startTime">Start time</label>
          <input
            id="startTime"
            className="form__input"
            type="datetime-local"
            value={data.startTime}
            onChange={(e) => update("startTime", e.target.value)}
            required
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="endTime">End time</label>
          <input
            id="endTime"
            className="form__input"
            type="datetime-local"
            value={data.endTime}
            onChange={(e) => update("endTime", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="distanceKm">Distance (km)</label>
        <input
          id="distanceKm"
          className="form__input"
          type="number"
          min="0.1"
          step="0.1"
          value={data.distanceKm}
          onChange={(e) => update("distanceKm", e.target.value)}
          placeholder="e.g. 615"
          required
        />
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          ref={notesRef}
          className="form__textarea"
          value={data.notes}
          onChange={(e) => update("notes", e.target.value.slice(0, NOTES_MAX_LENGTH))}
          placeholder="What made this drive memorable?"
          maxLength={NOTES_MAX_LENGTH}
          rows={3}
        />
        <div className="form__hint">{data.notes.length}/{NOTES_MAX_LENGTH}</div>
      </div>

      <label className="form__checkbox">
        <input
          type="checkbox"
          checked={data.memorable}
          onChange={(e) => update("memorable", e.target.checked)}
        />
        <span className="form__checkbox-label">Mark as memorable</span>
      </label>
    </form>
  );
}
