import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import UserService from "./user.service";
import sendResponse from "../../shared/sendResponse";
import status from "http-status";

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const data = await UserService.createDoctor(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Doctor created successfully",
    data,
  });
});

const UserController = {
  createDoctor,
};

export default UserController;
