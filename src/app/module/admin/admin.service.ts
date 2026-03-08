import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateAdminPayload } from "./admin.interface";
import { UserStatus } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const getAllAdmins = async () => {
  return await prisma.admin.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      user: true,
    },
  });
};

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findFirst({
    where: {
      id,
      isDeleted: false,
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

const updateAdminById = async (id: string, payload: IUpdateAdminPayload) => {
  const adminData = await prisma.admin.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!adminData) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  if (payload.admin) {
    await prisma.admin.update({
      where: {
        id,
      },
      data: {
        ...payload.admin,
      },
    });
  }

  const admin = await getAdminById(id);
  return admin;
};

const deleteAdminById = async (id: string, user: IRequestUser) => {
  const admin = await prisma.admin.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
    },
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  // check if admin is trying to delete themselves
  if (admin.id === user.userId) {
    throw new AppError(status.FORBIDDEN, "You can't delete yourself");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.admin.update({
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
          id: admin.userId,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          status: UserStatus.DELETED,
        },
      });

      await tx.session.deleteMany({
        where: {
          userId: admin.userId,
        },
      });

      await tx.account.deleteMany({
        where: {
          userId: admin.userId,
        },
      });
    });

    const result = await getAdminById(id);
    return result;
  } catch (error) {
    console.log("Transaction Error: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete admin");
  }
};

const AdminService = {
  getAllAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
};

export default AdminService;
