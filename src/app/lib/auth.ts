import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";

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
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24, // 1 day
    strategy: "database",
    updateAge: 60 * 60, // 1 hour
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      expiresIn: 2 * 60,
      otpLength: 6,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify you email",
              templateName: "otp", // otp.ejs
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        }
      },
    }),
  ],
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
