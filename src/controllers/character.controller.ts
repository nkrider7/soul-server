import { Request, Response } from "express";
import { characterValidation } from "../validation/character.validation";
import { prisma } from "..";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import z from "zod";

const createCharacter = async (req: Request, res: Response) => {
  try {
    const { image, fullImage, bgImage, animatedImage } = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!image || !fullImage || !bgImage || !animatedImage) {
      return res.status(400).json({ error: "All image fields are required" });
    }

    const { success, error, data } = characterValidation.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ error: z.prettifyError(error) });
    }

    const imageUrls = await Promise.all([
      uploadOnCloudinary(image[0]?.path),
      uploadOnCloudinary(fullImage[0]?.path),
      uploadOnCloudinary(bgImage[0]?.path),
      uploadOnCloudinary(animatedImage[0]?.path),
    ]);

    if (!imageUrls) {
      return res.status(400).json({ error: "Failed to upload images" });
    }

    const characterData = {
      image: imageUrls[0] as string,
      fullImage: imageUrls[1] as string,
      bgImage: imageUrls[2] as string,
      animatedImage: imageUrls[3] as string,
      ...data,
    };

    const character = await prisma.character.create({
      data: characterData,
    });

    res.status(201).json({ message: "Character created successfully", character });

  } catch (error) {
    console.error("Error creating character:", error);
    res.status(400).json({ error: "Failed to create character" });
  }
};

const updateCharacter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { image, fullImage, bgImage, animatedImage } = req.files as { [fieldname: string]: Express.Multer.File[] };

    const character = await prisma.character.findUnique({
      where: { id }
    });
    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }

    let updatedImage = "";
    let updatedFullImage = "";
    let updatedBgImage = "";
    let updatedAnimatedImage = "";

    if (image) {
      updatedImage = await uploadOnCloudinary(image[0]?.path) as string;
      if (updatedImage) {
        await deleteOnCloudinary(character?.image || "");
      }
    }

    if (fullImage) {
      updatedFullImage = await uploadOnCloudinary(fullImage[0]?.path) as string;
      if (updatedFullImage) {
        await deleteOnCloudinary(character?.fullImage || "");
      }
    }

    if (bgImage) {
      updatedBgImage = await uploadOnCloudinary(bgImage[0]?.path) as string;
      if (updatedBgImage) {
        await deleteOnCloudinary(character?.bgImage || "");
      }
    }

    if (animatedImage) {
      updatedAnimatedImage = await uploadOnCloudinary(animatedImage[0]?.path) as string;
      if (updatedAnimatedImage) {
        await deleteOnCloudinary(character?.animatedImage || "");
      }
    }

    const { success, error, data } = characterValidation.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ error: z.prettifyError(error) });
    }

    const updatedCharacterData = {
      ...data,
      image: updatedImage || character.image,
      fullImage: updatedFullImage || character.fullImage,
      bgImage: updatedBgImage || character.bgImage,
      animatedImage: updatedAnimatedImage || character.animatedImage,
    }

    await prisma.character.update({
      where: { id },
      data: updatedCharacterData
    });

    res.status(200).json({ message: "Character updated successfully", character });

  } catch (error) {
    res.status(400).json({ error: "Failed to update character" });
  }
};

const deleteCharacter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const character = await prisma.character.findUnique({
      where: { id }
    });
    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }

    await deleteOnCloudinary(character?.image || "");
    await deleteOnCloudinary(character?.fullImage || "");
    await deleteOnCloudinary(character?.bgImage || "");
    await deleteOnCloudinary(character?.animatedImage || "");

    await prisma.character.delete({
      where: { id }
    });
    res.status(200).json({ message: "Character deleted successfully" });

  } catch (error) {
    res.status(400).json({ error: "Failed to delete character" });
  }
};

const getCharacter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const character = await prisma.character.findUnique({
      where: { id }
    });
    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }

    res.status(200).json({ character });

  } catch (error) {
    res.status(400).json({ error: "Failed to retrieve character" });
  }
};


const getCharacters = async (req: Request, res: Response) => {
  try {
    const characters = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        title: true,
        gender: true,
        element: true,
        personality: true,
        powers: true,
        image: true,
        fullImage: true,
        bgImage: true,
      }
    });
    res.status(200).json({ characters });
  } catch (error) {
    res.status(400).json({ error: "Failed to retrieve characters" });
  }
};

export { createCharacter, updateCharacter, deleteCharacter, getCharacter, getCharacters };
