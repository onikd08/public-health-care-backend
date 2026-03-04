import { Router } from "express";
import DoctorController from "./doctor.controller";

const router = Router();

router.get("/", DoctorController.getAllDoctors);

const DoctorRoutes = router;

export default DoctorRoutes;
