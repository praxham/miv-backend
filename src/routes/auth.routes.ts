import express from "express";
import { signIn, verifyOTP } from "../controllers/auth.controller.ts";
import {
  signInSchema,
  verifyOtpSchema,
} from "../validations/auth.validation.ts";
import { validate } from "../middlewares/validate.middleware.ts";

const authRoutes = express.Router();

authRoutes.post("/sign-in", validate(signInSchema), signIn);
authRoutes.post("/verify-otp", validate(verifyOtpSchema), verifyOTP);

export default authRoutes;
