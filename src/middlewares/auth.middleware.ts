import type { NextFunction, Request, Response } from "express";
import type { UserTokenPayload } from "../types/users.ts";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing or malformed",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as UserTokenPayload;
    if (!decoded?.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }
    req.user = decoded;
    console.log({ decoded });

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
