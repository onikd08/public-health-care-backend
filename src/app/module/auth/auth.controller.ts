import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import sendResponse from "../../shared/sendResponse";
import status from "http-status";
import cookieUtils from "../../utils/cookie";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const data = await AuthService.registerPatient(payload);

  const { accessToken, refreshToken, token: betterAuthToken } = data;
  cookieUtils.setAccessTokenCookie(res, accessToken);
  cookieUtils.setRefreshTokenCookie(res, refreshToken);
  cookieUtils.setBetterAuthSessionCookie(res, betterAuthToken as string);
  sendResponse(res, {
    message: "Patient registered successfully",
    success: true,
    statusCode: status.CREATED,
    data,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = await AuthService.loginUser(email, password);

  const { accessToken, refreshToken, token: betterAuthToken } = data;

  cookieUtils.setAccessTokenCookie(res, accessToken);
  cookieUtils.setRefreshTokenCookie(res, refreshToken);
  cookieUtils.setBetterAuthSessionCookie(res, betterAuthToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = await AuthService.getMe(user as IRequestUser);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User fetched successfully",
    data,
  });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = cookieUtils.getCookie(req, "refreshToken");
  const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");

  const newTokens = await AuthService.getNewToken(refreshToken, sessionToken);

  cookieUtils.setAccessTokenCookie(res, newTokens.accessToken);
  cookieUtils.setRefreshTokenCookie(res, newTokens.refreshToken);
  cookieUtils.setBetterAuthSessionCookie(res, newTokens.sessionToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Token refreshed successfully",
    data: {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      sessionToken: newTokens.sessionToken,
    },
  });
});

export const AuthController = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
};
