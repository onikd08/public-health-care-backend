import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
import envVars from "../../config/env";

// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
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

  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: () => {
        return {
          role: UserRole.PATIENT,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          isDeleted: false,
          emailVerified: true,
          deletedAt: null,
        };
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24, // 1 day
    // strategy: "database",
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day
    },
  },
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
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
                subject: "Verify you email",
              },
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (user) {
            sendEmail({
              to: email,
              subject: "Reset your password",
              templateName: "otp", // otp.ejs
              templateData: {
                name: user.name,
                otp,
                subject: "Reset your password",
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
