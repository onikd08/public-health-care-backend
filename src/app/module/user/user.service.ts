import status from "http-status";
import { Specialty, UserRole } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctor } from "./user.interface";

const createDoctor = async (payload: ICreateDoctor) => {
  const specialties: Specialty[] = [];

  // find specialties
  for (const specialtyId of payload.specialties) {
    const specialtyData = await prisma.specialty.findUnique({
      where: {
        id: specialtyId,
      },
    });

    if (!specialtyData) {
      throw new AppError(status.NOT_FOUND, "Specialty not found");
    }
    specialties.push(specialtyData);
  }

  // Check user already exists
  const user = await prisma.user.findUnique({
    where: {
      email: payload.doctor.email,
    },
  });

  if (user) {
    throw new AppError(status.CONFLICT, "User already exists");
  }

  // register user
  const registerUser = await auth.api.signUpEmail({
    body: {
      name: payload.doctor.name,
      email: payload.doctor.email,
      password: payload.password,
      role: UserRole.DOCTOR,
      status: "ACTIVE",
      needPasswordChange: true,
      isDeleted: false,
    },
  });

  if (!registerUser.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register user");
  }

  // create doctor
  try {
    const result = await prisma.$transaction(async (tx) => {
      const doctorData = await tx.doctor.create({
        data: {
          userId: registerUser.user.id,
          ...payload.doctor,
        },
      });

      const doctorSpecialtiesData = specialties.map((specialty) => {
        return {
          doctorId: doctorData.id,
          specialtyId: specialty.id,
        };
      });

      await tx.doctorSpecialty.createMany({
        data: doctorSpecialtiesData,
      });

      const doctor = await tx.doctor.findUnique({
        where: {
          id: doctorData.id,
        },
        include: {
          user: true,
          specialties: {
            include: {
              specialty: true,
            },
          },
        },
      });

      return doctor;
    });

    return result;
  } catch (error) {
    console.log("Transaction error: ", error);
    await prisma.user.delete({
      where: {
        id: registerUser.user.id,
      },
    });
    throw error;
  }
};

const UserService = {
  createDoctor,
};

export default UserService;
