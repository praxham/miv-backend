import express from "express";
import authRoutes from "./auth.routes.ts";
import userRoutes from "./user.routes.ts";
import artistRoutes from "./artist.routes.ts";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/artist", artistRoutes);

export default router;
