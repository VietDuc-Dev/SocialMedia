import { z } from "zod";
import { GenderEnum } from "../enums/user.enum";

export const userIdSchema = z.string().trim().min(1);

export const usernameSchema = z.string().trim().min(1).max(255);

export const bioSchema = z.string().trim().min(1).max(255);

export const genderSchema = z.enum(
  Object.values(GenderEnum) as [string, ...string[]]
);

export const fileSchema = z.object({
  originalname: z.string().min(1),
  mimetype: z.string().regex(/^image\/(png|jpeg|jpg|webp)$/i, {
    message: "Only PNG, JPEG, JPG, WEBP files are allowed",
  }),
  size: z.number().max(5 * 1024 * 1024, {
    message: "File must be smaller than 5MB",
  }),
  buffer: z.instanceof(Buffer),
});

export const updateProfileSchema = z
  .object({
    username: usernameSchema,
    bio: bioSchema,
    gender: genderSchema,
    file: fileSchema.optional(),
  })
  .partial();
