/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import envVars from "../../config/env";
import status from "http-status";
import z from "zod";
import handleZodError from "../errorHelpers/handleZodError";
import { IErrorResponse, IErrorSources } from "../interfaces/error.interface";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler: ", error);
  }

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  const errorSources: IErrorSources[] = [];

  if (error instanceof z.ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources.push(...simplifiedError.errorSources);
  }

  const errorResponse: IErrorResponse = {
    success: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? error : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
