import { z } from "zod";

export const onboardSchema = z.object({
  uid: z.string().length(30),
  email: z.email(),
  authToken: z.string(),
});
