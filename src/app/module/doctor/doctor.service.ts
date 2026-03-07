import { prisma } from "../../lib/prisma";

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
    throw new Error("Doctor not found");
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
    throw new Error("Doctor not found");
  }

  const result = await prisma.doctor.delete({
    where: {
      id,
    },
  });

  return result;
};

const DoctorService = {
  getAllDoctors,
  getDoctorById,
  deleteDoctorById,
};

export default DoctorService;
