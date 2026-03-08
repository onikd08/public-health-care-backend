import status from "http-status";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import tokenUtils from "../../utils/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";

interface IRegisterPatient {
  name: string;
  email: string;
  password: string;
}

const registerPatient = async (payload: IRegisterPatient) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      role: UserRole.PATIENT,
      status: "ACTIVE",
      needPasswordChange: false,
      isDeleted: false,
    },
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register patient");
  }

  try {
    const patient = await prisma.$transaction(async (tx) => {
      return await tx.patient.create({
        data: {
          name: data.user.name,
          email: data.user.email,
          userId: data.user.id,
        },
      });
    });

    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
      name: data.user.name,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
      name: data.user.name,
    });

    return { accessToken, refreshToken, patient, ...data };
  } catch (error) {
    console.log(error);
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw error;
  }
};

const loginUser = async (email: string, password: string) => {
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to login");
  }

  if (data.user.status !== UserStatus.ACTIVE) {
    throw new AppError(status.FORBIDDEN, "User is not ACTIVE");
  }

  if (data.user.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User is not Deleted");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
    name: data.user.name,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
    name: data.user.name,
  });

  return {
    accessToken,
    refreshToken,
    ...data,
  };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      doctor: {
        include: {
          specialties: true,
        },
      },
      admin: true,
      patient: true,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return isUserExists;
};

export const AuthService = {
  registerPatient,
  loginUser,
  getMe,
};
