import express from "express";
import { authenticate } from "../middlewares/auth.middleware.ts";
import {
  createOrderSchema,
  getOrdersSchema,
  updateOrderSchema,
} from "../validations/order.validation.ts";
import {
  createOrder,
  getOrders,
  updateOrder,
} from "../controllers/order.controller.ts";
import { validate } from "../middlewares/validate.middleware.ts";

const orderRoutes = express.Router();

orderRoutes.get(
  "",
  authenticate,
  validate(getOrdersSchema, { mode: "query" }),
  getOrders,
);
orderRoutes.post("", authenticate, validate(createOrderSchema), createOrder);
orderRoutes.patch("", authenticate, validate(updateOrderSchema), updateOrder);

export default orderRoutes;
