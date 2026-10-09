import z, { email } from "zod";
import { upiId } from "./user.validation.ts";

export const signInSchema = z.object({
  emailId: z.email("Invalid email address"),
  upiId: upiId().optional(),
  wantToBecomeSeller: z
    .boolean("wantToBecomeSeller must be boolean")
    .optional(),
});

export const verifyOtpSchema = z.object({
  emailId: z.email("Invalid email address"),
  otp: z
    .string("Otp is required")
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
