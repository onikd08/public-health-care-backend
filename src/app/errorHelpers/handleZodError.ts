import status from "http-status";
import z from "zod";
import { IErrorResponse, IErrorSources } from "../interfaces/error.interface";

export default function handleZodError(error: z.ZodError): IErrorResponse {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources: IErrorSources[] = [];

  error.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message,
    });
  });

  return {
    success: false,
    statusCode,
    message,
    errorSources,
  };
}
