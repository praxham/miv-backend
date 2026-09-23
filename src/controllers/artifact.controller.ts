import type { Request, Response } from "express";
import type {
  CreateArtifactInput,
  GetArtifactsInput,
  UpdateArtifactInput,
} from "../validations/artifact.validation.ts";
import query from "../config/d1.ts";
import z, { file } from "zod";
import { deleteBuffer, uploadBuffer } from "../r2bucket/r2.service.ts";
import { findUserByEmailId } from "./auth.controller.ts";
import type { Artifact, Order, User } from "../models/schema.types.ts";
import type { MulterFields } from "../types/artifacts.ts";
import AdmZip from "adm-zip";
import path from "path";
import sharp from "sharp";

export const getArtifacts = async (
  req: Request<{}, {}, GetArtifactsInput>,
  res: Response,
) => {
  const { id, slug, byArtist, toShowOn, page, limit } = req.body;

  const fields: string[] = [];
  const values: (string | number | boolean)[] = [];

  fields.push("is_published = ?");
  values.push(true);
  if (id) {
    fields.push("id = ?");
    values.push(id);
  }
  if (slug) {
    fields.push("slug = ?");
    values.push(slug);
  }
  if (byArtist) {
    fields.push("by_artist = ?");
    values.push(byArtist);
  }

  const offset = (page - 1) * limit;
  values.push(fields.length > 0 || toShowOn === "detailed" ? 1 : limit, offset);

  const columns: string[] = [];

  const toShowOnConditionAndFieldsMapping = {
    homepage: "id,slug,json_extract(images, '$[0]') AS image",
    grid_view:
      "id, slug, title, (SELECT json_group_array(value) FROM (SELECT value FROm json_each(images) LIMIT 2)) AS images, amount",
    detailed:
      "id, slug, title, images, category, description, amount, (SELECT json_object('username',username,'email_id',email_id,'upi_id',upi_id) FROM users WHERE users.id = artifacts.by_artist) AS artist",
  };

  toShowOn && columns.push(toShowOnConditionAndFieldsMapping[toShowOn]);

  try {
    console.log(
      `SELECT ${columns} FROM artifacts WHERE ${fields.join(" AND ")} LIMIT ? OFFSET ?`,
      values,
    );

    const result = (await query(
      `SELECT ${columns} FROM artifacts WHERE ${fields.join(" AND ")} LIMIT ? OFFSET ?`,
      values,
    )) as any;
    const arifacts = Array.isArray(result) ? result : (result?.results ?? []);
    if (arifacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No arifacts found matching the given criteria.",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "arifacts fetched succesfully",
      pagination: {
        page,
        limit,
      },
      data: arifacts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const createArtifact = async (
  req: Request<{}, {}, CreateArtifactInput>,
  res: Response,
) => {
  const { title, description, slug, category, amount, isPublished } = req.body;

  const files = req.files as MulterFields | undefined;

  const imageFiles = files?.imageFiles;
  const deliverableFile = files?.deliverableFiles?.[0];

  const artist = req.user;

  try {
    const { username } = (await findUserByEmailId(
      artist?.emailId as string,
    )) as User;

    let imageFileUrls: string[] = [];

    if (imageFiles && imageFiles.length > 0) {
      imageFileUrls = await Promise.all(
        imageFiles.map(async (file, i) => {
          const webpBuffer = await sharp(file.buffer)
            .webp({ quality: 80 })
            .toBuffer();
          const key = `artifacts/${username}/${slug}/${i}-${Date.now()}`;
          return await uploadBuffer(
            key,
            "artifacts",
            webpBuffer,
            file.mimetype,
          );
        }),
      );
    }

    let deliverableFileUrl: string = "";
    let deliverableFileFormats: string[] = [];

    if (deliverableFile) {
      try {
        const zip = new AdmZip(deliverableFile.buffer);
        const zipEntries = zip.getEntries();

        const formatsSet = new Set<string>();

        for (const entry of zipEntries) {
          if (
            entry.isDirectory ||
            entry.entryName.startsWith("__MACOSX/") ||
            path.basename(entry.entryName).startsWith(".")
          ) {
            continue;
          }

          const ext = path.extname(entry.name).replace(/^\./, "").toLowerCase();
          if (ext) {
            formatsSet.add(ext);
          }
        }

        deliverableFileFormats = Array.from(formatsSet);
      } catch (err) {
        console.error("Failed to read zip archive:", err);
        return res.status(400).json({
          success: false,
          message: "Invalid or corrupted zip archive provided for deliverable.",
        });
      }
      const key = `artifact-deliverables/${username}/${slug}-${Date.now()}`;
      const url = await uploadBuffer(
        key,
        "artifact-deliverables",
        deliverableFile.buffer,
        deliverableFile.mimetype,
      );
      deliverableFileUrl = url;
    }

    const id = crypto.randomUUID();

    await query(
      "INSERT INTO artifacts (id, by_artist, slug, images, title, category, description, amount, deliverable_files, deliverable_file_formats, is_published) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [
        id,
        artist?.sub,
        slug,
        JSON.stringify(imageFileUrls),
        title,
        JSON.stringify(category),
        description,
        JSON.stringify(amount),
        deliverableFileUrl,
        JSON.stringify(deliverableFileFormats),
        isPublished,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Artifact created successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const updateArtifact = async (
  req: Request<{}, {}, UpdateArtifactInput>,
  res: Response,
) => {
  const { id, title, description, slug, category, isPublished } = req.body;

  try {
    const order = (await query(
      "SELECT id FROM orders WHERE artifact = ? LIMIT 1",
      [id],
    )) as unknown as Order;

    if (order.id) {
      return res.status(400).json({
        success: false,
        message:
          "Artifact which is purchased by buyers cant be updated anymore.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while checking for artifact in orders table.",
    });
  }

  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (slug !== undefined) {
      fields.push("slug = ?");
      values.push(slug);
    }
    if (title !== undefined) {
      fields.push("title = ?");
      values.push(title);
    }
    if (category !== undefined) {
      fields.push("category = ?");
      values.push(JSON.stringify(category));
    }
    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description);
    }
    if (isPublished !== undefined) {
      fields.push("is_published = ?");
      values.push(isPublished);
    }

    values.push(id);

    await query(
      `UPDATE artifacts SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return res.status(201).json({
      success: true,
      message: "Artifact updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};
