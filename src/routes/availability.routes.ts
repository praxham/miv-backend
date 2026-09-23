import express from "express";
import {
  checkSlugAvailability,
  checkUsernameAvailability,
} from "../controllers/availability.controller.ts";

const availabilityRoutes = express.Router();

availabilityRoutes.post("/slug", checkSlugAvailability);
availabilityRoutes.post("/username", checkUsernameAvailability);

export default availabilityRoutes;
