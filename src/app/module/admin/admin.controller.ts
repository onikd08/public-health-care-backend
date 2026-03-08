import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import AdminService from "./admin.service";
import sendResponse from "../../shared/sendResponse";
import { IRequestUser } from "../../interfaces/requestUser.interface";

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

const updateAdminById = catchAsync(async (req: Request, res: Response) => {
  const admin = await AdminService.updateAdminById(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin updated successfully",
    data: admin,
  });
});

const deleteAdminById = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminService.deleteAdminById(
    req.params.id as string,
    req.user as IRequestUser,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin deleted successfully",
    data,
  });
});

const AdminController = {
  getAllAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
};

export default AdminController;
