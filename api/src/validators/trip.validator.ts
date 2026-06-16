import { z } from "zod";

export const tripInputSchema = z
  .object({
    startLocation: z.string().min(1, "Start location is required").max(200),
    endLocation: z.string().min(1, "End location is required").max(200),
    startTime: z.string().datetime({ message: "Invalid start time" }),
    endTime: z.string().datetime({ message: "Invalid end time" }),
    distanceKm: z.number().positive("Distance must be greater than 0"),
    notes: z.string().max(500).optional().nullable(),
    memorable: z.boolean().optional(),
  })
  .refine((data) => new Date(data.endTime) >= new Date(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const tripUpdateSchema = z
  .object({
    startLocation: z.string().min(1, "Start location is required").max(200).optional(),
    endLocation: z.string().min(1, "End location is required").max(200).optional(),
    startTime: z.string().datetime({ message: "Invalid start time" }).optional(),
    endTime: z.string().datetime({ message: "Invalid end time" }).optional(),
    distanceKm: z.number().positive("Distance must be greater than 0").optional(),
    notes: z.string().max(500).optional().nullable(),
    memorable: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) >= new Date(data.startTime);
      }
      return true;
    },
    { message: "End time must be after start time", path: ["endTime"] }
  );

export type TripInput = z.infer<typeof tripInputSchema>;
export type TripUpdateInput = z.infer<typeof tripUpdateSchema>;
