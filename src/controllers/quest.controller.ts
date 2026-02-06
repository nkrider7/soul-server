import { Request, Response } from "express";
import { prisma } from "../index";
import { questValidationSchema, updateQuestValidationSchema } from "../validation/quest.validation";
import { z } from "zod";

const createQuest = async (req: Request, res: Response) => {
  try {
    const { success, data, error } = questValidationSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ error: error.issues });
    }

    const challengeId = req.params.challengeId;
    const challengeExists = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challengeExists) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Create the quest
    const newQuest = await prisma.challengeQuest.create({
      data: {
        ...data,
        challengeId,
      },
    });

    return res.status(201).json({
      message: "Quest created successfully",
      quest: newQuest,
    });
  } catch (error) {
    console.error("Error creating quest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateQuest = async (req: Request, res: Response) => {
  try {
    const { id, challengeId } = req.params;
    const challengeExists = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });
    if (!challengeExists) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    const { success, data, error } = updateQuestValidationSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ error: error.issues });
    }
    const quest = await prisma.challengeQuest.findUnique({
      where: { id },
    });
    if (!quest) {
      return res.status(404).json({ error: "Quest not found" });
    }
    const updatedQuest = await prisma.challengeQuest.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return res.status(200).json({
      message: "Quest updated successfully",
      quest: updatedQuest,
    });
  } catch (error) {
    console.error("Error updating quest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteQuest = async (req: Request, res: Response) => {
  try {
    const { id, challengeId } = req.params;
    const challengeExists = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });
    if (!challengeExists) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    const quest = await prisma.challengeQuest.findUnique({
      where: { id },
    });
    if (!quest) {
      return res.status(404).json({ error: "Quest not found" });
    }
    await prisma.challengeQuest.delete({
      where: { id },
    });
    return res.status(204).json({ message: "Quest deleted successfully" });
  } catch (error) {
    console.error("Error deleting quest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getQuest = async (req: Request, res: Response) => {
  try {
    const { id, challengeId } = req.params;
    const challengeExists = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });
    if (!challengeExists) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    const quest = await prisma.challengeQuest.findUnique({
      where: { id },
    });
    if (!quest) {
      return res.status(404).json({ error: "Quest not found" });
    }
    return res.status(200).json(quest);
  } catch (error) {
    console.error("Error fetching quest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllQuests = async (req: Request, res: Response) => {
  try {
    const challengeId = req.params.challengeId;
    const challengeExists = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challengeExists) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    const quests = await prisma.challengeQuest.findMany({ where: { challengeId } });
    return res.status(200).json(quests);
  } catch (error) {
    console.error("Error fetching quests:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export { createQuest, updateQuest, deleteQuest, getQuest, getAllQuests };
