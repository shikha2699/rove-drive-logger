import { Router } from "express";
import { tripController } from "../controllers/trip.controller";

export const tripRoutes = Router();

tripRoutes.get("/", tripController.list);
tripRoutes.get("/:id", tripController.getById);
tripRoutes.post("/", tripController.create);
tripRoutes.patch("/:id", tripController.update);
tripRoutes.delete("/:id", tripController.delete);
