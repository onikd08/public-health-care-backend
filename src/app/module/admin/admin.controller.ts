import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import AdminService from "./admin.service";
import sendResponse from "../../shared/sendResponse";

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const admins = await AdminService.getAllAdmins();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admins fetched successfully",
    data: admins,
  });
});

const getAdminById = catchAsync(async (req: Request, res: Response) => {
  const admin = await AdminService.getAdminById(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin fetched successfully",
    data: admin,
  });
});

const AdminController = {
  getAllAdmins,
  getAdminById,
};

export default AdminController;
