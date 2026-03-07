import { NextFunction, Request, Response } from "express";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import cookieUtils from "../utils/cookie";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";

import jwtUtils from "../utils/jwt";
import envVars from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

export default function checkAuth(...roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Session token verification
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      if (!sessionToken) {
        throw new AppError(status.UNAUTHORIZED, "Session token not found");
      }

      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!sessionExists) {
        throw new AppError(status.UNAUTHORIZED, "Session token not found");
      }

      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;

        const now = new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);

        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeLeft = expiresAt.getTime() - now.getTime();
        const percentRemaining = (timeLeft / sessionLifeTime) * 100;

        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeLeft.toString());

          console.log("Session expiring soon");
        }

        if (user.status !== UserStatus.ACTIVE) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access! User is not active.",
          );
        }

        if (user.isDeleted) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access! User is Deleted.",
          );
        }

        if (roles.length > 0 && !roles.includes(user.role)) {
          throw new AppError(
            status.FORBIDDEN,
            "Forbidden access! You do not have permission to access this resource.",
          );
        }

        const accessToken = cookieUtils.getCookie(req, "accessToken");
        if (!accessToken) {
          throw new AppError(status.UNAUTHORIZED, "Access token not found");
        }
      }

      // access-token verification
      const accessToken = cookieUtils.getCookie(req, "accessToken");

      if (!accessToken) {
        throw new AppError(status.UNAUTHORIZED, "Access token not found");
      }
      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET,
      );

      if (!verifiedToken.success) {
        throw new AppError(status.UNAUTHORIZED, "Access token not found");
      }

      const { data } = verifiedToken as JwtPayload;

      if (roles.length > 0 && !roles.includes(data.role)) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource.",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
