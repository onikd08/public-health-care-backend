import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../generated/prisma/enums";
import { IUpdateDoctorPayload } from "./doctor.interface";

const getAllDoctors = async () => {
  return await prisma.doctor.findMany({
    include: {
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
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

  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  return doctor;
};

const deleteDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });

  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }
  await prisma.$transaction(async (tx) => {
    await tx.doctor.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: {
        id: doctor.userId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: {
        userId: doctor.userId,
      },
    });

    await tx.doctorSpecialty.deleteMany({
      where: {
        doctorId: id,
      },
    });
  });

  return { message: "Doctor deleted successfully" };
};

const updateDoctorById = async (id: string, payload: IUpdateDoctorPayload) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });

  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  const { doctor: doctorPayload, specialties } = payload;

  await prisma.$transaction(async (tx) => {
    if (doctorPayload) {
      await tx.doctor.update({
        where: {
          id,
        },
        data: {
          ...doctorPayload,
        },
      });
    }

    if (specialties && specialties.length > 0) {
      for (const specialty of specialties) {
        const { specialtyId, shouldDelete } = specialty;

        if (shouldDelete) {
          await tx.doctorSpecialty.delete({
            where: {
              specialtyId_doctorId: {
                specialtyId,
                doctorId: id,
              },
            },
          });
        } else {
          await tx.doctorSpecialty.upsert({
            where: {
              specialtyId_doctorId: {
                specialtyId,
                doctorId: id,
              },
            },
            create: {
              specialtyId,
              doctorId: id,
            },
            update: {},
          });
        }
      }
    }
  });

  const doctorData = await getDoctorById(id);

  return doctorData;
};

const DoctorService = {
  getAllDoctors,
  getDoctorById,
  deleteDoctorById,
  updateDoctorById,
};

export default DoctorService;
