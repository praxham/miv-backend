import express from "express";
import { validate } from "../middlewares/validate.middleware.ts";
import {
  getUsersSchema,
  updateUserSchema,
} from "../validations/user.validation.ts";
import {
  deleteUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";

const userRoutes = express.Router();

userRoutes.get("/", validate(getUsersSchema), getUsers);
userRoutes.patch("/", authenticate, validate(updateUserSchema), updateUser);
userRoutes.delete("/", authenticate, deleteUser);

export default userRoutes;
