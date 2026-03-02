import { Response } from "express";

interface IResponseData<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

export default function sendResponse<T>(
  res: Response,
  responseData: IResponseData<T>,
) {
  const { statusCode, success, message, data } = responseData;
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
}
