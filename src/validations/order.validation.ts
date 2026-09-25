import z from "zod";

export const getOrdersSchema = z.object({
  artist: z.uuid("artifact must be valid uuid").optional(),
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(12).default(12),
});

export const createOrderSchema = z.object({
  artifact: z.uuid("artifact must be valid uuid"),
  amount: z.coerce.number().int().positive(),
  utr_number: z.string("utr must be provided"),
});

export const updateOrderSchema = z.object({
  id: z.uuid("Id must be valid uuid"),
  payment_status: z.enum(["confirmed", "disputed", "rejected", "resolved"]),
});

export type GetOrdersInput = z.infer<typeof getOrdersSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
