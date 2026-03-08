import { Router } from "express";
import DoctorController from "./doctor.controller";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";
import { updateDoctorZodSchema } from "./doctor.validation";

const router = Router();

router.get("/", DoctorController.getAllDoctors);
router.get("/:id", DoctorController.getDoctorById);

router.put(
  "/:id",
  validateRequest(updateDoctorZodSchema),
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.updateDoctorById,
);

router.delete(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.deleteDoctorById,
);

const DoctorRoutes = router;

export default DoctorRoutes;
