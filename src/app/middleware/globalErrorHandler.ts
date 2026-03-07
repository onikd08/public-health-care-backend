/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import envVars from "../../config/env";
import status from "http-status";
import z from "zod";
import handleZodError from "../errorHelpers/handleZodError";
import { IErrorResponse, IErrorSources } from "../interfaces/error.interface";
import AppError from "../errorHelpers/AppError";

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
  let stack: string | undefined = undefined;
  let errorSources: IErrorSources[] = [];

  // prettier-ignore
  if (error instanceof z.ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources.push(...simplifiedError.errorSources);
    stack = error.stack;

  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    stack = error.stack;
    errorSources = [
      {
        path: "",
        message: error.message,
      },
    ]

  } else if (error instanceof Error) {
    message = error.message;
    stack = error.stack;
    errorSources = [
    {
        path: "",
        message: error.message,
      },
    ]
  }

  const errorResponse: IErrorResponse = {
    success: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? error : undefined,
    stack: envVars.NODE_ENV === "development" ? stack : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
