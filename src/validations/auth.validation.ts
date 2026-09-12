import z, { email } from "zod";

export const signInSchema = z.object({
  emailId: z.email("Invalid email address"),
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
