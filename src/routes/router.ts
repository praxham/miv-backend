import express from "express";
import authRoutes from "./auth.routes.ts";
import userRoutes from "./user.routes.ts";
import artistRoutes from "./artist.routes.ts";
import availabilityRoutes from "./availability.routes.ts";
import artifactRoutes from "./artifact.routes.ts";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/artist", artistRoutes);
router.use("/artifact", artifactRoutes);

router.use("/availability", availabilityRoutes);

export default router;
