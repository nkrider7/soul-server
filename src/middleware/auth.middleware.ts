import { prisma } from "../index";
import { NextFunction, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

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

    const accessToken = authHeader.split(" ")[1];

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Create a Supabase client with the token for verification
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // Verify the token with Supabase
    const { data: { user: supabaseUser }, error } = await supabaseClient.auth.getUser(accessToken);

    if (error || !supabaseUser) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Find user in database using Supabase user ID
    const user = await prisma.user.findUnique({ where: { id: supabaseUser.id } });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
