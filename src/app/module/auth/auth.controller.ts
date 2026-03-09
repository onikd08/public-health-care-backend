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

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");
  const data = await AuthService.logoutUser(sessionToken);

  cookieUtils.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  cookieUtils.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  cookieUtils.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged out successfully",
    data,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");

  const data = await AuthService.changePassword(req.body, sessionToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await AuthService.verifyEmail(email, otp);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Email verified successfully",
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await AuthService.forgetPassword(email);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password reset OTP sent to email successfully",
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  await AuthService.resetPassword(email, otp, newPassword);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password reset successfully",
  });
});

export const AuthController = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  logoutUser,
  changePassword,
  verifyEmail,
  forgetPassword,
  resetPassword,
};
