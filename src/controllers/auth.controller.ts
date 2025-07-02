import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const onboardUser = async (req: Request, res: Response) => {
  const { uid, email, username, avatar } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: 'Missing UID or email' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (existingUser) {
      return res.status(200).json({ message: 'User already exists', user: existingUser });
    }

    // Create new user with default XP, stats, level, etc.
    const newUser = await prisma.user.create({
      data: {
        id: uid,
        email,
        username: username || 'player',
        avatar: avatar || '',
        level: 1,
        xp: 0,
        rank: 'Novice',
        stats: {
          strength: 1,
          intelligence: 1,
          agility: 1,
          stamina: 1,
        },
        currencies: {
          create: {
            coins: 0,
            gems: 0,
          },
        },
      },
      include: {
        currencies: true,
      },
    });

    return res.status(201).json({ message: 'User onboarded', user: newUser });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
