import z from "zod";

export const characterValidation = z.object({
  name: z.string().min(2).max(100),
  title: z.string().min(2).max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  element: z.string().min(2).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  personality: z.string().min(10).max(1000).optional(),
  backstory: z.string().min(10).max(1000).optional(),
  powers: z.array(z.string().min(2).max(100)),
  statsBoost: z.object({
    strength: z.coerce.number().min(0).default(0),
    intelligence: z.coerce.number().min(0).default(0),
    karma: z.coerce.number().min(0).default(0),
    stamina: z.coerce.number().min(0).default(0),
  }).optional()
})