import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  //trustedOrigins: [envVars.BETTER_AUTH_URL || "http://localhost:4000"],
  //   advanced: {
  //     disableCSRFCheck: true,
  //   },
  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        default: UserRole.PATIENT,
      },
      status: {
        type: "string",
        required: true,
        default: UserStatus.ACTIVE,
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        default: false,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        default: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        default: null,
      },
    },
  },
});
