import type { Request, Response } from "express";
import type {
  CreateArtifactInput,
  GetArtifactsInput,
  UpdateArtifactInput,
} from "../validations/artifact.validation.ts";
import query from "../config/d1.ts";
import {
  deleteBuffer,
  extractKeyFromUrl,
  uploadBuffer,
} from "../r2bucket/r2.service.ts";
import { findUserByEmailId } from "./auth.controller.ts";
import type { User } from "../models/schema.types.ts";
import type { MulterFields } from "../types/artifacts.ts";
import AdmZip from "adm-zip";
import path from "path";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import type { UserTokenPayload } from "../types/users.ts";

export const getArtifacts = async (
  req: Request<{}, {}, GetArtifactsInput>,
  res: Response,
) => {
  const { id, slug, artist, toShowOn, page, limit } =
    req.validatedQuery as unknown as GetArtifactsInput;

  const fields: string[] = [];
  const values: (string | number | boolean)[] = [];

  if (!toShowOn?.includes("dashboard")) {
    fields.push("is_published = ?");
    values.push("true");
  }
  if (id) {
    fields.push("id = ?");
    values.push(id);
  }
  if (slug) {
    fields.push("slug = ?");
    values.push(slug);
  }

  if (artist) {
    fields.push("by_artist = ?");
    if (
      toShowOn === "dashboard_grid_view" ||
      toShowOn === "dashboard_detailed"
    ) {
      // can only send token since this is public method and cant add authentication
      const decodedUser = jwt.verify(
        artist,
        process.env.JWT_SECRET!,
      ) as UserTokenPayload;
      values.push(decodedUser.sub);
    } else {
      values.push(artist);
    }
  }

  const offset = (page - 1) * limit;
  const fetchLimit = limit + 1;
  const isSingleItemQuery = Boolean(id || slug) || toShowOn === "detailed";
  values.push(isSingleItemQuery ? limit : fetchLimit, offset);

  const columns: string[] = [];

  const gridViewFields =
    "id, slug, title, (SELECT json_group_array(value) FROM (SELECT value FROM json_each(images) LIMIT 2)) AS images, amount,(SELECT username FROM users WHERE users.id = artifacts.by_artist) AS by_artist";

  const detailedViewFields =
    "id, slug, title, images, deliverable_file_formats, category, description, amount, (SELECT json_object('id',id,'username',username,'email_id',email_id,'upi_id',upi_id,'whatsapp_number',wa_number) FROM users WHERE users.id = artifacts.by_artist) AS artist";

  const toShowOnConditionAndFieldsMapping = {
    homepage: "id,slug,json_extract(images, '$[0]') AS image",
    grid_view: gridViewFields,
    detailed: detailedViewFields,
    dashboard_grid_view: gridViewFields,
    dashboard_detailed: detailedViewFields.replace(
      "deliverable_file_formats",
      "deliverable_files, deliverable_file_formats",
    ),
  };

  toShowOn && columns.push(toShowOnConditionAndFieldsMapping[toShowOn]);

  try {
    const result = (await query(
      `SELECT ${columns} FROM artifacts WHERE ${fields.join(" AND ")} LIMIT ? OFFSET ?`,
      values,
    )) as any;

    const artifacts = Array.isArray(result) ? result : (result?.results ?? []);

    return res.status(200).json({
      success: true,
      message: "arifacts fetched succesfully",
      pagination: {
        page,
        limit,
      },
      data: artifacts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const getFreeArtifactContent = async (
  req: Request<{}, {}, CreateArtifactInput>,
  res: Response,
) => {
  const { id } = req.validatedQuery;
  try {
    const result = (await query(
      "SELECT amount, deliverable_files, category FROM artifacts WHERE id = ?",
      [id],
    )) as any;

    const artifacts = Array.isArray(result) ? result : (result?.results ?? []);

    const artifact = artifacts?.[0];

    if (
      artifact.deliverable_files &&
      artifact.amount === 0 &&
      artifact.category?.includes("free")
    ) {
      return res.status(200).json({
        success: true,
        message: "Artifact deliverable_files link fetched successfully",
        data: {
          url: artifact.deliverable_files,
        },
      });
    } else {
      return res.status(400).json({
        success: true,
        message:
          "Requested artifact is not free or does not have any deliverable_files",
      });
    }
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
  const { id, description, isPublished } = req.body;

  try {
    const ordersResponse = (await query(
      "SELECT id FROM orders WHERE id = ? LIMIT 1",
      [id],
    )) as any;

    const orders = Array.isArray(ordersResponse)
      ? ordersResponse
      : (ordersResponse?.results ?? []);

    if (Array.isArray(orders) && orders?.[0]?.id) {
      return res.status(400).json({
        success: false,
        message:
          "Artifact which is purchased by buyers cant be updated anymore.",
      });
    }

    const artifactResponse = (await query(
      "SELECT description FROM artifacts WHERE id = ?",
      [id],
    )) as any;

    const arifacts = Array.isArray(artifactResponse)
      ? artifactResponse
      : (artifactResponse?.results ?? []);

    if (
      Array.isArray(orders) &&
      description !== undefined &&
      !description?.includes(arifacts?.[0]?.description)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The updated description must contain the original description.",
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

    return res.status(200).json({
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

export const deleteArtifact = async (
  req: Request<{}, {}, UpdateArtifactInput>,
  res: Response,
) => {
  const { id } = req.body;
  const artist = req.user?.sub;
  try {
    const ordersResponse = (await query(
      "SELECT * FROM orders WHERE artifact = ? LIMIT 1",
      [id],
    )) as any;

    const orders = Array.isArray(ordersResponse)
      ? ordersResponse
      : (ordersResponse?.results ?? []);

    if (orders && orders.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Artifact which has Orders associated with it cannot be deleted",
      });
    }

    const artifactResult = (await query(
      "SELECT * FROM artifacts WHERE id = ? AND by_artist = ?",
      [id, artist],
    )) as any;
    const artifacts = Array.isArray(artifactResult)
      ? artifactResult
      : (artifactResult?.results ?? []);

    if (!artifacts || artifacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Artifact Not Found to Delete",
      });
    }

    const deletePromises: Promise<any>[] = [];
    const artifact = artifacts[0];
    let imageFileUrls: string[] = [];
    try {
      imageFileUrls =
        typeof artifact.images === "string"
          ? JSON.parse(artifact.images)
          : artifact.images;
    } catch (e) {
      console.error("Failed to parse images JSON:", e);
    }
    if (Array.isArray(imageFileUrls)) {
      for (const imgUrl of imageFileUrls) {
        const key = extractKeyFromUrl(imgUrl);
        if (key) {
          deletePromises.push(
            deleteBuffer(key).catch((err) =>
              console.error(`Failed to delete image ${key} from R2:`, err),
            ),
          );
        }
      }
    }

    const deliverableUrl = artifact.deliverable_files;
    if (deliverableUrl) {
      const key = extractKeyFromUrl(deliverableUrl);
      if (key) {
        deletePromises.push(
          deleteBuffer(key).catch((err) =>
            console.error(`Failed to delete deliverable ${key} from R2:`, err),
          ),
        );
      }
    }

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
    await query("DELETE FROM artifacts WHERE id = ? AND by_artist = ?", [
      id,
      artist,
    ]);
    return res.status(200).json({
      success: true,
      message: "Artifact deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};
