import type { Request, Response } from "express";
import type {
  CreateOrderInput,
  GetOrdersInput,
  UpdateOrderInput,
} from "../validations/order.validation.ts";
import query from "../config/d1.ts";
import { statusRank } from "../common/constatns.ts";
import { Resend } from "resend";
import { deliverableEmailHtml } from "../constants/deliverable.ts";

const resend = new Resend(process.env.RESEND_API_KEY);

export const getOrders = async (
  req: Request<{}, {}, GetOrdersInput>,
  res: Response,
) => {
  const { get_artist_orders, order_id, page, limit } =
    req.validatedQuery as unknown as GetOrdersInput;
  const id = req.user?.sub;
  const offset = (page - 1) * limit;

  try {
    let whereClause = "";
    const queryParams: any[] = [];

    if (get_artist_orders) {
      if (order_id) {
        whereClause = "a.by_artist = ? AND o.id = ?";
        queryParams.push(id, order_id);
      } else {
        whereClause = "a.by_artist = ?";
        queryParams.push(id);
      }
    } else {
      whereClause = "o.bought_by = ?";
      queryParams.push(id);
    }

    queryParams.push(limit, offset);

    const result = (await query(
      `SELECT 
      o.id, 
      o.artifact, 
      o.amount, 
      o.utr,
      o.payment_status, 
      o.created_at, 
      o.updated_at, 
      ${
        get_artist_orders
          ? `u_buyer.upi_id AS buyer_upi_id,`
          : `u_artist.username AS artist_username, 
      u_artist.upi_id AS artist_upi_id,`
      }
      a.slug as artifact_slug,
      json_extract(a.images,'$[0]') as artifact_image
      FROM orders o 
      JOIN artifacts a ON o.artifact = a.id 
      JOIN users u_buyer ON o.bought_by = u_buyer.id
      JOIN users u_artist ON a.by_artist = u_artist.id 
      WHERE ${whereClause} 
      LIMIT ? OFFSET ?`,
      queryParams,
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
  const { artifact, amount, utr } = req.body;
  const bought_by = req.user?.sub;

  try {
    const id = crypto.randomUUID();
    await query(
      "INSERT INTO orders (id, artifact, bought_by, amount, utr) VALUES (?,?,?,?,?)",
      [id, artifact, bought_by, amount, utr],
    );
    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
      data: {
        id,
      },
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
    if (payment_status === "confirmed" || payment_status === "resolved") {
      const order_response = (await query(
        `SELECT 
      o.id, 
      o.artifact,
      o.amount,
      o.utr,
      u_buyer.email_id AS buyer_email_id,
      u_artist.email_id AS artist_email_id,
      u_artist.username AS artist_username,
      a.title as artifact_title,
      a.deliverable_files as artifact_deliverable_files
      FROM orders o 
      JOIN artifacts a ON o.artifact = a.id 
      JOIN users u_buyer ON o.bought_by = u_buyer.id
      JOIN users u_artist ON a.by_artist = u_artist.id 
      WHERE o.id = ?
      LIMIT 1`,
        [id],
      )) as any;

      const orders = Array.isArray(order_response)
        ? order_response
        : (order_response?.results ?? []);

      const order = orders[0];

      const finalEmailHtml = deliverableEmailHtml
        .replace("{artist_username}", order.artist_username)
        .replace("{amount}", order.amount)
        .replace("{utr}", order.utr)
        .replace("{artifact_title}", order.artifact_title)
        .replace(
          "{artifact_deliverable_url}",
          order.artifact_deliverable_files,
        );

      const { data: resendData, error } = await resend.emails.send({
        from: "Made In Vikhroli <noreply@digital-delivery.madeinvikhroli.com>",
        to: [order.buyer_email_id],
        cc: [order.artist_email_id],
        subject: `Payment Confirmed: "${order.artifact_title}"`,
        html: finalEmailHtml,
      });

      if (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to send confirmation email.",
        });
      }
    }
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
