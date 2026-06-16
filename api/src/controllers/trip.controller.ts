import { Request, Response } from "express";
import { tripService } from "../services/trip.service";
import { tripInputSchema, tripUpdateSchema } from "../validators/trip.validator";

function parseId(req: Request, res: Response): string | null {
  const id = req.params.id;
  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid trip id" });
    return null;
  }
  return id;
}

export const tripController = {
  async list(req: Request, res: Response) {
    try {
      const memorableOnly = req.query.memorable === "true";
      const result = await tripService.list(memorableOnly);
      res.json(result);
    } catch (error) {
      console.error("GET /trips error:", error);
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = parseId(req, res);
      if (!id) return;

      const trip = await tripService.getById(id);
      if (!trip) {
        res.status(404).json({ error: "Trip not found" });
        return;
      }
      res.json(trip);
    } catch (error) {
      console.error("GET /trips/:id error:", error);
      res.status(500).json({ error: "Failed to fetch trip" });
    }
  },

  async create(req: Request, res: Response) {
    const parsed = tripInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }

    try {
      const trip = await tripService.create(parsed.data);
      res.status(201).json(trip);
    } catch (error) {
      console.error("POST /trips error:", error);
      res.status(500).json({ error: "Failed to create trip" });
    }
  },

  async update(req: Request, res: Response) {
    const parsed = tripUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }

    try {
      const id = parseId(req, res);
      if (!id) return;

      const trip = await tripService.update(id, parsed.data);
      if (!trip) {
        res.status(404).json({ error: "Trip not found" });
        return;
      }
      res.json(trip);
    } catch (error) {
      console.error("PATCH /trips/:id error:", error);
      res.status(500).json({ error: "Failed to update trip" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = parseId(req, res);
      if (!id) return;

      const deleted = await tripService.delete(id);
      if (!deleted) {
        res.status(404).json({ error: "Trip not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("DELETE /trips/:id error:", error);
      res.status(500).json({ error: "Failed to delete trip" });
    }
  },
};
