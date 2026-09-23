import { z } from "zod";
import type {
  UserRole,
  PaymentStatus,
  User,
  Artifact,
  Order,
  CreateUserInput,
  CreateArtifactInput,
  CreateOrderInput,
} from "../models/schema.types.ts";

// ==========================================
// 1. Enums / Literal Schemas
// ==========================================
export const userRoleSchema = z.union([
  z.literal("buyer"),
  z.literal("artist"),
  z.literal("admin"),
  z.string(),
]) as z.ZodType<UserRole>;

export const paymentStatusSchema = z.union([
  z.literal("pending_seller_confirmation"),
  z.literal("confirmed"),
  z.literal("rejected"),
  z.literal("failed"),
  z.string(),
]) as z.ZodType<PaymentStatus>;

// ==========================================
// 2. Base Entity Schemas
// ==========================================
export const userSchema: z.ZodType<User> = z.object({
  id: z.string().uuid(),
  emailId: z.string().email(),
  otp: z.string(),
  otp_expires_at: z.coerce.date(),
  upiId: z.string().nullable(),
  role: userRoleSchema,
  username: z.string().nullable(),
  profilePhoto: z.string().url().nullable(),
  waNumber: z.string().nullable(),
  description: z.string().nullable(),
  socials: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const artifactSchema: z.ZodType<Artifact> = z.object({
  id: z.string().uuid(),
  byArtist: z.string().uuid(),
  slug: z.string().min(1),
  images: z.string(),
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string(),
  amount: z.number().int().nonnegative(),
  deliverableFileFormats: z.string(),
  deliverableFiles: z.string(),
  isPublished: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const orderSchema: z.ZodType<Order> = z.object({
  id: z.string().uuid(),
  artifactId: z.string().uuid(),
  soldById: z.string().uuid(),
  boughtById: z.string().uuid(),
  sellerUpiId: z.string().min(1),
  buyerUpiId: z.string().min(1),
  amount: z.number().int().positive(),
  utrNumber: z.string().min(1),
  paymentStatus: paymentStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
