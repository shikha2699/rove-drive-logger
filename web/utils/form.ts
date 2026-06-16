import type { TripFormData } from "@/types/trip";

export function toApiPayload(data: TripFormData) {
  return {
    startLocation: data.startLocation.trim(),
    endLocation: data.endLocation.trim(),
    startTime: new Date(data.startTime).toISOString(),
    endTime: new Date(data.endTime).toISOString(),
    distanceKm: parseFloat(data.distanceKm),
    notes: data.notes.trim() || null,
    memorable: data.memorable,
  };
}

export function validateTripForm(data: TripFormData): string | null {
  if (!data.startLocation.trim() || !data.endLocation.trim()) {
    return "Start and end locations are required.";
  }
  if (!data.startTime || !data.endTime) {
    return "Start and end times are required.";
  }
  if (new Date(data.endTime) < new Date(data.startTime)) {
    return "End time must be after start time.";
  }
  const distance = parseFloat(data.distanceKm);
  if (!distance || distance <= 0) {
    return "Distance must be a positive number.";
  }
  return null;
}
