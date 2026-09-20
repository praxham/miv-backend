import z from "zod";

const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,50}@[a-zA-Z]{2,}$/;

export const upiId = (message = "Invalid UPI ID") =>
  z.string().trim().regex(UPI_REGEX, { message });

export const getUsersSchema = z
  .object({
    id: z.uuid("Id must be valid uuid"),
    emailId: z.email("Invalid email address"),
    upiId: upiId(),
    role: z.enum(["buyer", "artist", "admin"]),
  })
  .partial()
  .refine(
    (data) =>
      Object.values(data).some((val) => val !== undefined && val !== ""),
    {
      message:
        "At least one field (id, emailId, upiId, role) must be provided for filters to work",
    },
  );

export const updateUserSchema = z.object({
  upiId: upiId(),
});

export type GetUsersInput = z.infer<typeof getUsersSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
