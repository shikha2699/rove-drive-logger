import type { Trip, TripFormData, TripsResponse } from "@/types/trip";
import { apiRequest } from "@/utils/api-client";
import { toApiPayload } from "@/utils/form";

export const tripService = {
  async fetchAll(memorableOnly = false): Promise<TripsResponse> {
    const params = memorableOnly ? "?memorable=true" : "";
    return apiRequest<TripsResponse>(`/api/trips${params}`);
  },

  async create(data: TripFormData): Promise<Trip> {
    return apiRequest<Trip>("/api/trips", {
      method: "POST",
      body: JSON.stringify(toApiPayload(data)),
    });
  },

  async update(id: string, data: TripFormData): Promise<Trip> {
    return apiRequest<Trip>(`/api/trips/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toApiPayload(data)),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/trips/${id}`, { method: "DELETE" });
  },

  async toggleMemorable(trip: Trip): Promise<Trip> {
    return apiRequest<Trip>(`/api/trips/${trip.id}`, {
      method: "PATCH",
      body: JSON.stringify({ memorable: !trip.memorable }),
    });
  },
};
