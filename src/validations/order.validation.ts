import z from "zod";

export const getOrdersSchema = z.object({
  get_artist_orders: z
    .preprocess(
      (val) => (val === "true" ? true : val === "false" ? false : val),
      z.boolean({ error: "get_artist_orders must be boolean" }),
    )
    .optional(),
  order_id: z.uuid("order_id must be valid uuid").optional(),
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(12).default(12),
});

export const createOrderSchema = z.object({
  artifact: z.uuid("artifact must be valid uuid"),
  amount: z.coerce.number().int().positive(),
  utr: z
    .string("utr must be provided")
    .trim()
    .length(12, "UTR must be exactly 12 digits")
    .regex(/^[0-9]{12}$/, {
      message: "Invalid UTR number. Must contain exactly 12 numeric digits.",
    }),
});

export const updateOrderSchema = z.object({
  id: z.uuid("Id must be valid uuid"),
  payment_status: z.enum(["confirmed", "disputed", "rejected", "resolved"]),
});

export type GetOrdersInput = z.infer<typeof getOrdersSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
