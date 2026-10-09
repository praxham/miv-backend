import express from "express";
import { authMe, signIn, verifyOTP } from "../controllers/auth.controller.ts";
import {
  signInSchema,
  verifyOtpSchema,
} from "../validations/auth.validation.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";

const authRoutes = express.Router();

authRoutes.get("/me", authenticate, authMe);
authRoutes.post("/sign-in", validate(signInSchema), signIn);
authRoutes.post("/verify-otp", validate(verifyOtpSchema), verifyOTP);

export default authRoutes;
