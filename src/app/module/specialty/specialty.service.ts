import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
  const specialty = await prisma.specialty.create({
    data: payload,
  });

  return specialty;
};

const getAllSpecialties = async (): Promise<Specialty[]> => {
  return await prisma.specialty.findMany();
};

const deleteSpecialty = async (id: string): Promise<Specialty> => {
  return await prisma.specialty.delete({
    where: {
      id,
    },
  });
};

const updateSpecialty = async (
  id: string,
  payload: Specialty,
): Promise<Specialty> => {
  return await prisma.specialty.update({
    where: {
      id,
    },
    data: {
      ...payload,
    },
  });
};

export const SpecialtyService = {
  createSpecialty,
  getAllSpecialties,
  deleteSpecialty,
  updateSpecialty,
};
