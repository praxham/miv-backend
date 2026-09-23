import type { Request, Response } from "express";
import type {
  checkSlugAvailabilityInput,
  checkUsernameAvailabilityInput,
} from "../validations/availability.validation.ts";
import query from "../config/d1.ts";
import type { AvailabilityField } from "../types/common.ts";

const commonCheckAvailability = async (
  field: AvailabilityField,
  res: Response,
) => {
  const isSlug = "slug" in field;
  const currentFiled = isSlug ? "slug" : "username";
  const value = isSlug ? field.slug : field.username;
  const table = isSlug ? "artifacts" : "users";
  try {
    const result = await query(
      `SELECT * FROM ${table} WHERE ${currentFiled} = ?`,
      [value],
    );

    if (Array.isArray(result) && result.length === 0) {
      return res.status(200).json({
        success: true,
        message: `${currentFiled} is available`,
      });
    } else {
      return res.status(409).json({
        success: false,
        message: `${currentFiled} is not available`,
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const checkSlugAvailability = async (
  req: Request<{}, {}, checkSlugAvailabilityInput>,
  res: Response,
) => {
  const { slug } = req.body;
  await commonCheckAvailability({ slug }, res);
};

export const checkUsernameAvailability = async (
  req: Request<{}, {}, checkUsernameAvailabilityInput>,
  res: Response,
) => {
  const { username } = req.body;
  await commonCheckAvailability({ username }, res);
};
