import { prisma } from "../lib/prisma";
import type { TripInput, TripUpdateInput } from "../validators/trip.validator";
import type { SerializedTrip, TripsListResult } from "../types/trip";
import { serializeTrip } from "../utils/trip.utils";

function toCreateData(input: TripInput) {
  return {
    startLocation: input.startLocation,
    endLocation: input.endLocation,
    startTime: new Date(input.startTime),
    endTime: new Date(input.endTime),
    distanceKm: input.distanceKm,
    notes: input.notes ?? null,
    memorable: input.memorable ?? false,
  };
}

function toUpdateData(input: TripUpdateInput) {
  return {
    ...(input.startLocation !== undefined && { startLocation: input.startLocation }),
    ...(input.endLocation !== undefined && { endLocation: input.endLocation }),
    ...(input.startTime !== undefined && { startTime: new Date(input.startTime) }),
    ...(input.endTime !== undefined && { endTime: new Date(input.endTime) }),
    ...(input.distanceKm !== undefined && { distanceKm: input.distanceKm }),
    ...(input.notes !== undefined && { notes: input.notes }),
    ...(input.memorable !== undefined && { memorable: input.memorable }),
  };
}

export const tripService = {
  async list(memorableOnly: boolean): Promise<TripsListResult> {
    const where = memorableOnly ? { memorable: true } : {};

    const [trips, stats, memorableCount] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy: { startTime: "desc" },
      }),
      prisma.trip.aggregate({
        _count: { id: true },
        _sum: { distanceKm: true },
      }),
      prisma.trip.count({ where: { memorable: true } }),
    ]);

    return {
      trips: trips.map(serializeTrip),
      summary: {
        totalTrips: stats._count.id,
        totalDistanceKm: stats._sum.distanceKm ?? 0,
        memorableTrips: memorableCount,
      },
    };
  },

  async getById(id: string): Promise<SerializedTrip | null> {
    const trip = await prisma.trip.findUnique({ where: { id } });
    return trip ? serializeTrip(trip) : null;
  },

  async create(input: TripInput): Promise<SerializedTrip> {
    const trip = await prisma.trip.create({ data: toCreateData(input) });
    return serializeTrip(trip);
  },

  async update(id: string, input: TripUpdateInput): Promise<SerializedTrip | null> {
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) return null;

    const trip = await prisma.trip.update({
      where: { id },
      data: toUpdateData(input),
    });
    return serializeTrip(trip);
  },

  async delete(id: string): Promise<boolean> {
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) return false;

    await prisma.trip.delete({ where: { id } });
    return true;
  },
};
