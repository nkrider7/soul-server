import { z } from "zod";

export const onboardSchema = z.object({
  uid: z.string(),
  email: z.email(),
});
