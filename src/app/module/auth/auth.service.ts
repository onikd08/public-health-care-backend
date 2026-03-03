import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";

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
    throw new Error("Failed to register patient");
  }

  return data;
};

const loginUser = async (email: string, password: string) => {
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (!data.user) {
    throw new Error("Failed to login");
  }

  if (data.user.status !== UserStatus.ACTIVE) {
    throw new Error("User is not active");
  }

  if (data.user.isDeleted) {
    throw new Error("User is deleted");
  }

  return data;
};

export const AuthService = {
  registerPatient,
  loginUser,
};
