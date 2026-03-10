import status from "http-status";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import tokenUtils from "../../utils/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import jwtUtils from "../../utils/jwt";
import envVars from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { IChangePasswordPayload, IRegisterPatient } from "./auth.interface";

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
    throw new AppError(status.NOT_FOUND, "User is Deleted");
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
          appointments: true,
          prescriptions: true,
          reviews: true,
        },
      },
      admin: true,
      patient: {
        include: {
          appointments: true,
          prescriptions: true,
          reviews: true,
          medicalReports: true,
          patientHealthData: true,
        },
      },
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return isUserExists;
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
  });

  if (!isSessionTokenExists) {
    throw new AppError(status.UNAUTHORIZED, "Session token not found");
  }

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );

  if (!verifiedRefreshToken.success) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    email: data.email,
    role: data.role,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
    name: data.name,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    email: data.email,
    role: data.role,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
    name: data.name,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
};

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Session token not found");
  }

  await auth.api.changePassword({
    body: {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
    name: session.user.name,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
    name: session.user.name,
  });

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
  return {
    accessToken,
    refreshToken,
    ...user,
  };
};

/*

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  // look up the session so we know the user
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Session token not found");
  }

  // look up the credential account for this user and read the password hash
  const credentialAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "credential",
    },
    select: { password: true, id: true },
  });
  if (!credentialAccount || !credentialAccount.password) {
    throw new AppError(status.BAD_REQUEST, "Unable to verify current password");
  }

  const validPassword = await verifyPassword({
    hash: credentialAccount.password,
    password: payload.currentPassword,
  });
  if (!validPassword) {
    throw new AppError(status.BAD_REQUEST, "Current password is incorrect");
  }

  // hash the new password and update the account record directly
  const newHash = await hashPassword(payload.newPassword);
  await prisma.account.update({
    where: { id: credentialAccount.id },
    data: { password: newHash },
  });

  // revoke other sessions if requested
  if (payload.revokeOtherSessions) {
    await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        token: { not: session.token },
      },
    });
  }

  // produce fresh access/refresh tokens for the caller
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
    name: session.user.name,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
    name: session.user.name,
  });

  // mirror the shape of the original API response; token field not needed
  return {
    accessToken,
    refreshToken,
    status: true,
  };
};

*/

const logoutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });
  return result;
};

const verifyEmail = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });

  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
      },
    });
  }
};

const forgetPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!user.emailVerified) {
    throw new AppError(
      status.BAD_REQUEST,
      "Email is not verified, please verify your email first",
    );
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(status.FORBIDDEN, "User is not ACTIVE");
  }

  if (user.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User is Deleted");
  }

  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });
};

const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!user.emailVerified) {
    throw new AppError(
      status.BAD_REQUEST,
      "Email is not verified, please verify your email first",
    );
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(status.FORBIDDEN, "User is not ACTIVE");
  }

  if (user.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User is Deleted");
  }

  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  if (user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  await prisma.session.deleteMany({
    where: {
      userId: user.id,
    },
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleLoginSuccess = async (session: Record<string, any>) => {
  const isPatientExists = await prisma.patient.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!isPatientExists) {
    await prisma.patient.create({
      data: {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  logoutUser,
  changePassword,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess,
};
