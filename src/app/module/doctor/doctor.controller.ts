import status from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import DoctorService from "./doctor.service";
import { Request, Response } from "express";

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const doctors = await DoctorService.getAllDoctors();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctors fetched successfully",
    data: doctors,
  });
});

const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const doctor = await DoctorService.getDoctorById(req.params.id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor fetched successfully",
    data: doctor,
  });
});

const DoctorController = {
  getAllDoctors,
  getDoctorById,
};

export default DoctorController;
