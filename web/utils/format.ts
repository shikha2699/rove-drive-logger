import type { Trip } from "@/types/trip";

export function formatDistance(km: number): string {
  return `${km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    return `${startDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} · ${startDate.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })} – ${endDate.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  return `${formatDateTime(start)} → ${formatDateTime(end)}`;
}

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function tripToFormData(trip: Trip) {
  return {
    startLocation: trip.startLocation,
    endLocation: trip.endLocation,
    startTime: toDatetimeLocalValue(trip.startTime),
    endTime: toDatetimeLocalValue(trip.endTime),
    distanceKm: String(trip.distanceKm),
    notes: trip.notes ?? "",
    memorable: trip.memorable,
  };
}

export function emptyFormData() {
  return {
    startLocation: "",
    endLocation: "",
    startTime: "",
    endTime: "",
    distanceKm: "",
    notes: "",
    memorable: false,
  };
}
