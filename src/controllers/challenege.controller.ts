import { Request, Response } from "express";
import { challengeValidation, updateChallengeValidation } from "../validation/challenge.validation";
import { prisma } from "..";
import z from "zod";

const createChallenge = async (req: Request, res: Response) => {
  try {
    const { success, data, error } = challengeValidation.safeParse(req.body);

    if (!success) {
      return res.status(400).json({ error: z.prettifyError(error) });
    }

    const userProfile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }
    const challenge = await prisma.challenge.create({
      data: {
        ...data,
        Profile: {
          connect: {
            id: userProfile.id,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return res.status(201).json({
      message: "Challenge created successfully",
      challenge,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create challenge" });
  }
};

const updateChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { success, data, error } = updateChallengeValidation.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ error: z.prettifyError(error) });
    }

    const userProfile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!existingChallenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    if (existingChallenge.profileId !== userProfile.id) {
      return res.status(403).json({ error: "You do not have permission to update this challenge" });
    }

    const challenge = await prisma.challenge.update({
      where: { id },
      data: {
        ...data,
        Profile: {
          connect: {
            id: userProfile.id,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Challenge updated successfully",
      challenge,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update challenge" });
  }
};

const getChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challenge = await prisma.challenge.findUnique({
      where: { id, createdBy: req.user.uid },
    });

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    return res.status(200).json({
      message: "Challenge retrieved successfully",
      challenge,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve challenge" });
  }
};

const getChallenges = async (req: Request, res: Response) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        createdBy: req.user.uid,
      },
    });

    return res.status(200).json({
      message: "Challenges retrieved successfully",
      challenges,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve challenges" });
  }
};

export { createChallenge, updateChallenge, getChallenge, getChallenges };
