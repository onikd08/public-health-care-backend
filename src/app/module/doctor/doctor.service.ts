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

const DoctorService = {
  getAllDoctors,
};

export default DoctorService;
