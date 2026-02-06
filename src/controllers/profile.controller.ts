import { Request, Response } from "express";
import { prisma } from "../index";
import { createProfileSchema, updateProfileSchema } from "../validation/profile.validation";
import { z } from "zod";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    return res.status(200).json({
      message: "Profile fetched successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get profile" });
  }
};

export const createProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      return res.status(400).json({ error: "Profile already exists for this user" });
    }

    const { success, data, error } = createProfileSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ error: error.errors });
    }

    const profile = await prisma.profile.create({
      data: {
        ...data,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to create profile" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const { success, data, error } = updateProfileSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ error: error.errors });
    }

    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: data,
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update profile" });
  }
};
