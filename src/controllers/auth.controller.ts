import { Request, Response } from "express";
import { prisma } from "../index";
import { onboardSchema } from "../validation/onboard.validation";

export const onboardUser = async (req: Request, res: Response) => {
  try {
    const { uid, email, authToken } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: "Missing UID or email" });
    }

    const { success, data, error } = onboardSchema.safeParse({ uid, email, authToken });

    if (!success) {
      return res.status(400).json({ error: error.flatten().fieldErrors });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const userProfile = await prisma.profile.findUnique({
      where: { userId: uid },
    });

    if (existingUser) {
      return res.status(200).json({ message: "User already exists", user: userProfile });
    }

    // Create new user with default XP, stats, level, etc.
    const newUser = await prisma.user.create({
      data: {
        id: uid,
        email,
        authToken,
      },
    });

    return res.status(201).json({ message: "User onboarded", user: newUser });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
