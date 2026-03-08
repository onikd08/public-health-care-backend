import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const getAllAdmins = async () => {
  return await prisma.admin.findMany({
    include: {
      user: true,
    },
  });
};

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  return admin;
};

const AdminService = {
  getAllAdmins,
  getAdminById,
};

export default AdminService;
