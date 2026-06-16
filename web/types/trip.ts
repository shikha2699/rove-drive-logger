export interface Trip {
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

export interface TripsResponse {
  trips: Trip[];
  summary: TripSummary;
}

export interface TripFormData {
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  distanceKm: string;
  notes: string;
  memorable: boolean;
}

export type TripFilter = "all" | "memorable";
export type TripModalMode = "add" | "edit";
