import type { Request, Response } from "express";
import type {
  CreateOrderInput,
  GetOrdersInput,
  UpdateOrderInput,
} from "../validations/order.validation.ts";
import query from "../config/d1.ts";
import { statusRank } from "../common/constatns.ts";

export const getOrders = async (
  req: Request<{}, {}, GetOrdersInput>,
  res: Response,
) => {
  const { artist, page, limit } = req.body;
  const id = req.user?.sub;
  const offset = (page - 1) * limit;

  try {
    const result = (await query(
      `SELECT 
      o.id, 
      o.artifact, 
      o.amount, 
      o.utr_number, 
      o.payment_status, 
      o.created_at, 
      o.updated_at, 
      u_artist.username AS artist_username, 
      u_artist.upi_id AS artist_upi_id 
      FROM orders o 
      JOIN artifacts a ON o.artifact = a.id 
      JOIN users u_artist ON a.by_artist = u_artist.id 
      WHERE ${artist ? "a.by_artist = ?" : "o.bought_by = ?"} 
      LIMIT ? OFFSET ?`,
      [artist ? artist : id, limit, offset],
    )) as any;

    const orders = Array.isArray(result) ? result : (result?.results ?? []);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for current user.",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "orders fetched succesfully",
      pagination: {
        page,
        limit,
      },
      data: orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const createOrder = async (
  req: Request<{}, {}, CreateOrderInput>,
  res: Response,
) => {
  const { artifact, amount, utr_number } = req.body;
  const bought_by = req.user?.sub;

  try {
    const id = crypto.randomUUID();
    await query(
      "INSERT INTO orders (id, artifact, bought_by, amount, utr_number) VALUES (?,?,?,?,?)",
      [id, artifact, bought_by, amount, utr_number],
    );
    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const updateOrder = async (
  req: Request<{}, {}, UpdateOrderInput>,
  res: Response,
) => {
  const { id, payment_status } = req.body;
  const user = req.user;

  try {
    const result = (await query(
      "SELECT payment_status FROM orders WHERE id = ? LIMIT 1",
      [id],
    )) as any;
    const orders = Array.isArray(result) ? result : (result?.results ?? []);

    const currentStatus = orders[0].payment_status;
    const curentRank = statusRank[currentStatus];
    const targetRank = statusRank[payment_status];

    const isNextSequentialStep = targetRank === curentRank + 1;
    if (!isNextSequentialStep) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status transition. Status must move sequentially by 1 step.",
      });
    }
    await query("UPDATE orders SET payment_status = ? WHERE id = ?", [
      payment_status,
      id,
    ]);
    return res.status(201).json({
      success: true,
      message: `Order's payment_status updated successfully by ${user?.emailId}.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};
