import z from "zod";

export const checkSlugAvailabilitySchema = z.object({
  slug: z.string("slug is required to check the availability"),
});

export const checkUsernameAvailabilitySchema = z.object({
  username: z.string("username is required to check the availability"),
});

export type checkSlugAvailabilityInput = z.infer<
  typeof checkSlugAvailabilitySchema
>;
export type checkUsernameAvailabilityInput = z.infer<
  typeof checkUsernameAvailabilitySchema
>;
