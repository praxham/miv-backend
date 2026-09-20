import express from "express";
import { validate } from "../middlewares/validate.middleware.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import {
  admitArtist,
  getArtists,
  updateArtist,
} from "../controllers/artist.controller.ts";
import {
  admitArtistSchema,
  getArtistsSchema,
  updateArtistSchema,
} from "../validations/artist.validation.ts";
import { verifyAdmin } from "../middlewares/verifyAdmin.middleware.ts";
import multer from "multer";

const artistRoutes = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

artistRoutes.get("/", validate(getArtistsSchema), getArtists);
artistRoutes.post(
  "/admit",
  authenticate,
  validate(admitArtistSchema),
  verifyAdmin,
  admitArtist,
);
artistRoutes.patch(
  "/",
  authenticate,
  upload.single("profilePhotoFile"),
  validate(updateArtistSchema, { includeFiles: true }),
  updateArtist,
);

export default artistRoutes;
