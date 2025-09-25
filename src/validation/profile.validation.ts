import { z } from "zod";

export const createProfileSchema = z.object({
  fullname: z.string().min(3),
  dateOfBirth: z.string().transform((val) => new Date(val)),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  height: z.number(),
  weight: z.number(),
  avatar: z.string().optional(),
});

export const updateProfileSchema = z.object({
  fullname: z.string().min(3).optional(),
  character: z.string().optional(),
  dateOfBirth: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  avatar: z.string().optional(),
  level: z.number().optional(),
  xp: z.number().optional(),
  stats: z
    .object({
      strength: z.number(),
      intelligence: z.number(),
      karma: z.number(),
      stamina: z.number(),
    })
    .optional(),
  rank: z.enum(["E", "D", "C", "B", "A", "S"]).optional(),
  streak: z.number().optional(),
  maxStreak: z.number().optional(),
});
