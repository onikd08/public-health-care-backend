import { Router } from "express";
import UserController from "./user.controller";
import validateRequest from "../../middleware/validateRequest";
import { createAdminZodSchema, createDoctorZodSchema } from "./user.validation";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/create-doctor",
  validateRequest(createDoctorZodSchema),
  UserController.createDoctor,
);

router.post(
  "/create-admin",
  validateRequest(createAdminZodSchema),
  checkAuth(UserRole.SUPER_ADMIN),
  UserController.createAdmin,
);

export const UserRoutes = router;
