import type { NextFunction, Request, Response } from "express";
import z from "zod";
import type { ValidationOptions } from "../types/artifacts.ts";

declare global {
  namespace Express {
    interface Request {
      validatedQuery: any;
    }
  }
}

export const validate =
  (schema: z.ZodType, options: ValidationOptions = {}) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate: Record<string, any> = {
      ...(options.mode === "query" ? req.query : req.body || {}),
    };

    if (options.includeFiles) {
      if (req.file) {
        dataToValidate[req.file.fieldname] = req.file;
      }

      if (req.files) {
        if (Array.isArray(req.files)) {
          if (req.files.length > 0) {
            dataToValidate[req.files[0].fieldname] = req.files;
          }
        } else {
          for (const [fieldname, filesArray] of Object.entries(req.files)) {
            dataToValidate[fieldname] =
              filesArray.length === 1 ? filesArray[0] : filesArray;
          }
        }
      }
    }

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: result.error.issues,
      });
    }

    if (options.includeFiles) {
      const parsedBody = { ...(result.data as Record<string, any>) };
      if (req.file) delete parsedBody[req.file.fieldname];
      if (req.files) {
        if (Array.isArray(req.files) && req.files.length > 0) {
          delete parsedBody[req.files[0].fieldname];
        } else {
          Object.keys(req.files).forEach((key) => delete parsedBody[key]);
        }
      }
      req.body = parsedBody;
    } else {
      if (options.mode === "query") {
        req.validatedQuery = result.data;
      } else {
        req.body = result.data;
      }
    }

    next();
  };
