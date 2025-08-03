import z from "zod";

export const challengeValidation = z.object({
  name: z.string().min(1, "Challenge name is required"),
  description: z.string().min(1, "Challenge description is required"),
  category: z.enum(["fitness", "nutrition", "mental"], {
    error: () => ({ message: "Invalid challenge category" }),
  }),
  difficulty: z.enum(["easy", "medium", "hard"], {
    error: () => ({ message: "Invalid challenge difficulty" }),
  }),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  start: z.string().refine((date) => {
    return new Date(date);
  }, "Invalid start date format"),
  end: z.string().refine((date) => {
    return new Date(date);
  }, "Invalid end date format"),
  status: z.enum(["active", "completed", "expired"], {
    error: () => ({ message: "Invalid challenge status" }),
  }),
  image: z.string().url().optional(),
  // tags: z.array(z.string()).optional(),
  createdBy: z.string().min(1, "Creator ID is required"),
  rewards: z.object({
    xp: z.number().optional(),
    coins: z.number().optional(),
    stat: z
      .object({
        stamina: z.number().optional(),
        intelligence: z.number().optional(),
        strength: z.number().optional(),
      })
      .optional(),
  }),
});
// .refine((data) => {
//   if (data.start > data.end) {
//     return {
//       message: "Start date must be before end date",
//     };
//   }
// });

export const updateChallengeValidation = challengeValidation.partial().refine((data) => {
  if (data.start && data.end && data.start > data.end) {
    return {
      message: "Start date must be before end date",
    };
  }
  return true;
});
