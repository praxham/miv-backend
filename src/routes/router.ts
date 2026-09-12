import express from "express";
import authRoutes from "./auth.routes.ts";

const router = express.Router();

router.use("/auth", authRoutes);

export default router;
