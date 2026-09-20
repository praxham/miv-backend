import z from "zod";
import type { FileValidationOptions, MulterFile } from "../types/common.ts";

export const fileSchema = ({
  maxSizeInMb = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  message = "Must be a valid file",
}: FileValidationOptions = {}) =>
  z
    .custom<MulterFile>(
      (val) => typeof val === "object" && val !== null && "size" in val,
      { message },
    )
    .refine((file) => file.size > 0, "File cannot be empty")
    .refine(
      (file) => file.size <= maxSizeInMb * 1024 * 1024,
      `File size must be under ${maxSizeInMb}MB`,
    )
    .refine(
      (file) => allowedTypes.includes(file.mimetype),
      `Only ${allowedTypes.map((t) => t.split("/")[1]?.toUpperCase() ?? t).join(", ")} formats are supported`,
    );
