import { Router } from "express";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import AdminController from "./admin.controller";
import validateRequest from "../../middleware/validateRequest";
import { updateAdminZodValidation } from "./admin.validation";

const router = Router();

router.get(
  "/",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.getAllAdmins,
);
router.get(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.getAdminById,
);

router.put(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN),
  validateRequest(updateAdminZodValidation),
  AdminController.updateAdminById,
);

router.delete(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN),
  AdminController.deleteAdminById,
);

const AdminRoutes = router;

export default AdminRoutes;
