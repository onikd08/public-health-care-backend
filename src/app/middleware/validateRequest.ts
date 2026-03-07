import { NextFunction, Request, Response } from "express";
import z from "zod";

export default function validateRequest(zodSchema: z.ZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }

    const result = zodSchema.safeParse(req.body);

    if (!result.success) {
      next(result.error);
    } else {
      req.body = result.data; // sanitize input

      next();
    }
  };
}
