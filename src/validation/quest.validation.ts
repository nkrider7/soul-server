import z from "zod";

export const questValidationSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  currentDay: z.number().int().min(1).optional(),
  totalDays: z.number().int().min(1),
  start: z.string().refine((date) => new Date(date)),
  end: z.string().refine((date) => new Date(date)),
  repeat: z.enum(["DAILY", "ALTERNATE_DAYS", "WEEKDAYS", "WEEKENDS", "WEEKLY"]),
  type: z.string().min(1).max(50),
  status: z.enum(["cancelled", "in-progress", "completed"]),
  xpReward: z.number().int().min(0).optional(),
  coinReward: z.number().int().min(0).optional(),
  statReward: z
    .object({
      strength: z.number().int().min(0).optional(),
      agility: z.number().int().min(0).optional(),
      intelligence: z.number().int().min(0).optional(),
    })
    .optional(),
});

export const updateQuestValidationSchema = questValidationSchema.partial();
