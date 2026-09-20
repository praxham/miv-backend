import z from "zod";
import { upiId } from "./user.validation.ts";
import { fileSchema } from "../common/validations.ts";

export const admitArtistSchema = z.object({
  id: z.uuid("Id must be valid uuid"),
});

export const getArtistsSchema = z.object({
  id: z.uuid("Id must be valid uuid").optional(),
  emailId: z.email("Invalid email address").optional(),
  username: z.string().trim().min(1).optional(),

  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(12).default(12),
});

export const updateArtistSchema = z
  .object({
    username: z.string().trim().min(1).optional(),
    profilePhotoFile: fileSchema().optional(),
    description: z.string().trim().max(1000).optional(),
    waNumber: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "WhatsApp number must be exactly 10 digits")
      .optional(),
    upiId: upiId().optional(),
    socials: z
      .preprocess(
        (val) => {
          if (typeof val === "string") {
            try {
              return JSON.parse(val);
            } catch {
              return val;
            }
          }
          return val;
        },
        z.array(z.record(z.string(), z.string())).min(1),
      )
      .optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: "At least one field must be provided for update",
  });

export type GetArtistsInput = z.infer<typeof getArtistsSchema>;
export type AdmitArtistsInput = z.infer<typeof admitArtistSchema>;
export type UpdateArtistsInput = z.infer<typeof updateArtistSchema>;
