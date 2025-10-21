import * as admin from "firebase-admin";
import { prisma } from "..";
import { NextFunction, Request, Response } from "express";

const serviceAccount = require("../utils/soulserver_firebase_admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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

    const { uid, email, email_verified } = await admin.auth().verifyIdToken(idToken);

    const user = await prisma.user.findUnique({ where: { id: uid } });
    console.log(user)

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
