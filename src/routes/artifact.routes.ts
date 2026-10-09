import express from "express";
import multer from "multer";
import {
  createArtifact,
  deleteArtifact,
  getArtifacts,
  updateArtifact,
} from "../controllers/artifact.controller.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import {
  createArtifactSchema,
  deleteArtifactSchema,
  getArtifactsSchema,
  updateArtifactSchema,
} from "../validations/artifact.validation.ts";

const artifactRoutes = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

artifactRoutes.get(
  "/",
  validate(getArtifactsSchema, { mode: "query" }),
  getArtifacts,
);
artifactRoutes.post(
  "/",
  authenticate,
  upload.fields([
    { name: "imageFiles", maxCount: 4 },
    { name: "deliverableFiles", maxCount: 1 },
  ]),
  validate(createArtifactSchema, { includeFiles: true }),
  createArtifact,
);
artifactRoutes.patch(
  "/",
  authenticate,
  upload.fields([
    { name: "imageFiles", maxCount: 4 },
    { name: "deliverableFiles", maxCount: 1 },
  ]),
  validate(updateArtifactSchema, { includeFiles: true }),
  updateArtifact,
);
artifactRoutes.delete(
  "/",
  authenticate,
  validate(deleteArtifactSchema),
  deleteArtifact,
);

export default artifactRoutes;
