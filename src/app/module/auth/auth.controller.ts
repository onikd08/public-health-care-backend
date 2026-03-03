import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import sendResponse from "../../shared/sendResponse";
import status from "http-status";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const data = await AuthService.registerPatient(payload);
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
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data,
  });
});

export const AuthController = {
  registerPatient,
  loginUser,
};
