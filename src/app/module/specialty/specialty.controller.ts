import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";

const createSpecialty = async (req: Request, res: Response) => {
  const payload = req.body;

  const specialty = await SpecialtyService.createSpecialty(payload);

  res.status(201).json({
    success: true,
    message: "Specialty created successfully",
    data: specialty,
  });
};

export const SpecialtyController = {
  createSpecialty,
};
