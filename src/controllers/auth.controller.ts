import { Request, Response } from "express";
import { prisma } from "../index";
import { onboardSchema } from "../validation/onboard.validation";
import { getAuth, Auth } from "firebase-admin/auth";
import axios from "axios";

export const onboardUser = async (req: Request, res: Response) => {
  try {
    const { uid, email } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: "Missing UID or email" });
    }

    const { success, error } = onboardSchema.safeParse({ uid, email, });

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
      }
    });

    return res.status(201).json({ message: "User onboarded", user: newUser });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};



export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Step 1: Use Firebase REST API to verify credentials (Admin SDK doesn't provide password login)
   const apiKey = "AIzaSyCEBZhZJvW9uW1hoBc1G-6ioSyQ6R4t48U";
    if (!apiKey) {
      console.error("FIREBASE_WEB_API_KEY is not set in your .env file.");
      return res.status(500).json({ error: "Server configuration error." });
    }

    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    const response = await axios.post(authUrl, {
      email,
      password,
      returnSecureToken: true,
    });

    const { localId } = response.data;

    // Step 2: Fetch the user record from Firebase
    const userRecord = await getAuth().getUser(localId);

    // Step 3: Create a custom token (same style as signup)
    const customToken = await getAuth().createCustomToken(userRecord.uid);

    return res.status(200).json({
      message: "Login successful",
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || "user",
      photoURL: userRecord.photoURL || null,
      token: customToken,
    });

  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message || "Authentication failed.";

    if (errorMessage.includes("INVALID_PASSWORD") || errorMessage.includes("EMAIL_NOT_FOUND")) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    console.error("Firebase Login Error:", errorMessage);
    return res.status(500).json({ error: "An internal error occurred during login." });
  }
};



export const signupUser = async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Step 1: Create the user in Firebase Authentication
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName,
    });

    // Step 2: Generate a custom token for the new user
    const customToken = await getAuth().createCustomToken(userRecord.uid);

    // Step 3: Return the user info, including displayName, and the custom token
    return res.status(201).json({
      message: "User created successfully.",
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || 'user',
      token: customToken,
    });

  } catch (error: any) {
    console.error("Signup Error:", error);

    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: "This email address is already in use." });
    }
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ error: "Password is too weak. It must be at least 6 characters long." });
    }

    return res.status(500).json({ error: "An internal error occurred during signup." });
  }
};