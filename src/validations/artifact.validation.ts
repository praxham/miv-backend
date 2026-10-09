import z from "zod";
import { fileSchema } from "../common/validations.ts";

export const getArtifactsSchema = z
  .object({
    id: z.uuid("Id must be valid uuid").optional(),
    slug: z.string().optional(),
    artist: z
      .string("forArtist must be a valid token")
      .min(1, "Token cannot be empty")
      .optional(),

    toShowOn: z
      .enum([
        "homepage",
        "grid_view",
        "detailed",
        "dashboard_grid_view",
        "dashboard_detailed",
      ])
      .optional(),

    // Pagination
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(12).default(12),
  })
  .transform((data) => {
    if ((data.id || data.slug || data.artist) && !data.toShowOn) {
      data.toShowOn = "detailed";
    }
    return data;
  })
  .refine((data) => data.toShowOn !== undefined, {
    message: "toShowOn is required when no id, slug, or byArtist is provided",
  });

export const createArtifactSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  imageFiles: z
    .array(fileSchema())
    .min(2, "At least 2 image files are required")
    .max(4, "Maximum of 4 image files are allowed"),
  category: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [val];
      }
    }
    return val;
  }, z.array(z.string())),
  description: z.string().trim().max(1000),
  amount: z.coerce.number().positive(),
  isPublished: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return Boolean(val);
  }, z.boolean()),
  deliverableFiles: fileSchema({
    allowedTypes: ["application/zip", "application/x-zip-compressed"],
  }),
});

export const updateArtifactSchema = z
  .object({
    id: z.uuid("artifact Id is required to update artifact"),
    description: z.string().trim().max(1000).optional(),
    isPublished: z
      .preprocess((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return Boolean(val);
      }, z.boolean())
      .optional(),
  })
  .partial()
  .refine((data) => {
    const { id, ...rest } = data;
    return Object.values(rest).some((val) => val !== undefined);
  });

export const deleteArtifactSchema = z.object({
  id: z.uuid("artifact Id is required to delete artifact"),
});

export type GetArtifactsInput = z.infer<typeof getArtifactsSchema>;
export type CreateArtifactInput = z.infer<typeof createArtifactSchema>;
export type UpdateArtifactInput = z.infer<typeof updateArtifactSchema>;
export type DeleteArtifactInput = z.infer<typeof deleteArtifactSchema>;
