export interface SerializedTrip {
  id: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  distanceKm: number;
  notes: string | null;
  memorable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripSummary {
  totalTrips: number;
  totalDistanceKm: number;
  memorableTrips: number;
}

export interface TripsListResult {
  trips: SerializedTrip[];
  summary: TripSummary;
}
