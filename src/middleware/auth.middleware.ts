import * as admin from "firebase-admin";
import { prisma } from "..";
import { NextFunction, Request, Response } from "express";

// Initialize Firebase Admin SDK (should be done once globally)
admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-admin.json")),
  // optional: databaseURL if needed
});

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split(" ")[1];

    const { uid, email } = await admin.auth().verifyIdToken(idToken);

    const user = await prisma.profile.findUnique({
      where: { userId: uid },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
