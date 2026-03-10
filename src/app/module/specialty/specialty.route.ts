import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { multerUpload } from "../../../config/multer.config";
import validateRequest from "../../middleware/validateRequest";
import { createSpecialtyZodSchema } from "./specialty.validation";

const router = Router();

router.post(
  "/",
  //checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(createSpecialtyZodSchema),
  SpecialtyController.createSpecialty,
);
router.get("/", SpecialtyController.getAllSpecialties);
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SpecialtyController.deleteSpecialty,
);
router.put(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SpecialtyController.updateSpecialty,
);

export const SpecialtyRoutes = router;
