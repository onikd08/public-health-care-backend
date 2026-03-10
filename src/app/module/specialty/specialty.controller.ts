/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    icon: req.file?.path,
  };

  const specialty = await SpecialtyService.createSpecialty(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Specialty created successfully",
    data: specialty,
  });
});

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
  const specialties = await SpecialtyService.getAllSpecialties();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Specialties fetched successfully",
    data: specialties,
  });
});

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const specialty = await SpecialtyService.deleteSpecialty(id as string);
  res.status(200).json({
    success: true,
    message: "Specialty deleted successfully",
    data: specialty,
  });
});

const updateSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const specialty = await SpecialtyService.updateSpecialty(
    id as string,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: "Specialty updated successfully",
    data: specialty,
  });
});

export const SpecialtyController = {
  createSpecialty,
  getAllSpecialties,
  deleteSpecialty,
  updateSpecialty,
};
