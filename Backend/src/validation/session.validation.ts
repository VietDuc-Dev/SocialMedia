import { z } from "zod";

export const sessionSchema = z.string().trim().min(1);
