import type { Trip } from "@prisma/client";
import type { SerializedTrip } from "../types/trip";

export function serializeTrip(trip: Trip): SerializedTrip {
  return {
    id: trip.id,
    startLocation: trip.startLocation,
    endLocation: trip.endLocation,
    startTime: trip.startTime.toISOString(),
    endTime: trip.endTime.toISOString(),
    distanceKm: trip.distanceKm,
    notes: trip.notes,
    memorable: trip.memorable,
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
  };
}
