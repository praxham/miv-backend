import type { NextFunction, Request, Response } from "express";

export const verifyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // If using role-based access:
  // if (req.user.role !== "admin") {

  // If continuing with email-based check:
  if (req.user.emailId !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Route accessible to admin only",
    });
  }

  next();
};
