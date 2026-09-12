import { Resend } from "resend";
import type { User } from "../models/schema.types.ts";
import query from "../config/d1.ts";
import type {
  SignInInput,
  VerifyOtpInput,
} from "../validations/auth.validation.ts";
import type { Request, Response } from "express";
import { generateOTP } from "../common/functions.ts";
import bcrypt from "bcryptjs";
import { otpEmailHtml } from "../constants/email.ts";
import jwt from "jsonwebtoken";

const resend = new Resend(process.env.RESEND_API_KEY);

export const findUserByEmailId = async (
  emailId: User["emailId"],
): Promise<User | null> => {
  const rows = await query("SELECT * FROM users WHERE email_id = ? LIMIT 1", [
    emailId,
  ]);

  return rows[0] ?? null;
};

const isOTPExpired = (otp_expires_at: User["otp_expires_at"]): boolean => {
  if (!isOTPExpired) return true;
  return new Date() > otp_expires_at;
};

export const signIn = async (
  req: Request<{}, {}, SignInInput>,
  res: Response,
) => {
  const rawOTP = generateOTP();
  const hashedOTP = await bcrypt.hash(rawOTP, 10);
  const spacedOTP = rawOTP.split("").join(" ");

  const { emailId } = req.body;

  try {
    const existingUser = await findUserByEmailId(emailId);

    if (existingUser) {
      const otp_expires_at = new Date(Date.now() + 2 * 60 * 1000).toISOString();
      await query(
        "UPDATE users SET otp = ?, otp_expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE email_id = ?",
        [hashedOTP, otp_expires_at, emailId],
      );
    } else {
      const id = crypto.randomUUID();
      const otp_expires_at = new Date(Date.now() + 2 * 60 * 1000).toISOString();
      await query(
        "INSERT INTO users (id, email_id, role, otp, otp_expires_at) VALUES (?,?,?,?,?)",
        [id, emailId, "buyer", hashedOTP, otp_expires_at],
      );
    }

    const { data: resendData, error } = await resend.emails.send({
      from: "Made In Vikhroli <noreply@auth.madeinvikhroli.com>",
      to: [emailId],
      subject: `${rawOTP} is your OTP`,
      html: otpEmailHtml.replace("{spacedOTP}", spacedOTP),
    });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your email successfully.",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const verifyOTP = async (
  req: Request<{}, {}, VerifyOtpInput>,
  res: Response,
) => {
  const { emailId, otp } = req.body;
  try {
    const existingUser = await findUserByEmailId(emailId);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const isOTPValid = await bcrypt.compare(otp, existingUser.otp);
    const storedOTPExpiresAt = existingUser.otp_expires_at;

    if (isOTPValid && !isOTPExpired(storedOTPExpiresAt)) {
      const payload = {
        sub: existingUser.id,
        emailId: existingUser.emailId,
      };
      const token = jwt.sign(payload, process.env["JWT_SECRET"] as string, {
        expiresIn: "7d",
      });
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        data: { token },
      });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Invalid or expired OTP" });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};
