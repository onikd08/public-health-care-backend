import { Router } from "express";
import { AuthController } from "./auth.controller";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", AuthController.registerPatient);
router.post("/login", AuthController.loginUser);
router.get(
  "/me",
  checkAuth(
    UserRole.PATIENT,
    UserRole.DOCTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  AuthController.getMe,
);

router.post("/refresh-token", AuthController.getNewToken);

router.post(
  "/logout",
  checkAuth(
    UserRole.PATIENT,
    UserRole.DOCTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  AuthController.logoutUser,
);

router.post(
  "/change-password",
  checkAuth(
    UserRole.PATIENT,
    UserRole.DOCTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  AuthController.changePassword,
);

router.post("/verify-email", AuthController.verifyEmail);

export const AuthRoutes = router;
