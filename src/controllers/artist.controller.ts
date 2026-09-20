import type { Request, Response } from "express";
import type {
  AdmitArtistsInput,
  GetArtistsInput,
  UpdateArtistsInput,
} from "../validations/artist.validation.ts";
import query from "../config/d1.ts";
import { deleteBuffer, uploadBuffer } from "../r2bucket/r2.service.ts";
import { findUserByEmailId } from "./auth.controller.ts";

export const admitArtist = async (
  req: Request<{}, {}, AdmitArtistsInput>,
  res: Response,
) => {
  const { id } = req.body;

  try {
    await query("UPDATE users SET role = 'seller' where id = ?", [id]);
    return res.status(200).json({
      success: true,
      message: "user successfully admitted as artist",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const getArtists = async (
  req: Request<{}, {}, GetArtistsInput>,
  res: Response,
) => {
  const { id, emailId, username, page, limit } = req.body;
  const conditions: string[] = ["role = 'seller'"];
  const values: any[] = [];
  if (id) {
    conditions.push("id = ?");
    values.push(id);
  }
  if (emailId) {
    conditions.push("email_id = ?");
    values.push(emailId);
  }
  if (username) {
    const sanitizedUsername = username.replace(/[%_\\]/g, "\\$&");
    conditions.push("username LIKE ?");
    values.push(`%${sanitizedUsername}%`);
  }

  const offset = (page - 1) * limit;

  const sql = `SELECT * FROM users WHERE ${conditions.join(" AND ")} LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  try {
    const result = (await query(sql, values)) as any;
    const artists = Array.isArray(result) ? result : (result?.results ?? []);

    if (artists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No artists found matching the given criteria.",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "artists fetched succesfully",
      pagination: {
        page,
        limit,
      },
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const updateArtist = async (
  req: Request<{}, {}, UpdateArtistsInput>,
  res: Response,
) => {
  const { username, description, waNumber, socials, upiId } = req.body;

  const profilePhotoFile = req.file;

  const user = req.user;

  let profilePhotoUrl: string | undefined;

  let existingProfilePhotoURL;

  try {
    const result = await findUserByEmailId(user?.emailId as string);
    existingProfilePhotoURL = result?.profile_photo;
  } catch (error) {
    console.error(error);
  }

  if (profilePhotoFile) {
    const key = `profile-photos/${user?.emailId.split("@")[0]}-${Date.now()}`;

    if (existingProfilePhotoURL) {
      const key = new URL(existingProfilePhotoURL).pathname.slice(1);
      await deleteBuffer(key);
    }

    profilePhotoUrl = await uploadBuffer(
      key,
      "profile-photos",
      profilePhotoFile.buffer,
      profilePhotoFile.mimetype,
    );
  }

  const setClauses: string[] = [];
  const values: (string | number | null)[] = [];

  const addField = (column: string, val: any) => {
    if (val !== undefined && val !== null) {
      setClauses.push(`${column} = ?`);
      values.push(
        typeof val === "object"
          ? JSON.stringify(val)
          : (val as string | number),
      );
    }
  };

  addField("username", username);
  addField("description", description);
  addField("wa_number", waNumber);
  addField("socials", JSON.stringify(socials));
  addField("upi_id", upiId);
  addField("profile_photo", profilePhotoUrl);

  values.push(user?.sub as string);

  const sql = `UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`;

  try {
    await query(sql, values);
    return res.status(200).json({
      success: true,
      message: "Artist details updated succesfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};
