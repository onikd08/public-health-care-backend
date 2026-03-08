import z from "zod";

export const updateAdminZodValidation = z.object({
  admin: z.object({
    name: z
      .string("Name is required and must be string")
      .min(5, "Name must be at least 5 characters")
      .max(30, "Name must be at most 30 characters")
      .optional(),
    contactNumber: z
      .string("Contact number is required")
      .min(11, "Contact number must be at least 11 characters")
      .max(14, "Contact number must be at most 15 characters")
      .optional(),
    profilePhoto: z.url("Profile photo must be a valid URL").optional(),
  }),
});
