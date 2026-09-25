import type { Request, Response } from "express";
import type {
  GetUsersInput,
  UpdateUserInput,
} from "../validations/user.validation.ts";
import query from "../config/d1.ts";
import { findUserByEmailId } from "./auth.controller.ts";

export const getUsers = async (
  req: Request<{}, {}, GetUsersInput>,
  res: Response,
) => {
  const { id, emailId, upiId, role } = req.query;

  const conditions: string[] = [];
  const values: any[] = [];
  if (id) {
    conditions.push("id = ?");
    values.push(id);
  }
  if (emailId) {
    conditions.push("email_id = ?");
    values.push(emailId);
  }
  if (upiId) {
    conditions.push("upi_id = ?");
    values.push(upiId);
  }
  if (role) {
    conditions.push("role = ?");
    values.push(role);
  }

  const sql = `SELECT * FROM users WHERE ${conditions.join(" AND ")}`;

  try {
    const result = (await query(sql, values)) as any;
    const users = Array.isArray(result) ? result : (result?.results ?? []);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found matching the given criteria.",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "users fetched succesfully",
      data: users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const updateUser = async (
  req: Request<{}, {}, UpdateUserInput>,
  res: Response,
) => {
  const { upiId } = req.body;

  const id = req.user?.sub;

  try {
    await query("UPDATE users SET upi_id = ? WHERE id = ?", [upiId, id]);

    return res.status(200).json({
      success: true,
      message: "user details updated succesfull",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const emailId = req.user?.emailId;

    const existingUser = await findUserByEmailId(emailId as string);

    const orders = await query(
      "SELECT * FROM orders WHERE bought_by = ? LIMIT 1",
      [existingUser?.id],
    );

    if (existingUser?.role === "buyer" && orders.length !== 0) {
      await query("DELETE FROM users WHERE id = ?", [existingUser.id]);
    } else {
      if (existingUser?.role === "artist")
        return res.status(500).json({
          success: false,
          message:
            "An artist cant delete their account, contact admin for more info",
        });
      if (orders.length > 0)
        return res.status(500).json({
          success: false,
          message:
            "An user with purchased products cant delete their account, contact admin for more info",
        });
    }
    return res.status(200).json({
      success: true,
      message: "Successfully deleted user",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};
